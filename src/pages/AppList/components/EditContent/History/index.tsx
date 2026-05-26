import React, { useEffect, useState } from 'react';
import { Modal, Timeline, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useMemoizedFn, useRequest } from 'ahooks';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import type { VersionModalRef } from '@/pages/AppList/components/EditContent/History/versionModal';
import VersionModal from '@/pages/AppList/components/EditContent/History/versionModal';
import { getAppConfigDetail, getAppHistoryList, getHistoryVersionDetail, restoreVersion } from '@/api';
import { IconChakanbiangengrizhi, IconFabujilu, IconHuifucibanben } from '@/assets/icons';
import { useQueryLocationSearch } from '@/utils';
import useAgentHistory from '@/pages/AppList/components/EditContent/History/useAgentHistory';
import { CurrentAppState } from '@/model';
import './index.less';

interface AgentHistoryProps {
  className?: string;
}
const AgentHistory: React.FC<AgentHistoryProps> = ({ className }) => {
  const { appId } = useQueryLocationSearch();

  const [historyList, setHistoryList] = useState<{ versionId: number; operator: string; operateTime: number }[]>([]);

  const setCurrentApp = useSetRecoilState(CurrentAppState);

  const { setHistoryLoading, recoverToVersion } = useAgentHistory();

  const { lastDraft } = useAgentHistory();

  const [current, setCurrent] = useState(0);

  const versionRef = React.useRef<VersionModalRef>(null);

  const { run, loading } = useRequest(getAppHistoryList, {
    manual: true,
    onSuccess: (res) => {
      const { data } = res || {};
      const { versionList = [] } = data || {};
      setHistoryList(versionList);
    },
  });

  useEffect(() => {
    run({ appId, pageNo: 1, pageSize: 100 });
  }, []);

  const handleClickHistoryItem = useMemoizedFn(
    async (item: { versionId: number; operator: string; operateTime: number }, index: number) => {
      try {
        setHistoryLoading(true);
        const res = await getHistoryVersionDetail({ versionId: item?.versionId, appId });
        const { data } = res || {};
        setCurrent(index + 1);
        setCurrentApp(data);
        setHistoryLoading(false);
      } catch (e) {
        console.log('e===', e);
      }
    },
  );

  const handleCurrentClick = useMemoizedFn(() => {
    setCurrent(0);
    setCurrentApp(lastDraft);
  });

  const handleViewChangeLog = useMemoizedFn((e: React.MouseEvent<HTMLElement>, id: number) => {
    e.stopPropagation();
    versionRef.current?.open(id, appId);
  });

  const handleRestoreVersion = useMemoizedFn((e: React.MouseEvent<HTMLElement>, id: number) => {
    e.stopPropagation();
    console.log('恢复版本', id);
    Modal.confirm({
      title: '恢复历史版本',
      content: '确定要恢复此版本吗？恢复后，将覆盖当前最新编写好的提示词和Agent配置内容。',
      onOk: async () => {
        try {
          const recoverRes = await restoreVersion({ appId, versionId: id });
          const { code } = recoverRes || {};
          if (code === 200) {
            const res = await getAppConfigDetail({ appId: Number(appId) });
            const { data } = res || {};
            recoverToVersion(data);
            setCurrent(0);
            run({ appId, pageNo: 1, pageSize: 100 });
            message.success('操作成功');
          }
        } catch (e) {}
      },
      onCancel: () => {},
    });
  });

  return (
    <div className={`ahw ${className || ''}`}>
      <div className={'ahw-title'}>
        <IconFabujilu size={20} />
        发布记录
      </div>
      <div className={'ahw-container'}>
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
            <Timeline.Item key={item?.versionId} color={current === index + 1 ? 'blue' : 'gray'}>
              <div
                key={item?.versionId}
                className={`ahw-container-item ${current === index + 1 ? 'ahw-container-item-gary' : ''}`}
                onClick={() => handleClickHistoryItem(item, index)}
              >
                <span className={'ahw-container-item-desc'}>
                  <span className={'acid-label'}>发布人：</span>
                  {item?.operator}
                </span>
                <span className={'ahw-container-item-desc'}>
                  <span className={'acid-label'}>发布时间：</span>
                  {dayjs(item?.operateTime).format('YYYY-MM-DD HH:mm')}
                </span>
                <span className={'ahw-container-item-line'}>
                  <Typography.Link className={'acil-action'} onClick={(e) => handleViewChangeLog(e, item?.versionId)}>
                    <IconChakanbiangengrizhi color={'#337eff'} />
                    查看变更日志
                  </Typography.Link>
                  <Typography.Text
                    className={'acil-action'}
                    type="secondary"
                    onClick={(e) => handleRestoreVersion(e, item?.versionId)}
                  >
                    <IconHuifucibanben className={'acil-action-icon'} />
                    恢复此版本
                  </Typography.Text>
                </span>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
      <VersionModal ref={versionRef} />
    </div>
  );
};

export default AgentHistory;
