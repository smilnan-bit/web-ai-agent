import React, { useCallback, useEffect } from 'react';
import { Form, Input, Modal, message } from 'antd';
import type { ModalProps } from 'antd';
import { saveRepository } from '@/api/memoryRepository';
import { ToolNameValidator } from '@/constants/config';
import { useRecoilValue } from 'recoil';
import { GlobalConfigState } from '@/model';

interface CreateModalProps extends ModalProps {
  /** 编辑时传入的记忆库数据 */
  editData?: MemoryRepositoryNS.RepositoryType | null;
  onOk?: () => void;
}

const CreateModal: React.FC<CreateModalProps> = ({ editData, onOk, onCancel, ...modalProps }) => {
  const [form] = Form.useForm();
  const globalConfig = useRecoilValue(GlobalConfigState) || {};
  const isEdit = !!editData;

  // 编辑模式下，填充表单数据
  useEffect(() => {
    if (editData && modalProps.open) {
      form.setFieldsValue({
        name: editData.name,
        description: editData.description,
      });
    }
  }, [editData, modalProps.open, form]);

  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      await saveRepository({
        name: values.name,
        description: values.description,
        repositoryId: editData?.id, // 编辑时传入 id
      });
      message.success(isEdit ? '保存成功' : '创建成功');
      form.resetFields();
      onOk?.();
    } catch (error) {
      // 表单校验失败或接口报错，不做处理
    }
  }, [form, onOk, editData?.id, isEdit]);

  const handleCancel = useCallback(
    (e) => {
      form.resetFields();
      onCancel?.(e);
    },
    [form, onCancel],
  );

  return (
    <Modal
      title={isEdit ? '编辑记忆库' : '创建记忆库'}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose
      {...modalProps}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="记忆库名称"
          rules={[
            { required: true, message: '请输入记忆库名称' },
            { max: 50, message: '名称最多50个字符' },
            { pattern: /^[a-zA-Z]/, message: '名称必须以英文字母开头' },
            {
              pattern: /^[A-Za-z0-9_]*$/,
              message: '仅支持输入：字母（大小写）、数字、下划线_',
            },
          ]}
        >
          <Input
            placeholder="请输入记忆库名称（英文字母开头，仅支持字母、数字、下划线）"
            maxLength={globalConfig.toolboxNameLimit}
          />
        </Form.Item>
        <Form.Item name="description" label="记忆库描述" rules={[{ max: 200, message: '描述最多200个字符' }]}>
          <Input.TextArea placeholder="请输入记忆库描述（选填）" rows={3} maxLength={200} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateModal;
