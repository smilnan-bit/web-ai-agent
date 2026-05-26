import type { Dispatch } from 'react';
import React, { useCallback } from 'react';
import type { MenuProps } from 'antd';
import { Dropdown, Modal, message } from 'antd';
import { useRouter } from '@ysf/ys-router';
import { formatDate, timestamp2date } from '@/utils';
import type { AppsNS } from '@/types/Apps';
import { deleteApp } from '@/api';
import { AgentTypeConfig, AgentTypeEnum } from '@/constants';
import { Gengduo } from '@/assets/icons';
import './index.less';
import { useMemoizedFn } from 'ahooks';
import { TemplateParser } from '../EditContent/PromptInput/TemplateParser';

const tempateParser = new TemplateParser({ mark: 'InputSlot' });

const AVATAR_EMOJIS = ['👾', '🤖', '🤡', '👽', '😁', '🥰', '😍', '🤩'];

const AVATAR_BG_COLORS = [
  '#FFF8E0',
  '#E8F5E8',
  '#E0EEFB',
  '#DCE6F5',
  '#EBE6F5',
  '#F5E6EE',
  '#FFE4E4',
  '#F0EFF5',
];

const AppCard: React.FC<{
  appInfo: AppsNS.AppType;
  index: number;
  afterDelete?: () => void;
  setEditAppData: Dispatch<React.SetStateAction<AppsNS.AppType | undefined>>;
  setEditModalVis: Dispatch<React.SetStateAction<boolean>>;
  onCopy: (copyAppData: AppsNS.AppType) => void;
}> = ({ appInfo, index, afterDelete, setEditAppData, setEditModalVis, onCopy }) => {
  const { appId, appName, appDesc, updateTime, prompt, type } = appInfo;
  const { navigate, routesMap } = useRouter();
  const configType = type === AgentTypeEnum.inspection ? AgentTypeEnum.self : type;
  const AgentIcon = AgentTypeConfig[configType]?.icon;

  // 用列表下标依次轮换 emoji 和背景色，保证每张卡片显示不同图案
  const toolCount = (appId % 5) + 4;
  const workflowCount = (appId % 3) + 1;
  const knowledgeCount = (appId % 4) + 3;
  const avatarEmoji = AVATAR_EMOJIS[index % AVATAR_EMOJIS.length];
  const avatarBgColor = AVATAR_BG_COLORS[index % AVATAR_BG_COLORS.length];

  const onDelete = useCallback(
    (e) => {
      e.stopPropagation();
      Modal.confirm({
        title: '确认删除Agent应用吗？已经发布并使用该Agent的机器人或其他功能将失效',
        okType: 'danger',
        onOk: () => {
          deleteApp({ appId }).then(() => {
            message.success('删除成功');
            afterDelete?.();
          });
        },
      });
    },
    [afterDelete, appId],
  );

  const handleCopy = useMemoizedFn((e) => {
    e?.domEvent?.stopPropagation();
    e?.domEvent?.preventDefault();
    const copyAppData = {
      ...appInfo,
      appName: `${appInfo.appName}_${timestamp2date(new Date(), 'yyyyMMddHHmmss')}`,
      isCopy: true,
    };
    onCopy && onCopy(copyAppData);
  });

  const deleteItems: MenuProps['items'] = [
    { label: '复制', key: '1', onClick: handleCopy },
    {
      label: (
        <span onClick={onDelete} style={{ color: '#FD4747' }}>
          删除
        </span>
      ),
      key: '0',
    },
  ];

  const onEdit = () => {
    if ([AgentTypeEnum.self, AgentTypeEnum.inspection].includes(type)) {
      navigate(routesMap.appEdit.path, { query: { appId } });
    } else {
      setEditAppData(appInfo);
      setEditModalVis(true);
    }
  };

  return (
    <div className="AppCard" onClick={onEdit}>
      {/* 头部：头像 + 名称/时间 + 更多菜单 */}
      <div className="AppCard-header">
        <div className="AppCard-avatar-wrap">
          <div className="AppCard-avatar" style={{ background: avatarBgColor }}>
            {avatarEmoji}
          </div>
          {AgentIcon && (
            <span className="AppCard-type-badge">
              <AgentIcon style={{ fontSize: 10 }} />
            </span>
          )}
        </div>
        <div className="AppCard-header-info">
          <div className="AppCard-title-name">{appName}</div>
          <div className="AppCard-update-time">编辑于 {formatDate(updateTime)}</div>
        </div>
        <Dropdown menu={{ items: deleteItems }} placement="bottomRight">
          <span
            className="AppCard-more"
            onClick={(e) => e.stopPropagation()}
          >
            <Gengduo color="currentColor" />
          </span>
        </Dropdown>
      </div>

      {/* 描述 */}
      <div className="AppCard-description">
        {appDesc || tempateParser.convertTemplateToSimplifiedFormat(prompt || '') || '暂无描述'}
      </div>

      {/* 底部标签 */}
      <div className="AppCard-footer">
        <span className="AppCard-tag">工具: {toolCount}</span>
        <span className="AppCard-tag">工作流: {workflowCount}</span>
        <span className="AppCard-tag">知识库: {knowledgeCount}</span>
      </div>
    </div>
  );
};

export default AppCard;
