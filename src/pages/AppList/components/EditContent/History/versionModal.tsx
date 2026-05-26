import React, { useCallback, useImperativeHandle, useState } from 'react';
import { Modal, Popover } from 'antd';
import { useRequest } from 'ahooks';
import { isObject } from 'lodash';
import dayjs from 'dayjs';
import { getHistoryPublishDetail } from '@/api';
import type { AgentHistoryNS } from '@/@types/AgentHistpry';

import { IconXinxi } from '@/assets/icons';
import { HistoryActionType } from '@/pages/AppList/components/EditContent/History/constants';

export interface VersionModalRef {
  open: (id: number, appId: number) => void;
  close: () => void;
}

const VersionModal: React.ForwardRefRenderFunction<VersionModalRef, Record<string, any>> = (props, ref) => {
  const [open, setOpen] = useState(false);

  const [data, setData] = useState<AgentHistoryNS.AgentPublishDetail>({});

  const { run } = useRequest(getHistoryPublishDetail, {
    manual: true,
    onSuccess: (res) => {
      const { data } = res || {};
      const { appId, ...otherData } = data || {};

      const formattedData: AgentHistoryNS.AgentPublishDetail = {};

      Object.entries(otherData).forEach(([key, value]) => {
        if (Array.isArray(value)) formattedData[key] = value;
        else if (isObject(value)) formattedData[key] = [value];
      });

      setOpen(true);
      setData(formattedData);
    },
  });

  const handleOnok = useCallback(() => {}, []);

  const handleOnCancel = useCallback(() => {
    setOpen(false);
  }, []);

  useImperativeHandle(ref, () => {
    return {
      open: async (id: number, appId: number) => {
        run({ versionId: id, appId });
      },
      close: () => {
        setOpen(false);
      },
    };
  });

  const PublishMap = [
    {
      key: HistoryActionType.TIP_WORD,
      title: '提示词',
      valueKey: 'promptInfo',
    },
    {
      key: HistoryActionType.MODEL,
      title: '模型',
      valueKey: 'modelInfo',
    },
    {
      key: HistoryActionType.TOOL,
      title: '工具',
      valueKey: 'toolInfoList',
    },
    {
      key: HistoryActionType.KNOWLEDGE_BASE,
      title: '知识库',
      valueKey: 'knowledgeInfoList',
    },
    {
      key: HistoryActionType.WORKFLOW,
      title: '工作流',
      valueKey: 'workflowInfoList',
    },
    {
      key: HistoryActionType.DIALOGUE_RULE,
      title: '对话规则',
      valueKey: 'settingInfo',
    },
    {
      key: HistoryActionType.ANSWER_TIPS,
      title: '应答提示',
      valueKey: 'answerTipsInfo',
    },
  ];

  return open ? (
    <Modal
      open={open}
      footer={null}
      title={
        <div className={'awh-modal-title'}>
          <span>发布日志</span>

          <Popover placement="top" content={'对比上一版本的改动点'} trigger="hover">
            <IconXinxi size={14} />
          </Popover>
        </div>
      }
      onOk={handleOnok}
      onCancel={handleOnCancel}
    >
      <div className={'ahw-publish-container'}>
        {(PublishMap || []).map((item) => {
          if (data[item?.valueKey]?.length === 0) return null;
          return (
            <div key={item?.key} className={'ahw-publish-container-item'}>
              <p className={'apci-title'}>{item?.title}</p>
              {(data[item?.valueKey] || []).map((item, index) => {
                return (
                  <div key={`pubslih-${index}`} className={'apci-publish-wrap'}>
                    <div className={'apci-publish-item'}>
                      <span>{item?.operator}</span>
                      <span className={'apci-publish-item-time'}>
                        {' '}
                        {dayjs(item?.operateTime).format('YYYY-MM-DD HH:mm:ss')}
                      </span>
                    </div>
                    <div>{item?.description}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </Modal>
  ) : null;
};

export default React.forwardRef(VersionModal);
