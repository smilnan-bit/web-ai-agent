import React from 'react';
import { Button, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './index.less';
import { IconShanchu } from '@/assets/icons';
import CustomFormItem from '../CustomFormItem';
import type { ToolNS } from '@/types/Tools';
import type { FieldItemType } from '../../constants';
import { ParamNameValidator } from '@/constants';

const CustomFields: React.FC<{
  name: string;
  isSelectFromArray: boolean;
  isQuoteParamSelect: boolean;
  responseParams: ToolNS.ToolParamsType[];
  validateRepeatField: Array<FieldItemType | Array<FieldItemType>>;
}> = ({ name, isSelectFromArray, isQuoteParamSelect, responseParams, validateRepeatField = [] }) => {
  const form = Form.useFormInstance();
  const fieldsValue = Form.useWatch(name, form);
  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <div className="customfields">
          {fields.map((field) => (
            <div key={field.key} className="customfields-item">
              <IconShanchu className="action-delete" size={16} onClick={() => remove(field.name)} />
              <Form.Item
                name={[field.name, 'key']}
                label={'变量名称'}
                dependencies={fields.map((item) => [name, item.name, 'key'])}
                rules={[
                  { required: true, message: '请输入变量名称' },
                  ParamNameValidator,
                  {
                    validator: (rule, value, callback) => {
                      if (
                        fieldsValue?.some((item: any, index) => item.key === value && index !== field.name) ||
                        validateRepeatField.flat().some((item) => item.name === value)
                      ) {
                        callback('变量名称已存在');
                      }
                      callback();
                    },
                  },
                ]}
              >
                <Input placeholder="请输入变量名称" maxLength={100} />
              </Form.Item>
              <CustomFormItem
                isQuoteParamSelect={isQuoteParamSelect}
                isSelectFromArray={isSelectFromArray}
                name={[field.name, 'value']}
                rules={[{ required: true, message: isSelectFromArray ? '请输入' : '请选择' }]}
                responseParams={responseParams}
                placeholder={isSelectFromArray ? '请输入数组中的参数名称' : '为自定义变量选择数据来源'}
                label="数据来源"
              />
            </div>
          ))}

          <Button
            type="link"
            onClick={() => (fields.length >= 15 ? message.error('超出15个上限') : add({}))}
            icon={<PlusOutlined />}
            className="add-button"
          >
            添加自定义数据
          </Button>
        </div>
      )}
    </Form.List>
  );
};

export default CustomFields;
