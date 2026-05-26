import { Button, Form, Input } from 'antd';
import React, { useEffect } from 'react';

const SimulateSessionPanel = ({
  onSave,
  onCancel,
  simulateSessionInfo,
}: {
  onSave: (info: { sessionId: string }) => void;
  onCancel: () => void;
  simulateSessionInfo: { sessionId?: string };
}) => {
  const [form] = Form.useForm();

  const onSubmit = async () => {
    const info = await form.validateFields();
    onSave(info);
  };

  useEffect(() => {
    form.setFieldsValue(simulateSessionInfo);
  }, [form, simulateSessionInfo]);

  return (
    <div tw="absolute p-4 top-[56px] left-0 w-full z-10 rounded-b-[2px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.08)] bg-white">
      <div tw="text-[rgba(0,0,0,0.45)] mb-2">可通过输入 会话ID 的方式模拟用户进线。</div>
      <Form form={form}>
        <Form.Item
          name="sessionId"
          label="会话ID"
          rules={[{ type: 'number', message: '请输入数字', transform: (value) => Number(value) }]}
        >
          <Input placeholder="请输入会话ID" maxLength={50} />
        </Form.Item>
      </Form>
      <div tw="flex justify-end gap-2">
        <Button onClick={() => onCancel()}>取消</Button>
        <Button type="primary" onClick={onSubmit}>
          保存
        </Button>
      </div>
    </div>
  );
};

export default SimulateSessionPanel;
