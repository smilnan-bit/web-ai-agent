import { Col, Row, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React, { forwardRef, useImperativeHandle } from 'react';
import { useRouter } from '@ysf/ys-router';
import { saveTestTask } from '@/api';
import type { StepItemProps, StepRefType } from '../type';
import { getCostInfo } from '../config';

const Cost: React.ForwardRefRenderFunction<StepRefType, StepItemProps> = ({ taskData }, parentRef) => {
  const { navigate, routesMap } = useRouter();

  const submit = async () => {
    try {
      await saveTestTask({
        agentId: taskData.agentId,
        name: taskData.name,
        nosKey: taskData.nosKey,
        taskCount: taskData.taskCount,
      });
      message.success('保存成功');
    } catch (err) {
      throw new Error(err);
    }
  };
  useImperativeHandle(parentRef, () => ({
    validateValues: submit,
  }));

  return (
    <div style={{ width: '60%', margin: '60px auto', padding: 20, background: 'rgba(242, 243, 245, 1)' }}>
      {getCostInfo(taskData).map(({ label, value }, index) => (
        <Row key={index} gutter={24} style={{ marginTop: 16, fontSize: 16 }}>
          <Col span={8} style={{ textAlign: 'right' }}>
            {label}
          </Col>
          <Col span={16}>{value}</Col>
        </Row>
      ))}
      <div style={{ color: 'red', margin: '16px calc(33% - 140px) 0' }}>
        <ExclamationCircleOutlined style={{ marginRight: 8 }} />
        预估仅做参考，请以最终的消耗明细为准
      </div>
    </div>
  );
};

const CostWrapper = forwardRef<StepRefType, StepItemProps>(Cost);

export default CostWrapper;
