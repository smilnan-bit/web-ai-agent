import React from 'react';
import { useRecoilValue } from 'recoil';
import { CurrentDebugState } from '../model';
import JsonTreeView from '@/components/JsonTreeView';
import { cleanObject } from '@/utils';

const RequestPanel = () => {
  const { params } = useRecoilValue(CurrentDebugState);

  return <JsonTreeView src={cleanObject(params)} theme="monokai" style={{ padding: '8px' }} />;
};

export default RequestPanel;
