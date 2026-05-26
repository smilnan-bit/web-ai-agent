import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { CurrentToolBoxState } from '@/model';
import Actions from '../Actions';
import { CurrentDebugState, CurrentToolState } from '../model';
import EditParams from './EditParams';
import DebugResult from './DebugResult';
import './index.less';

const Debug: React.FC = () => {
  const [currentTool, setCurrentTool] = useRecoilState(CurrentToolState);
  const setCurrentDebugState = useSetRecoilState(CurrentDebugState);
  const currentToolBox = useRecoilValue(CurrentToolBoxState);

  useEffect(() => {
    setCurrentTool((pre) => ({ ...pre, debugStatus: undefined }));
  }, [setCurrentTool]);

  useEffect(() => {
    return () => {
      setCurrentDebugState(undefined);
    };
  }, [setCurrentDebugState]);
  return (
    <>
      <div className={`Debug`}>
        <div className="Debug-header">
          {currentToolBox?.name}. {currentTool?.name}
        </div>
        <div className={`Debug-content`}>
          <EditParams />
          <DebugResult />
        </div>
      </div>
      <Actions />
    </>
  );
};

export default Debug;
