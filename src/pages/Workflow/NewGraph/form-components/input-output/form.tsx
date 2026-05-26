import { FieldArray, nanoid } from '@flowgram.ai/free-layout-editor';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import './form.less';
import React, { useState } from 'react';
import { Button, Checkbox, Input } from 'antd';
import { Feedback } from '../feedback';
import { FormField } from '../form-field';
import type { InputParamsType } from './input';
import type { OutputParamsType } from './output';
import { useField, useForm, useWatch } from '../hooks';
import { Shanchu } from '@/assets/icons';
import TypeCascader from '@/components/TypeCascader';
import { ParamNameValidator, ToolParamsTypeEnum } from '@/constants';
import { useRecoilValue } from 'recoil';
import { GlobalConfigState } from '@/model';
import { validateRepeatItemName } from './util';
import cloneDeep from 'lodash/cloneDeep';
import type { SkipCheckFunction } from './form-with-value';
import { Empty } from '../empty';
import { PARAM_DESC_LIMIT, PARAM_NAME_LIMIT } from './const';
import FormFragment from '../../components/form-fragment';
import TooltipFormItem from '../../components/tooltip-form-item';

// ParamsForm组件的Props类型定义
export interface ParamsFormProps {
  /** 表单字段名称，默认为'outputParam' */
  name?: string;
  /** 表单标题，默认为'输出' */
  title?: string;
  /** 禁用的索引数组 */
  disabledIndexs?: number[];
  /** 是否禁用添加功能 */
  disableAdd?: boolean;
  /** 名称是否不可编辑 */
  nameUnEditable?: boolean;
  /** 是否禁用删除功能 */
  disableRemove?: boolean;
  /** 默认项目配置 */
  defaultItem?: Partial<InputParamsType | OutputParamsType>;
  /** 表单内容后的额外内容 */
  afterContent?: React.ReactNode;
  /** 是否不使用FormFragment包裹，默认为false */
  withoutFragment?: boolean;
}

const MAX_DEEP = 3;

interface ParamItemProps {
  name: string;
  index: number;
  remove?: (index: number) => void;
  nameUnEditable?: boolean;
  disableRemove?: boolean;
  subLimit?: number;
  deep?: number;
  hideRemove?: boolean;
  disabled?: boolean;
}

