import { type FC, useMemo } from 'react';

import classnames from 'classnames';
import { Tag } from '@douyinfe/semi-ui';
import { IconSpin } from '@douyinfe/semi-icons';

import { NodeStatusHeader } from '../header';
import { NodeStatusGroup } from '../group';
import { CheckCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';

import './index.less';
import React from 'react';
import type { WrokFlowNodeLogParams } from '@ysf/ai-chat/es/type';
import { NodeRunStatusEnum } from '../../../constants';
import { Divider } from 'antd';

interface NodeStatusRenderProps {
  report: {
    status: NodeRunStatusEnum;
    requestData: WrokFlowNodeLogParams;
    responseData?: WrokFlowNodeLogParams;
  } | null;
}

export const NodeStatusRender: FC<NodeStatusRenderProps> = ({ report }) => {
  const { status: nodeStatus } = report || {};

  // 节点状态
  const isNodeProcessing = nodeStatus === NodeRunStatusEnum.Processing;
  const isNodeSucceed = nodeStatus === NodeRunStatusEnum.Succeeded;
  const isNodeTerminated = nodeStatus === NodeRunStatusEnum.terminated;

  const statusColor = useMemo(() => {
    if (isNodeSucceed) {
      return 'nodeStatusSucceed';
    }

    if (isNodeProcessing) {
      return 'nodeStatusProcessing';
    }

    if (isNodeTerminated) {
      return 'nodeStatusTerminated';
    }
  }, [isNodeSucceed, isNodeProcessing, isNodeTerminated]);

  const renderIcon = () => {
    if (isNodeProcessing) {
      return (
        <img src="https://res.qiyukf.net/storage/6b4d94d8-297d-4c8b-a300-48e1d567ade6.png" width={14} height={14} />
      );
    }
    if (isNodeSucceed) {
      return <CheckCircleFilled className={`${statusColor}-icon`} />;
    }
    return <ExclamationCircleFilled className={`${statusColor}-icon`} />;
  };
  const renderDesc = () => {
    const getDesc = () => {
      if (isNodeProcessing) {
        return '运行中';
      } else if (isNodeSucceed) {
        return '运行成功';
      } else if (isNodeTerminated) {
        return '运行终止';
      }
    };

    const desc = getDesc();

    return desc ? <p className="desc">{desc}</p> : null;
  };
  const renderCost = () => {
    const { cost, llmCost } = report?.responseData || {};
    return cost !== undefined ? (
      <Tag size="small" className={'tagColor'}>
        {cost}ms
        {llmCost ? (
          <span>
            <Divider type="vertical" />
            {llmCost}次
          </span>
        ) : null}
      </Tag>
    ) : null;
  };

  if (!report) {
    return null;
  }

  return (
    <NodeStatusHeader
      header={
        <>
          {renderIcon()}
          {renderDesc()}
          {renderCost()}
        </>
      }
      headerClassName={statusColor ? `${statusColor}-bg` : ''}
      showDetailArrow={isNodeSucceed || isNodeTerminated}
    >
      <div className="container">
        <NodeStatusGroup data={report?.requestData} />
        <NodeStatusGroup data={report?.responseData} />
      </div>
    </NodeStatusHeader>
  );
};
