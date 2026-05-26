import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import classNames from 'classnames';
import { CurrentDebugState } from '../model';
import RequestPanel from './Request';
import ResponsePanel from './Response';

const DebugResult = () => {
  const debugStateValue = useRecoilValue(CurrentDebugState);
  const { debugRes } = debugStateValue || {};

  const hasDebug = useMemo(() => debugRes !== undefined, [debugRes]);
  const debugFail = useMemo(() => hasDebug && debugRes.code !== 200, [debugRes?.code, hasDebug]);

  return (
    <div className="DebugResult">
      <div className="DebugResult-header">
        调试结果
        {hasDebug && (
          <span className={classNames({ 'DebugResult-result': true, success: !debugFail, fail: debugFail })}>
            调试{debugFail ? '未' : ''}通过
          </span>
        )}
      </div>
      <div className="DebugResult-content">
        {!hasDebug ? (
          <div>调试结果将展示在此处</div>
        ) : (
          <div className="DebugResult-panel">
            <span className="DebugResult-resultTag">Request</span>
            <RequestPanel />
            <span className="DebugResult-resultTag">Response</span>
            <ResponsePanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugResult;
