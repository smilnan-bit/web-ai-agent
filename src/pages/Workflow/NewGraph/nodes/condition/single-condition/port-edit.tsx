import { Form, Input } from 'antd';
import React, { useState } from 'react';
import { CheckOutlined, EditOutlined } from '@ant-design/icons';
import type { FormItemProps } from 'antd/es/form';
import { trimPattern } from '@/constants';
import { FormField } from '../../../form-components';

const PortEditValue: React.FC<{ value?: string; onChange?: React.ChangeEventHandler<HTMLInputElement> }> = ({
  value,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { status } = Form.Item.useStatus();

  return (
    <>
      {isEditing ? (
        <Input style={{ width: 100 }} maxLength={12} value={value} onChange={onChange} />
      ) : (
        <span>{value}</span>
      )}
      {isEditing ? (
        status !== 'error' && (
          <CheckOutlined onClick={() => setIsEditing(false)} style={{ marginLeft: 4 }} className="AiAgent-link" />
        )
      ) : (
        <EditOutlined onClick={() => setIsEditing(true)} style={{ marginLeft: 4 }} className="AiAgent-link" />
      )}
    </>
  );
};

const PortEdit: React.FC<{ name: string } & Partial<FormItemProps>> = ({ name, ...formItemProps }) => {
  return (
    <span style={{ marginLeft: 8 }}>
      <FormField
        name={name}
        style={{ marginBottom: 0, display: 'inline-block', verticalAlign: 'baseline' }}
        rules={[
          { required: true, message: '请输入分支名' },
          { pattern: trimPattern, message: '不能以空格开头和结尾' },
        ]}
        {...formItemProps}
      >
        <PortEditValue />
      </FormField>
    </span>
  );
};

export default PortEdit;
