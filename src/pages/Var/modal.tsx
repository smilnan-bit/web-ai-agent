import React, { useCallback, useEffect, useState } from 'react';
import type { ModalProps } from 'antd';
import { Form, Input, Modal, Select } from 'antd';
import { ToolNameValidator, ToolParamsTypeEnum } from '@/constants';
import { addVar, updateVar } from './api';
import type { VarType } from '../Workflow/NewGraph/constants';

const VarModal: React.FC<
  { initData?: VarType } & Overwrite<
    ModalProps,
    { onOk: (data: Pick<VarType, 'id' | 'desc' | 'name' | 'type'>) => void }
  >
> = ({ initData, onOk, ...modalProps }) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { setFieldsValue, resetFields, validateFields } = form;

  const onSubmit = useCallback(async () => {
    try {
      setConfirmLoading(true);
      const values = await validateFields();
      const func = initData ? updateVar : addVar;
      const params = initData ? values : { ...values, type: ToolParamsTypeEnum.string };
      const { data } = await func(params);
      onOk(data);
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmLoading(false);
    }
  }, [initData?.id, onOk, validateFields]);

  useEffect(() => {
    if (modalProps.open) {
      initData ? setFieldsValue(initData) : resetFields();
    }
  }, [initData, modalProps.open, resetFields, setFieldsValue]);

  return (
    <Modal
      title={initData ? '编辑全局变量' : '新建全局变量'}
      onOk={onSubmit}
      confirmLoading={confirmLoading}
      destroyOnClose
      maskClosable={false}
      {...modalProps}
    >
      <Form form={form} preserve={false} layout="vertical">
        <Form.Item name="id" noStyle>
          <></>
        </Form.Item>
        <Form.Item label="变量名称" name="name" rules={[{ required: true, message: '请输入' }, ToolNameValidator]}>
          <Input maxLength={60} placeholder="请输入变量名称" showCount disabled={!!initData} />
        </Form.Item>
        <Form.Item label="变量描述" name="desc" rules={[{ required: true, message: '请输入' }]}>
          <Input.TextArea showCount maxLength={100} rows={3} placeholder="请输入变量描述" />
        </Form.Item>
        <Form.Item name="type" label="变量类型">
          <Select options={[{ label: 'String', value: 1 }]} disabled defaultValue={1} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VarModal;