const ParamItem: React.FC<ParamItemProps> = React.memo(
  ({
    name,
    hideRemove = false,
    nameUnEditable = false,
    disableRemove = false,
    subLimit = 20,
    deep = 1,
    remove,
    index,
    disabled = false,
  }) => {
    const [showSub, setShowSub] = useState(true);
    const type = useWatch<number>(`${name}.type`);
    const subType = useWatch<number>(`${name}.subType`);
    const form = useForm();
    const cascaderValue = subType
      ? ([type, subType] as [ToolParamsTypeEnum, ToolParamsTypeEnum])
      : (type as ToolParamsTypeEnum);
    return (
      <>
        <div className="param-item">
          <FormField name={`${name}.name`} deps={[`${name}.subParams`]}>
            {({ value, onChange }) => {
              const subParamsLength = form.getValueIn(`${name}.subParams`) || []?.length;
              return (
                <div
                  tw="flex gap-1 items-center"
                  style={{ paddingLeft: (deep - 1) * 20 + (deep !== 1 && type !== ToolParamsTypeEnum.object ? 20 : 0) }}
                >
                  {subParamsLength ? (
                    <div onClick={() => setShowSub(!showSub)} className="sub-param-toggle">
                      {showSub ? <MinusOutlined /> : <PlusOutlined />}
                    </div>
                  ) : null}
                  <TooltipFormItem
                    Content={Input}
                    value={value}
                    onChange={onChange}
                    disabled={disabled || nameUnEditable}
                    maxLength={PARAM_NAME_LIMIT}
                    style={{ width: '100%' }}
                    placeholder="请输入变量名称"
                  />
                </div>
              );
            }}
          </FormField>
          <FormField<number> name={`${name}.type`}>
            {({ onChange }) => (
              <TypeCascader
                style={{ width: '100%' }}
                value={cascaderValue}
                disabled={disabled}
                disableObject={deep > MAX_DEEP}
                onChange={(value) => {
                  const type = value?.[0];
                  if (type === ToolParamsTypeEnum.object) {
                    form.setFieldValue(`${name}.subParams`, [{ id: nanoid(), deep: deep + 1 }]);
                    form.setFieldValue(`${name}.required`, false);
                  } else {
                    form.setFieldValue(`${name}.subParams`, undefined);
                  }
                  onChange(type);
                  if (type === ToolParamsTypeEnum.array) {
                    form.setFieldValue(`${name}.subType`, value?.[1]);
                  } else {
                    form.setFieldValue(`${name}.subType`, undefined);
                  }
                }}
                placeholder="请选择变量类型"
              />
            )}
          </FormField>
          <FormField name={`${name}.desc`}>
            <TooltipFormItem
              placeholder="帮助大模型理解变量含义"
              maxLength={PARAM_DESC_LIMIT}
              Content={Input}
              disabled={disabled}
            />
          </FormField>
          {disabled ? (
            <div></div>
          ) : (
            <FormField name={`${name}.required`} deps={[`${name}.subParams`]}>
              {({ value, onChange }) => {
                const subParamsLength = (form.getValueIn(`${name}.subParams`) || []).length;
                return (
                  <div className="param-actions">
                    <Checkbox onChange={onChange} checked={!!value} disabled={type === ToolParamsTypeEnum.object} />
                    {type === ToolParamsTypeEnum.object && subParamsLength < subLimit && deep <= MAX_DEEP && (
                      <PlusOutlined
                        onClick={() => {
                          const currentSubParams = form.getFieldValue(`${name}.subParams`) || [];
                          const newSubParam = {
                            id: nanoid(),
                            deep: deep + 1,
                          };
                          form.setFieldValue(`${name}.subParams.[${currentSubParams.length}]`, newSubParam);
                        }}
                      />
                    )}
                    <Shanchu
                      className="action-delete"
                      style={!disableRemove && !hideRemove ? {} : { visibility: 'hidden' }}
                      onClick={() => {
                        remove?.(index);
                      }}
                    />
                  </div>
                );
              }}
            </FormField>
          )}
        </div>
        <FieldArray name={`${name}.subParams`}>
          {({ field: subField }) => {
            const { remove } = subField;
            const subParamsLength = (subField.value || []).length;
            if (subParamsLength === 0) {
              return <></>;
            }
            return (
              <div className="sub-param-list param-list" style={showSub ? {} : { display: 'none' }}>
                {subField.map((subChild, index) => {
                  return (
                    <div key={subChild.key} className="sub-param-item">
                      <FormField name={subChild.name}>
                        <ParamItem
                          name={subChild.name}
                          disabled={disabled}
                          hideRemove={deep > 0 && subParamsLength <= 1}
                          deep={deep + 1}
                          index={index}
                          remove={remove}
                          nameUnEditable={nameUnEditable}
                          disableRemove={disableRemove}
                          subLimit={subLimit}
                        />
                      </FormField>
                    </div>
                  );
                })}
              </div>
            );
          }}
        </FieldArray>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.name === nextProps.name &&
      prevProps.hideRemove === nextProps.hideRemove &&
      prevProps.nameUnEditable === nextProps.nameUnEditable &&
      prevProps.disableRemove === nextProps.disableRemove &&
      prevProps.subLimit === nextProps.subLimit &&
      prevProps.deep === nextProps.deep &&
      prevProps.index === nextProps.index &&
      prevProps.disabled === nextProps.disabled
    );
  },
);

