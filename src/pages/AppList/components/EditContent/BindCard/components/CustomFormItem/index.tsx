import React from 'react';
import { Form, type FormItemProps, Input } from 'antd';
import type { ToolNS } from '@/types/Tools';
import SelectParams from '@/components/SelectParams';
import ParamSelect from '@form/input-output/param-select';
import { ParamNameValidator } from '@/constants';
import { usePlayground } from '@flowgram.ai/free-layout-editor';

const CustomFormItem: React.FC<
  FormItemProps & {
    isSelectFromArray: boolean;
    isQuoteParamSelect?: boolean;
    responseParams: ToolNS.ToolParamsType[];
    placeholder?: string;
  }
> = ({ isSelectFromArray, isQuoteParamSelect, name, responseParams, placeholder, ...formItemProps }) => {
  const playground = usePlayground();
  const workflowreadonly = playground?.config?.readonly ?? false;
  return isSelectFromArray ? (
    <Form.Item
      name={name}
      {...formItemProps}
      rules={[
        ...(formItemProps?.rules || []),
        { pattern: ParamNameValidator.pattern, message: '参数名称只能包含字母、数字、下划线' },
      ]}
    >
      <Input placeholder={placeholder || `为${name}选择数据来源：请输入数组中的参数名称`} />
    </Form.Item>
  ) : isQuoteParamSelect ? (
    <Form.Item name={name} {...formItemProps}>
      <ParamSelect placeholder={placeholder || `为${name}选择数据来源`} disabled={workflowreadonly} />
    </Form.Item>
  ) : (
    <Form.Item name={name} {...formItemProps}>
      <SelectParams data={responseParams} placeholder={placeholder || `为${name}选择数据来源`} />
    </Form.Item>
  );
};

export default CustomFormItem;
