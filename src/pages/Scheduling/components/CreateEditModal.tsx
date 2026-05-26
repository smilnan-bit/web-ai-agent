import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Radio, message } from 'antd';
import { AppstoreOutlined, SyncOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';
import { useRouter } from '@ysf/ys-router';
import { createScheduling, updateScheduling } from '@/api/scheduling';
import type { SchedulingStrategy } from '@/api/scheduling';
import './CreateEditModal.less';

interface CreateEditModalProps {
  visible: boolean;
  item?: SchedulingStrategy | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateEditModal: React.FC<CreateEditModalProps> = ({ visible, item, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const { navigate, routesMap } = useRouter();
  const [loading, setLoading] = useState(false);
  const [strategyMode, setStrategyMode] = useState<'canvas' | 'plan-execute'>('canvas');
  const [nameValue, setNameValue] = useState('');

  const isEdit = !!item;

  useEffect(() => {
    if (visible) {
      if (item) {
        form.setFieldsValue({ name: item.name, desc: item.desc });
        setNameValue(item.name ?? '');
      } else {
        form.resetFields();
        setStrategyMode('canvas');
        setNameValue('');
      }
    }
  }, [visible, item, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      if (isEdit) {
        const res = await updateScheduling({ id: item.id, name: values.name, desc: values.desc });
        if ((res as any)?.code === 200) {
          message.success('编辑成功');
          onSuccess();
        } else {
          message.error((res as any)?.message ?? '编辑失败');
        }
      } else {
        let newId: string = nanoid();
        try {
          const res = await createScheduling({ name: values.name, desc: values.desc });
          if ((res as any)?.data?.id) {
            newId = (res as any).data.id;
          }
        } catch {
          // 接口暂未实现，使用本地临时 id
        }
        onSuccess();
        navigate(routesMap.schedulingEdit.path, { query: { id: newId } });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑调度策略' : '创建调度策略'}
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText={isEdit ? '确定' : '创建'}
      cancelText="取消"
      okButtonProps={{ disabled: !nameValue.trim() }}
      width={560}
      destroyOnClose
      className="scheduling-create-modal"
    >
      <Form form={form} layout="vertical">
        {!isEdit && (
          <Form.Item label="策略模式" required>
            <div className="scheduling-mode-cards">
              <div
                className={`mode-card${strategyMode === 'canvas' ? ' selected' : ''}`}
                onClick={() => setStrategyMode('canvas')}
              >
                <div className="mode-card-icon canvas-icon">
                  <AppstoreOutlined />
                </div>
                <div className="mode-card-body">
                  <div className="mode-card-title">画布编排模式</div>
                  <div className="mode-card-desc">
                    通过画布配置节点和连线，定义调度流程，适用于对可控性要求高的调度场景
                  </div>
                </div>
                <div className="mode-card-radio">
                  <Radio checked={strategyMode === 'canvas'} />
                </div>
              </div>

              <div className="mode-card disabled">
                <span className="coming-soon-tag">敬请期待！</span>
                <div className="mode-card-icon plan-icon">
                  <SyncOutlined />
                </div>
                <div className="mode-card-body">
                  <div className="mode-card-title">Plan-Execute模式</div>
                  <div className="mode-card-desc">
                    由大模型自主规划和执行，适用于对大模型自主规划执行能力要求高的调度场景
                  </div>
                </div>
                <div className="mode-card-radio">
                  <Radio checked={false} disabled />
                </div>
              </div>
            </div>
          </Form.Item>
        )}
        <Form.Item
          label="策略名称"
          name="name"
          rules={[
            { required: true, message: '请输入策略名称' },
            { max: 100, message: '策略名称不超过 100 个字符' },
          ]}
        >
          <Input
            placeholder="请输入策略名称"
            maxLength={100}
            showCount
            onChange={(e) => setNameValue(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="策略描述" name="desc" rules={[{ max: 500, message: '策略描述不超过 500 个字符' }]}>
          <Input.TextArea placeholder="请输入策略描述（选填）" maxLength={500} rows={4} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateEditModal;
