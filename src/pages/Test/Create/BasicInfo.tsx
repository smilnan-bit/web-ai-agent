import { Form, Input } from 'antd';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import DebounceSelect from '@/components/DebounceSelect';
import { AgentTypeEnum } from '@/constants';
import { getSelfReleasedApps } from '@/api';
import type { StepItemProps, StepRefType } from '../type';

const BasicInfo: React.ForwardRefRenderFunction<StepRefType, StepItemProps> = (
  { taskData, setTaskData },
  parentRef,
) => {
  const [form] = Form.useForm();

  useImperativeHandle(parentRef, () => ({
    validateValues: async () => {
      const values = await form.validateFields();
      setTaskData((pre) => ({ ...pre, ...values }));
    },
  }));

  useEffect(() => {
    form.setFieldsValue(taskData);
  }, [form, taskData]);

  return (
    <Form layout="vertical" form={form} style={{ width: 640, margin: '64px auto' }}>
      <Form.Item name="name" label="测评名称" required rules={[{ required: true, message: '请输入测评名称' }]}>
        <Input placeholder="请输入测评名称" maxLength={30} />
      </Form.Item>
      <Form.Item name="agentId" label="测评对象" required rules={[{ required: true, message: '请选择测评对象' }]}>
        <DebounceSelect
          placeholder={'请选择测评对象'}
          fetchOptions={getSelfReleasedApps}
          optionKey="appId"
          optionLabelName="appName"
          filterRes={(item) => item.type === AgentTypeEnum.self}
        />
      </Form.Item>
    </Form>
  );
};

const BasicInfoWrapper = forwardRef<StepRefType, StepItemProps>(BasicInfo);

export default BasicInfoWrapper;
