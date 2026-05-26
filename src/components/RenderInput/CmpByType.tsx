import React from 'react';
import { Form, Input, InputNumber, Select, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { ToolParamsTypeEnum, VARIABLE_TYPE_ALIAS_MAP } from '@/constants';
import './CmpByType.css';
import type { ToolNS } from '@/types/Tools';
import Ellipsis from '@ysf/ellipsis';
import type { FormLabelAlign } from 'antd/es/form/interface';

interface CmpByTypeParam extends Omit<ToolNS.ToolParamsType, 'type'> {
  type?: ToolParamsTypeEnum;
}
interface CmpByTypeProps {
  param: CmpByTypeParam;
  namePath?: (string | number)[];
  isChild?: boolean;
  isLastChild?: boolean;
  deep?: number;
  hideLabel?: boolean;
}

const CmpByType: React.FC<CmpByTypeProps> = ({
  param,
  namePath = [],
  isChild = false,
  isLastChild = false,
  deep = 1,
  hideLabel = false,
}) => {
  const currentNamePath = [...namePath, param.name];

  // 获取类型显示文本
  const getTypeText = (type?: ToolParamsTypeEnum) => {
    if (!type) return '未定义';

    return VARIABLE_TYPE_ALIAS_MAP[type] || type;
  };

  // 渲染标签
  const renderLabel = (name: string, type?: ToolParamsTypeEnum, subType?: ToolParamsTypeEnum) =>
    hideLabel ? null : (
      <div className={`param-label ${isChild ? 'child-param' : ''}`}>
        <Ellipsis width={'100%'}>
          <>
            <span className="param-name">{name}</span>

            <span className="param-type">
              ({getTypeText(type)}
              {type === ToolParamsTypeEnum.array ? ` <${getTypeText(subType || ToolParamsTypeEnum.string)}>` : ''})
            </span>
          </>
        </Ellipsis>
      </div>
    );

  const formItemProps = {
    className: isChild ? 'child-item' : '',
    labelAlign: 'left' as FormLabelAlign,
    labelCol: { span: 4, offset: deep - 1 },
    wrapperCol: hideLabel ? { span: 24 } : { span: 20 - (deep - 1) },
    rules: param.required ? [{ required: true, message: '请输入' }] : [],
  };

  if (!param.type) {
    return (
      <Form.Item
        name={currentNamePath}
        label={renderLabel(param.name, param.type)}
        initialValue={undefined}
        {...formItemProps}
        style={{ marginBottom: -8 }}
      >
        <>未定义</>
      </Form.Item>
    );
  }

  if (param.type === ToolParamsTypeEnum.object) {
    // 对象类型：展开子参数并递归渲染
    return (
      <div className={`object-param ${isChild ? 'child-item' : ''}`}>
        {!isLastChild && <div className="object-connector-line"></div>}
        <Form.Item label={renderLabel(param.name, param.type)} {...formItemProps} required={false}>
          <Input placeholder="请通过子节点进行配置" disabled={true} />
        </Form.Item>
        <div className="sub-params">
          {param.subParams?.map((child, index) => (
            <CmpByType
              key={child.name}
              param={child}
              namePath={currentNamePath}
              isChild={true}
              isLastChild={index === (param.subParams?.length || 0) - 1}
              deep={deep + 1}
            />
          ))}
        </div>
      </div>
    );
  }

  // 其余基础类型：使用对应的输入控件
  switch (param.type) {
    case ToolParamsTypeEnum.string:
      return (
        <Form.Item name={currentNamePath} label={renderLabel(param.name, param.type)} {...formItemProps}>
          <Input />
        </Form.Item>
      );
    case ToolParamsTypeEnum.integer:
    case ToolParamsTypeEnum.number:
      return (
        <Form.Item name={currentNamePath} label={renderLabel(param.name, param.type)} {...formItemProps}>
          <InputNumber
            style={{ width: '100%' }}
            precision={param.type === ToolParamsTypeEnum.integer ? 0 : undefined}
          />
        </Form.Item>
      );
    case ToolParamsTypeEnum.boolean:
      return (
        <Form.Item name={currentNamePath} label={renderLabel(param.name, param.type)} {...formItemProps}>
          <Select>
            <Select.Option value={true}>true</Select.Option>
            <Select.Option value={false}>false</Select.Option>
          </Select>
        </Form.Item>
      );
    // 数组类型：使用 Form.List 实现动态增删
    case ToolParamsTypeEnum.array:
      return (
        <div className="array-form-item">
          <Form.Item
            label={renderLabel(param.name, param.type, param.subType)}
            required={param.required}
            style={isChild ? { marginTop: 0 } : {}}
            {...formItemProps}
          >
            <Form.List
              name={currentNamePath}
              rules={[
                {
                  validator(rule, value, callback) {
                    if (param.required && !value?.length) {
                      callback('请输入');
                    } else {
                      callback();
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <div className="array-params">
                  {fields.map(({ key, name }, index) => (
                    <div
                      key={key}
                      className={`array-item ${deep > 1 ? 'child-item' : ''} ${index === fields.length - 1 ? 'is-last' : ''}`}
                    >
                      <CmpByType
                        param={{
                          type: param.subType || ToolParamsTypeEnum.string,
                          name: `${name}`,
                        }}
                        namePath={[]}
                        isChild={true}
                        isLastChild={false}
                        deep={deep}
                        hideLabel={true}
                      />
                      <Button
                        type="text"
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        className="remove-btn"
                      />
                    </div>
                  ))}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <div className="add-btn" onClick={() => add()}>
                      <PlusOutlined /> 新增
                    </div>
                  </Form.Item>
                  <Form.ErrorList errors={errors} />
                </div>
              )}
            </Form.List>
          </Form.Item>
        </div>
      );
    default:
      return (
        <Form.Item name={currentNamePath} label={renderLabel(param.name, param.type)} {...formItemProps}>
          <Input />
        </Form.Item>
      );
  }
};

export default CmpByType;
