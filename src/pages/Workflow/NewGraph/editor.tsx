import {
  FreeLayoutEditorProvider,
  PlaygroundReactRenderer,
  type FreeLayoutPluginContext,
  useClientContext,
} from '@flowgram.ai/free-layout-editor';
import React, { useContext, useEffect, useRef, useState } from 'react';
import '@flowgram.ai/free-layout-editor/index.css';
import { nodeRegistries } from './nodes';
import { initialData } from './initial-data';
import { useEditorProps } from './hooks';
import { GraphTools } from './components/tools';
import { SidebarProvider, SidebarRenderer } from './components/sidebar';
import CheckList from './components/check-list';
import FloatLayout from './components/float-layout';
import HeaderPanel from './components/header-panel';
import { AddNodeModalProvider } from './components/add-node-modal';
import { AddNodeModal } from './components/add-node-modal';
import { useQueryLocationSearch } from '@/utils';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { BasicInfoState, TestRunDataState } from '@/pages/Workflow/NewGraph/model';
import { getGraphInfo } from './api';
import { loadCanvasData } from './utils';
import { SidebarContext } from './context';
import WorkflowHistory from './components/workflow-history';

// 内部组件，用于访问 context 和设置 readonly
const EditorContent = ({
  savedData,
  setSavedData,
  editorRef,
}: {
  savedData: string;
  setSavedData: (data: string) => void;
  editorRef: React.RefObject<FreeLayoutPluginContext | undefined>;
}) => {
  const { showHistoryPanel, showTestRunPanel, isHistoryMode, setIsHistoryMode, setCurrentVersion } =
    useContext(SidebarContext);
  const { playground } = useClientContext();

  // 根据历史版本模式设置 readonly 和跳过自动保存标记
  useEffect(() => {
    if (playground) {
      // 标记历史模式，用于在 onContentChange 中跳过自动保存
      (playground.config as any).isHistoryMode = isHistoryMode;
    }
  }, [isHistoryMode, playground]);

  // 统一管理 readonly 状态：试运行面板或历史面板打开时设为 readonly
  useEffect(() => {
    if (playground) {
      const shouldBeReadonly = showHistoryPanel || showTestRunPanel;
      playground.config.readonly = shouldBeReadonly;
    }
  }, [showHistoryPanel, showTestRunPanel, playground]);

  // 右侧面板内容（节点编辑/试运行面板）
  const getRightPanelContent = () => {
    return <SidebarRenderer />;
  };

  // 最右侧面板内容（发布记录面板）
  const getRightMostPanelContent = () => {
    if (showHistoryPanel) {
      return (
        <WorkflowHistory
          editorRef={editorRef}
          onVersionChange={setIsHistoryMode}
          onVersionSelect={setCurrentVersion}
          setSavedData={setSavedData}
        />
      );
    }
    return null;
  };

  return (
    <>
      <PlaygroundReactRenderer />
      <FloatLayout
        headerComp={<HeaderPanel savedData={savedData || ''} setSavedData={setSavedData} />}
        bottomComp={<CheckList />}
        rightComp={getRightPanelContent()}
        rightMostComp={getRightMostPanelContent()}
      >
        <GraphTools />
        <AddNodeModal />
      </FloatLayout>
    </>
  );
};

const Editor = () => {
  const ref = useRef<FreeLayoutPluginContext | undefined>();
  const editorProps = useEditorProps(initialData, nodeRegistries);
  const { id } = useQueryLocationSearch();
  console.log('.....render');
  const [savedData, setSavedData] = useState<string>();
  const setBasicInfo = useSetRecoilState(BasicInfoState);
  const resetTestRunData = useResetRecoilState(TestRunDataState);

  useEffect(() => {
    return () => {
      setBasicInfo(null);
      // 离开画布页时重置试运行数据
      resetTestRunData();
    };
  }, [setBasicInfo, resetTestRunData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getGraphInfo({ workflowId: id });
        if (!data) {
          throw new Error('数据出错');
        }
        const { diagramInfo, workflowEdgeList, workflowNodeList } = data;
        setBasicInfo({ ...data, hasSaved: !!diagramInfo });
        if (diagramInfo && ref.current) {
          loadCanvasData(ref.current.document, diagramInfo, {
            workflowEdgeList,
            workflowNodeList,
            setSavedData,
          });
          setTimeout(() => {
            // 加载后触发画布的 fitview 让节点自动居中
            ref.current?.tools.fitView();
          }, 100);
        }
      } catch (error) {
        console.log('error===', error);
      }
    };
    // 每次进入/切换到该画布时清空试运行数据，避免历史版本残留
    resetTestRunData();
    fetchData();
  }, [id, setBasicInfo, resetTestRunData]);

  return (
    <FreeLayoutEditorProvider {...editorProps} ref={ref as React.RefObject<FreeLayoutPluginContext>}>
      <AddNodeModalProvider>
        <SidebarProvider>
          <EditorContent savedData={savedData || ''} setSavedData={setSavedData} editorRef={ref} />
        </SidebarProvider>
      </AddNodeModalProvider>
    </FreeLayoutEditorProvider>
  );
};

export default Editor;
