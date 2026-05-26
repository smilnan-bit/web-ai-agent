import React from 'react';
import { Form, InputNumber } from 'antd';

const NumInRow: React.FC = () => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ marginBottom: 16 }}>选择卡片样式</div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      一行
      <Form.Item
        style={{ display: 'inline-block', margin: '0 4px' }}
        name="numInRow"
        rules={[{ required: true, message: '请输入' }]}
      >
        <InputNumber precision={0} min={1} />
      </Form.Item>
      个按钮
    </div>
  </div>
);

export default NumInRow;
