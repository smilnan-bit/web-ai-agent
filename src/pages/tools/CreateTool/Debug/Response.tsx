import React from 'react';
import { useRecoilValue } from 'recoil';
import { CurrentDebugState } from '../model';

const ResponsePanel = () => {
  const { debugRes } = useRecoilValue(CurrentDebugState);
  return (
    <div className="ResponsePanel">{debugRes.code === 200 ? debugRes.data : JSON.stringify(debugRes.response)}</div>
  );
};

export default ResponsePanel;
