import React, { useState } from 'react';

import classNames from 'classnames';
import { useNodeRenderContext } from '../../../hooks';

import './index.less';
import { IconJiantouXia } from '../../../nodes/icons';

interface NodeStatusBarProps {
  header?: React.ReactNode;
  defaultShowDetail?: boolean;
  extraBtns?: React.ReactNode[];
  headerClassName?: string;
  showDetailArrow?: boolean;
}

export const NodeStatusHeader: React.FC<React.PropsWithChildren<NodeStatusBarProps>> = ({
  header,
  defaultShowDetail,
  children,
  extraBtns = [],
  headerClassName,
  showDetailArrow,
}) => {
  const [showDetail, setShowDetail] = useState(defaultShowDetail);
  const { selectNode } = useNodeRenderContext();

  const handleToggleShowDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(e);
    setShowDetail(!showDetail);
  };

  return (
    <div
      className={'node-status-header'}
      // 必须要禁止 down 冒泡，防止判定圈选和 node hover（不支持多边形）
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className={classNames(
          'node-status-header-content',
          showDetail && 'node-status-header-content-opened',
          headerClassName,
        )}
        // 必须要禁止 down 冒泡，防止判定圈选和 node hover（不支持多边形）
        onMouseDown={(e) => e.stopPropagation()}
        // 其他事件统一走点击事件，且也需要阻止冒泡
        onClick={handleToggleShowDetail}
      >
        <div className="status-title">
          {header}
          {extraBtns.length > 0 ? extraBtns : null}
        </div>
        {showDetailArrow && (
          <div className="status-btns">
            <IconJiantouXia
              className={classNames({
                ['is-show-detail']: showDetail,
              })}
            />
          </div>
        )}
      </div>
      {showDetail ? children : null}
    </div>
  );
};
