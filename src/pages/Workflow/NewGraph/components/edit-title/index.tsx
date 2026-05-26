import type { FC } from 'react';
import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import WorkflowBasicInfo from '@/components/WorkflowBasicInfo';
import { BasicInfoState } from '../../model';
import './index.less';
import { Bianji } from '@/assets/icons';
import type { WorkflowNS } from '@/types/Workflow';

const block = 'graph-edit-title';

const EditTitle: FC<{
  className?: string;
  title: string;
  onChange?: (data: Pick<WorkflowNS.WorkflowType, 'workflowId' | 'workflowDesc' | 'workflowName'>) => void;
}> = ({ className = '', title = '', onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [basicInfoValue, setBasicInfo] = useRecoilState(BasicInfoState);

  return (
    <>
      <h1 className={`${block}-text ${className}`}>
        {title}
        <span className={`${block}-text-icon`}>
          <Bianji onClick={() => setModalVisible(true)} color="currentColor" />
        </span>
      </h1>
      <WorkflowBasicInfo
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={(data) => {
          setBasicInfo((pre: any) => ({ ...pre, workflowName: data.workflowName, workflowDesc: data.workflowDesc }));
          setModalVisible(false);
          onChange?.(data);
        }}
        initData={basicInfoValue as WorkflowNS.WorkflowType}
      />
    </>
  );
};

export default EditTitle;
