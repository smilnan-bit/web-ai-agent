import React, { useEffect, useState } from 'react';
import { Modal, Timeline, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useMemoizedFn, useRequest } from 'ahooks';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { IconFabujilu, IconHuifucibanben } from '@/assets/icons';
import { BasicInfoState, TestRunDataState } from '../../model';
import {
  getWorkflowHistoryList,
  getWorkflowHistoryVersionDetail,
  restoreWorkflowVersion,
  type WorkflowHistoryItem,
} from '../../api';
import { text2object } from '@/utils';
import type { FreeLayoutPluginContext } from '@flowgram.ai/free-layout-editor';
import { canvasJsonToBackendData } from '../../hooks/use-workflow-data';
import { useClientContext } from '@flowgram.ai/free-layout-editor';
import { Resizable } from '@douyinfe/semi-ui';
import { useResizableMemory } from '@/components/ResizePanel/useResizableMemory';
import { workflowGlobalEmit, WorkflowEventNameEnum } from '../../event';
import './index.less';
import { loadCanvasData } from '../../utils';

const Default_Width = 360;

interface WorkflowHistoryProps {
  className?: string;
  editorRef?: React.RefObject<FreeLayoutPluginContext | undefined>;
  onVersionChange?: (isHistoryMode: boolean) => void;
  onVersionSelect?: (version: number | undefined) => void;
  setSavedData: (data: string) => void;
}

