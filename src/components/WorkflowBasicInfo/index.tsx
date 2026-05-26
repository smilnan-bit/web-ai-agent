import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ModalProps } from 'antd';
import { Form, Input, Modal } from 'antd';
import { useRecoilValue } from 'recoil';
import { GlobalConfigState } from '@/model';
import { copyWorkflow, saveWorkflow } from '@/api';
import { ToolNameValidator } from '@/constants';
import './index.less';
import type { WorkflowNS } from '@/types/Workflow';

const WorkflowBasicInfo: React.FC<
  { initData?: WorkflowNS.WorkflowType } & Overwrite<
    ModalProps,
    { onOk: (data: Pick<WorkflowNS.WorkflowType, 'workflowId' | 'workflowDesc' | 'workflowName'>) => void }
  >
> = ({ initData, onOk, ...modalProps }) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const globalConfig = useRecoilValue(GlobalConfigState) || {};
  const { setFieldsValue, resetFields, validateFields } = form;

  const onSubmit = useCallback(async () => {
    try {
      setConfirmLoading(true);
      const values = await validateFields();
      if (!values.workflowId) {
        values.isNew = 1;
      }
      // 如果是复制新建，则调用复制接口
      const api = values?.isCopy ? copyWorkflow : saveWorkflow;
      delete values.isCopy;
      const {
        data: { workflowId: createWorkflowId } = {},
      } = await api(values);
      onOk?.({ ...values, workflowId: createWorkflowId || initData?.workflowId });
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmLoading(false);
    }
  }, [initData?.workflowId, onOk, validateFields]);

  useEffect(() => {
    if (modalProps.open) {
      initData ? setFieldsValue(initData) : resetFields();
      // 如果是编辑的话，延时校验一次，展示必填项的错误提示
      if (initData?.isCopy) {
        setTimeout(() => {
          form.validateFields().catch();
        }, 200);
      }
    }
  }, [initData, modalProps.open, resetFields, setFieldsValue]);

  const memoTitle = useMemo(() => {
    if (initData?.isCopy) {
      return '复制工作流';
    }
    return initData ? '编辑工作流' : '新建工作流';
  }, [initData]);

  return (
    <Modal
      title={memoTitle}
      onOk={onSubmit}
      confirmLoading={confirmLoading}
      destroyOnClose
      maskClosable={false}
      {...modalProps}
    >
      <Form form={form} preserve={false} layout="vertical">
        <Form.Item name="workflowId" noStyle>
          <></>
        </Form.Item>
        <Form.Item name={'isCopy'} noStyle>
          <></>
        </Form.Item>
        <Form.Item
          label="工作流名称"
          name="workflowName"
          rules={[
            { required: true, message: '请输入' },
            ToolNameValidator,
            {
              max: globalConfig.toolboxNameLimit,
              message: `工作流名称长度不能超过${globalConfig.toolboxNameLimit}个字符`,
            },
          ]}
        >
          <Input maxLength={globalConfig.toolboxNameLimit} placeholder="请输入工作流名称" />
        </Form.Item>
        <Form.Item label="工作流描述" name="workflowDesc" rules={[{ required: true, message: '请输入' }]}>
          <Input.TextArea
            maxLength={globalConfig.toolboxDescLimit}
            placeholder="请输入描述，帮助大模型理解什么时候调用此工作流"
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WorkflowBasicInfo;