export const ParamsForm: React.FC<ParamsFormProps> = ({
  name = 'outputParam',
  title = '输出',
  disabledIndexs = [] as number[],
  disableAdd = false,
  nameUnEditable = false,
  disableRemove = false,
  defaultItem = {},
  afterContent,
  withoutFragment = false,
}) => {
  const globalConfig = useRecoilValue(GlobalConfigState) || {};
  const limit = globalConfig.paramLimit || 100;
  const subLimit = globalConfig.subParamLimit;
  const formContent = (
    <FieldArray name={name}>
      {({ field, fieldState }) => {
        const { value = [], append: add, remove } = field;
        return (
          <div tw="pt-4">
            {value.length === 0 ? (
              <Empty text="暂无变量，点击下方按钮添加" />
            ) : (
              <>
                <div className="param-header">
                  <div>
                    变量名称 <span style={{ color: '#FF4D4F' }}>*</span>
                  </div>
                  <div>
                    变量类型 <span style={{ color: '#FF4D4F' }}>*</span>
                  </div>
                  <div>
                    描述 <span style={{ color: '#FF4D4F' }}>*</span>
                  </div>
                  <div>必填</div>
                </div>
                <div className="param-list">
                  {field.map((child: { name: string; key: string }, index) => {
                    return (
                      <FormField name={child.name} key={child.key}>
                        <ParamItem
                          name={child.name}
                          disabled={disabledIndexs.includes(index)}
                          deep={1}
                          index={index}
                          remove={remove}
                          nameUnEditable={nameUnEditable}
                          disableRemove={disableRemove}
                          subLimit={subLimit}
                        />
                      </FormField>
                    );
                  })}
                </div>
              </>
            )}

            {!disableAdd && value.length < limit && (
              <Button
                type="link"
                block
                className="add-button"
                onClick={() => add({ id: nanoid(), deep: 1, ...cloneDeep(defaultItem) })}
              >
                <PlusOutlined />
                新增
              </Button>
            )}
            <Feedback errors={fieldState?.errors?.filter((item) => item.name === name)} style={{ marginTop: '8px' }} />
          </div>
        );
      }}
    </FieldArray>
  );

  return (
    <div className="m-params-form">
      {withoutFragment ? (
        <>
          {formContent}
          {afterContent}
        </>
      ) : (
        <FormFragment title={title}>
          {formContent}
          {afterContent}
        </FormFragment>
      )}
    </div>
  );
};

export const generateParamsFormValidateFields = <T = Record<string, unknown>>({
  inputName = 'outputParam',
  skipCheck,
  canEmpty = false,
}: {
  inputName?: string;
  canEmpty?: boolean;
  skipCheck?: SkipCheckFunction<T>; //用于联动数据的时候要不校验
} = {}) => {
  const validateName = ({ value, formValues, name }) => {
    if (skipCheck) {
      if (skipCheck(formValues)) {
        return undefined;
      }
    }
    if (value === undefined || value.trim() === '') {
      return '变量名称不能为空';
    }
    if (!ParamNameValidator.pattern.test(value)) {
      return ParamNameValidator.message;
    }
    // 根据name提取父级对象 item
    const arr = name.split('.');
    let item = formValues;
    // 去掉最后项
    for (let i = 0; i < arr.length - 1; i++) {
      item = item?.[arr[i]];
    }
    // 变量名重复, 要过滤自己
    if (validateRepeatItemName(item, formValues?.[inputName])) {
      return '变量名称重复';
    }
    return undefined;
  };

  const validateType = ({ value: setterValue }) => {
    if (setterValue === undefined || setterValue === null) {
      return '变量类型不能为空';
    }
    return undefined;
  };

  const validateDesc = ({ value: setterValue }) => {
    if (setterValue === undefined || setterValue === null || setterValue.trim() === '') {
      return '变量描述不能为空';
    }
    return undefined;
  };

  return {
    [inputName]: ({ value: setterValue, formValues }) => {
      if (skipCheck) {
        if (skipCheck(formValues)) {
          return undefined;
        }
      }
      if (canEmpty) {
        return undefined;
      }
      if (!setterValue || !Array.isArray(setterValue) || setterValue.length === 0) {
        return '变量不能为空';
      }
      return undefined;
    },
    [`${inputName}.*.type`]: validateType,
    [`${inputName}.*.desc`]: validateDesc,
    [`${inputName}.*.name`]: validateName,
    [`${inputName}.*.subParams.*.type`]: validateType,
    [`${inputName}.*.subParams.*.desc`]: validateDesc,
    [`${inputName}.*.subParams.*.name`]: validateName,
    [`${inputName}.*.subParams.*.subParams.*.type`]: validateType,
    [`${inputName}.*.subParams.*.subParams.*.desc`]: validateDesc,
    [`${inputName}.*.subParams.*.subParams.*.name`]: validateName,
    [`${inputName}.*.subParams.*.subParams.*.subParams.*.type`]: validateType,
    [`${inputName}.*.subParams.*.subParams.*.subParams.*.desc`]: validateDesc,
    [`${inputName}.*.subParams.*.subParams.*.subParams.*.name`]: validateName,
  };
};