const WorkflowHistory: React.FC<WorkflowHistoryProps> = ({
  className,
  editorRef,
  onVersionChange,
  onVersionSelect,
  setSavedData,
}) => {
  const basicInfo = useRecoilValue(BasicInfoState);
  const workflowId = basicInfo?.workflowId;
  const clientContext = useClientContext();

  const [historyList, setHistoryList] = useState<WorkflowHistoryItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [currentDraftData, setCurrentDraftData] = useState<string | null>(null);
  const resetTestRunData = useResetRecoilState(TestRunDataState);

  // 使用 Resizable 记忆功能
  const { size, handleSizeChange } = useResizableMemory({
    storageKey: 'workflow-history-panel-width',
    defaultWidth: Default_Width,
    defaultHeight: '100%',
    minWidth: 280,
    maxWidth: '80vw',
    enableMemory: true,
  });

  const { run, loading } = useRequest(getWorkflowHistoryList, {
    manual: true,
    onSuccess: (res) => {
      const { data } = res || {};
      // API 返回的是数组，直接使用
      const list = Array.isArray(data) ? data : data?.versionList || [];
      setHistoryList(list);
    },
  });

  useEffect(() => {
    if (workflowId) {
      run({ workflowId: Number(workflowId) });
    }
  }, [workflowId, run]);

  // 在组件挂载时保存当前草稿数据
  useEffect(() => {
    if (editorRef?.current && !currentDraftData) {
      const currentData = JSON.stringify(editorRef.current.document.toJSON());
      setCurrentDraftData(currentData);
    }
  }, [editorRef, currentDraftData]);

  const handleClickHistoryItem = useMemoizedFn(async (item: WorkflowHistoryItem, index: number) => {
    if (!editorRef?.current || !workflowId) return;
    const editor = editorRef.current;

    try {
      // 如果当前显示的是当前版本（current === 0），在切换前先保存当前版本的画布数据
      if (current === 0) {
        const currentData = JSON.stringify(editor.document.toJSON());
        setCurrentDraftData(currentData);
      }
      // 先设置历史模式标记，避免 reload 时触发自动保存
      onVersionChange?.(true);
      const res = await getWorkflowHistoryVersionDetail({
        workflowId: Number(workflowId),
        version: item.version,
      });
      const { data } = res || {};
      if (data?.canvasInfo && editor) {
        // 加载历史版本到画布
        loadCanvasData(editor.document, data.canvasInfo, {
          workflowEdgeList: data?.workflowEdgeList,
          workflowNodeList: data?.workflowNodeList,
        });
        resetTestRunData();
        setCurrent(index + 1);
        // 画布加载完成后再更新版本，确保 test-run-panel 能获取到最新的输入参数
        onVersionSelect?.(item.version);
        // 版本切换成功，通知聊天面板清除聊天记录
        workflowGlobalEmit(WorkflowEventNameEnum.VERSION_SWITCH);
        setTimeout(() => {
          editor.tools.fitView();
        }, 100);
      }
    } catch (e) {
      console.log('加载历史版本失败', e);
      message.error('加载历史版本失败');
      // 加载失败时恢复历史模式
      onVersionChange?.(false);
      onVersionSelect?.(undefined);
    }
  });

  const handleCurrentClick = useMemoizedFn(() => {
    if (!editorRef?.current || !currentDraftData) return;
    const editor = editorRef.current;

    // 恢复当前草稿版本（使用之前保存的当前版本数据）
    editor.document.reload(text2object(currentDraftData));
    resetTestRunData();
    setCurrent(0);
    onVersionChange?.(false);
    // 画布加载完成后再更新版本，确保 test-run-panel 能获取到最新的输入参数
    onVersionSelect?.(undefined);
    // 版本切换成功，通知聊天面板清除聊天记录
    workflowGlobalEmit(WorkflowEventNameEnum.VERSION_SWITCH);
    setTimeout(() => {
      editor.tools.fitView();
    }, 100);
  });

  const handleRestoreVersion = useMemoizedFn((e: React.MouseEvent<HTMLElement>, version: number) => {
    e.stopPropagation();
    Modal.confirm({
      title: '恢复历史版本',
      content: '确定要恢复此版本吗？恢复后，将覆盖当前最新的画布内容，且不可找回，请谨慎选择。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        if (!workflowId || !editorRef?.current) return;
        try {
          // 设置恢复标记，避免 reload 时触发自动保存
          const playground = editorRef.current.playground;
          if (playground) {
            (playground.config as any).isRestoring = true;
          }

          // 重新加载工作流数据
          const versionDetail = await getWorkflowHistoryVersionDetail({
            workflowId: Number(workflowId),
            version,
          });

          const { data: versionData } = versionDetail || {};
          if (!versionData?.canvasInfo) {
            message.error('获取历史版本数据失败');
            return;
          }

          // 从 canvasInfo 解析画布 JSON
          const canvasJson = text2object(versionData.canvasInfo);

          // 临时加载到 document，以便获取节点信息用于转换后端数据
          editorRef.current.document.reload(canvasJson);

          // 转换为后端需要的格式（此时节点已加载到 document）
          const backendData = canvasJsonToBackendData(canvasJson, clientContext);

          const restoreRes = await restoreWorkflowVersion({
            workflowId: Number(workflowId),
            version,
            ...backendData,
          });
          const { code } = restoreRes || {};
          if (code === 200) {
            // 恢复成功后，画布数据已经在上面 reload 过了，只需要更新草稿数据
            const newDraftData = JSON.stringify(editorRef.current.document.toJSON());
            resetTestRunData();
            setCurrentDraftData(newDraftData);
            setSavedData(versionData.canvasInfo);
            setCurrent(0);
            onVersionChange?.(false);
            onVersionSelect?.(undefined);
            run({ workflowId: Number(workflowId) });
            message.success('恢复成功，请重新发布以生效');
          }

          // 恢复完成后清除标记
          if (playground) {
            setTimeout(() => {
              (playground.config as any).isRestoring = false;
            }, 2000); // 延迟清除，确保 debounce 的自动保存已经处理完
          }
        } catch (e) {
          console.log('恢复版本失败', e);
          message.error('恢复版本失败');
          // 失败时也要清除标记
          const playground = editorRef.current?.playground;
          if (playground) {
            (playground.config as any).isRestoring = false;
          }
        }
      },
    });
  });

  return (
    <div
      className={`ahw ${className || ''}`}
      tw="h-full bg-white rounded-[4px] shadow-[0_2px_6px_0_rgba(0,0,0,0.12)] border border-solid border-[rgba(0, 0, 0, 0.06)] box-border flex flex-col"
    >
      <Resizable
        enable={{
          top: false,
          left: true,
          right: false,
          bottom: false,
        }}
        minWidth={Default_Width}
        maxWidth={'80vw'}
        size={size}
        onChange={(size) => {
          handleSizeChange({
            width: size.width || Default_Width,
            height: '100%',
          });
        }}
      >
        <div tw="flex flex-col h-full">
          <div className={'ahw-title'}>
            <IconFabujilu size={20} />
            发布记录
          </div>
          <div className={'ahw-container'} tw="flex-1">
            <Timeline>
              <Timeline.Item color={current === 0 ? 'blue' : 'gray'}>
                <div
                  className={`ahw-container-item ahw-container-currentItem ${
                    current === 0 ? 'ahw-container-item-gary' : ''
                  }`}
                  onClick={handleCurrentClick}
                >
                  当前版本
                </div>
              </Timeline.Item>
              {(historyList || []).map((item, index) => (
                <Timeline.Item key={item?.version} color={current === index + 1 ? 'blue' : 'gray'}>
                  <div
                    key={item?.version}
                    className={`ahw-container-item ${current === index + 1 ? 'ahw-container-item-gary' : ''}`}
                    onClick={() => handleClickHistoryItem(item, index)}
                  >
                    <span className={'ahw-container-item-desc'}>
                      <span className={'acid-label'}>发布人：</span>
                      {item?.operatorName}
                    </span>
                    <span className={'ahw-container-item-desc'}>
                      <span className={'acid-label'}>发布时间：</span>
                      {dayjs(item?.releaseTime).format('YYYY-MM-DD HH:mm')}
                    </span>
                    <span className={'ahw-container-item-line'}>
                      <Typography.Text
                        className={'acil-action'}
                        type="secondary"
                        onClick={(e) => handleRestoreVersion(e, item?.version)}
                      >
                        <IconHuifucibanben className={'acil-action-icon'} />
                        恢复历史版本
                      </Typography.Text>
                    </span>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        </div>
      </Resizable>
    </div>
  );
};

export default WorkflowHistory;
