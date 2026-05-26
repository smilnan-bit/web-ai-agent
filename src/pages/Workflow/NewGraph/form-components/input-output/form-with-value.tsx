import { Feedback, useForm, useWatch } from '@form';
import React, { type ReactNode, useState } from 'react';
import { FieldArray, getNodePrivateScope, getNodeScope } from '@flowgram.ai/free-layout-editor';
import { PlusOutlined, MinusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Input, Button, Tooltip, Select, Checkbox } from 'antd';
import { Shanchu } from '@/assets/icons';
import { FormField } from '@form';
import ParamsFormWithValueItem from './form-item';
import './form-with-value.less';
import { ParamNameValidator, ToolParamsTypeEnum, ToolParamsTypeShowEnum } from '@/constants';
import { useMemoizedFn } from 'ahooks';
import { nanoid } from 'nanoid';
import type { InputParamsType } from '@form';
import { useRecoilValue } from 'recoil';
import { GlobalConfigState } from '@/model';
import {
  GLOBAL_VARIABLE_ID,
  getGlobalVariableMap,
  SimpleParamTypeEnum,
  VariableNameSplitSymbol,
  VariableSplitSymbol,
  type VarType,
} from '../../constants';
import { validateRepeatItemName } from './util';
import { getSourceVariable } from '../../utils/variables';
import type { WorkflowNS } from '@/types/Workflow';
import { Empty } from '../empty';
import { VARIABLE_TYPE_ARRAY_ICON, VARIABLE_TYPE_ICON } from '@/constants';
import { PARAM_NAME_LIMIT } from './const';
import TooltipFormItem from '../../components/tooltip-form-item';
import FormFragment from '../../components/form-fragment';

const DescShower: React.FC<{ value?: string; style: React.CSSProperties }> = ({ value, style = {} }) => (
  <Tooltip title={value}>
    <ExclamationCircleOutlined style={{ color: 'var(--tip-color)', ...style }} />
  </Tooltip>
);

interface ParamItemProps {
  name: string;
  remove: (index: number) => void;
  index: number;
  quoteValType?: ToolParamsTypeEnum;
  nameUnEditable?: boolean;
  disableRemove?: boolean;
  checkType?: boolean;
  showDesc?: boolean;
  showType?: boolean;
  noOperation?: boolean;
  deep?: number;
  selectNames?: VarType[];
  disableValueType?: boolean;
  excludeValType?: ToolParamsTypeEnum[];
  quoteValSubType?: ToolParamsTypeEnum[];
  showRequired?: boolean;
}

const ParamItem: React.FC<ParamItemProps> = React.memo(
  ({
    name,
    remove,
    index,
    quoteValType,
    nameUnEditable = false,
    disableRemove = false,
    showDesc = false,
    checkType = false,
    showType = false,
    noOperation = false,
    deep = 1,
    selectNames,
    disableValueType = false,
    excludeValType,
    quoteValSubType,
    showRequired = false,
  }) => {
    const [showSub, setShowSub] = useState(true);
    const desc = useWatch<string>(`${name}.desc`) ?? '';
    const type = useWatch<number>(`${name}.type`);
    const subType = useWatch<number>(`${name}.subType`) ?? ToolParamsTypeEnum.string;
    const subParamsLength = useWatch<InputParamsType[]>(`${name}.subParams`)?.length || 0;
    const form = useForm();
    if (checkType) {
      quoteValType = type as ToolParamsTypeEnum;
    }
    // 如果没有定义变量名，则把参数的名字带过去
    const onQuoteValueChange = useMemoizedFn((value?: string) => {
      if (nameUnEditable || selectNames) {
        return;
      }
      if (value) {
        const [nodeId, variableName] = value.split(VariableSplitSymbol);
        if (nodeId === GLOBAL_VARIABLE_ID) {
          console.log(getGlobalVariableMap());
          form.setFieldValue(`${name}.name`, getGlobalVariableMap()[variableName]?.name || '');
        } else {
          form.setFieldValue(`${name}.name`, variableName.split(VariableNameSplitSymbol).slice(-1).join(''));
        }
      }
    });
    return (
      <>
        <div className="param-item">
          <div className="param-name">
            <FormField name={`${name}.name`}>
              {({ value, onChange, status }) => {
                return (
                  <div
                    tw="flex items-center gap-1"
                    style={{
                      paddingLeft: (deep - 1) * 20 + (deep !== 1 && type !== ToolParamsTypeEnum.object ? 20 : 0),
                    }}
                  >
                    {subParamsLength ? (
                      <div onClick={() => setShowSub(!showSub)} className="sub-param-toggle">
                        {showSub ? <MinusOutlined /> : <PlusOutlined />}
                      </div>
                    ) : null}
                    {selectNames ? (
                      <Select
                        status={status === 'error' ? 'error' : undefined}
                        style={{ width: '100%' }}
                        options={selectNames.map((item) => ({ label: item.name, value: item.id }))}
                        value={value}
                        onChange={onChange}
                      />
                    ) : (
                      <TooltipFormItem
                        status={status === 'error' ? 'error' : undefined}
                        placeholder="变量名称"
                        maxLength={PARAM_NAME_LIMIT}
                        disabled={nameUnEditable}
                        Content={Input}
                        value={value}
                        onChange={onChange}
                        style={{ flex: 1 }}
                      />
                    )}
                    {showDesc ? <DescShower style={{ marginLeft: 4 }} value={desc} /> : null}
                  </div>
                );
              }}
            </FormField>
          </div>
          {showRequired ? (
            <div className="param-required">
              <FormField<boolean> name={`${name}.required`} style={{ alignItems: 'center' }}>
                {({ onChange, value }) => (
                  <Checkbox onChange={(e) => onChange(e.target.checked)} checked={!!value} disabled={true} />
                )}
              </FormField>
            </div>
          ) : null}
          {showType ? (
            <div className="param-type" tw="cursor-pointer">
              <TooltipFormItem
                Content={() =>
                  type === ToolParamsTypeEnum.array ? VARIABLE_TYPE_ARRAY_ICON[subType] : VARIABLE_TYPE_ICON[type]
                }
                tooltipProps={{
                  title:
                    type === ToolParamsTypeEnum.array
                      ? `${ToolParamsTypeShowEnum[type]}<${ToolParamsTypeShowEnum[subType]}>`
                      : ToolParamsTypeShowEnum[type],
                }}
                style={{ alignItems: 'center', display: 'flex', height: 32, justifyContent: 'center' }}
              />
            </div>
          ) : null}
          <div className="param-value" tw="flex gap-2">
            {type !== ToolParamsTypeEnum.object ? (
              <ParamsFormWithValueItem
                excludeValType={excludeValType}
                placeholder="请输入变量值"
                quoteValType={quoteValType}
                quoteValSubType={quoteValSubType?.length ? quoteValSubType : ([subType] as ToolParamsTypeEnum[])}
                onQuoteValueChange={onQuoteValueChange}
                disableValueType={disableValueType}
              />
            ) : (
              <Input placeholder="请通过添加子节点进行配置" disabled />
            )}
          </div>
          {!noOperation ? (
            <div className="param-actions">
              {!disableRemove && (
                <Button type="link" onClick={() => remove(index)}>
                  <Shanchu className="action-delete" />
                </Button>
              )}
            </div>
          ) : null}
        </div>
        {subParamsLength ? (
          <FieldArray name={`${name}.subParams`}>
            {({ field: subField }) => {
              const { remove } = subField;
              return (
                <div className="sub-param-list param-list" style={showSub ? {} : { display: 'none' }}>
                  {subField.map((subChild: { name: string; key: string }, subIndex: number) => (
                    <FormField name={subChild.name} key={subChild.key}>
                      <ParamItem
                        name={subChild.name}
                        remove={remove}
                        index={subIndex}
                        showDesc={showDesc}
                        checkType={checkType}
                        showType={showType}
                        quoteValType={quoteValType}
                        nameUnEditable={nameUnEditable}
                        disableRemove={disableRemove}
                        noOperation={noOperation}
                        deep={deep + 1}
                        showRequired={showRequired}
                      />
                    </FormField>
                  ))}
                </div>
              );
            }}
          </FieldArray>
        ) : null}
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.name === nextProps.name &&
      prevProps.quoteValType === nextProps.quoteValType &&
      prevProps.deep === nextProps.deep &&
      prevProps.showDesc === nextProps.showDesc &&
      prevProps.showType === nextProps.showType &&
      prevProps.noOperation === nextProps.noOperation &&
      prevProps.disableRemove === nextProps.disableRemove &&
      prevProps.nameUnEditable === nextProps.nameUnEditable &&
      prevProps.index === nextProps.index &&
      prevProps.checkType === nextProps.checkType
    );
  },
);

interface SimpleParamsNewProps {
  name?: string;
  title?: ReactNode;
  desc?: string;
  limit?: number;
  disableAdd?: boolean;
  quoteValType?: ToolParamsTypeEnum | ToolParamsTypeEnum[];
  nameUnEditable?: boolean;
  disableRemove?: boolean;
  showDesc?: boolean;
  showType?: boolean;
  checkType?: boolean;
  noOperation?: boolean;
  mode?: ParamsFormWithValueModeEnum;
  selectNames?: VarType[];
  disableValueType?: boolean;
  excludeValType?: ToolParamsTypeEnum[];
  quoteValSubType?: ToolParamsTypeEnum[];
  showRequired?: boolean;
  needFragWrap?: boolean;
}

const CommonHeader = () => {
  return (
    <div className="param-header">
      <div className="param-name-header">
        变量名称 <span style={{ color: '#FF4D4F' }}>*</span>
      </div>
      <div className="param-value-header">
        变量值 <span style={{ color: '#FF4D4F' }}>*</span>
      </div>
      <div className="param-actions-header"></div>
    </div>
  );
};

const HeaderWithType = ({ showRequired = false }: { showRequired?: boolean }) => {
  return (
    <div className="param-header">
      <div className="param-name-header">
        变量名称 <span style={{ color: '#FF4D4F' }}>*</span>
      </div>
      {showRequired ? <div className="param-required-header">必填</div> : null}
      <div className="param-type-header">变量类型</div>
      <div className="param-value-header">变量值</div>
    </div>
  );
};

export enum ParamsFormWithValueModeEnum {
  common = 'common',
  fixedNameAndType = 'fixedNameAndType',
}

export const ParamsFormWithValue: React.FC<SimpleParamsNewProps> = ({
  name = 'inputParam',
  title = '输入',
  desc = '',
  quoteValType,
  nameUnEditable,
  disableAdd,
  disableRemove,
  showDesc,
  showType,
  checkType,
  selectNames,
  mode = ParamsFormWithValueModeEnum.common,
  noOperation,
  disableValueType,
  excludeValType,
  quoteValSubType,
  showRequired,
  needFragWrap = true,
}) => {
  const globalConfig = useRecoilValue(GlobalConfigState) || {};
  const limit = globalConfig.paramLimit || 100;
  if (mode === ParamsFormWithValueModeEnum.fixedNameAndType) {
    showType = true;
    showDesc = showDesc ?? true;
    checkType = true;
    nameUnEditable = true;
    noOperation = true;
    disableAdd = true;
    showRequired = true;
  }
  const fieldArrayContent = (
    <FieldArray name={name}>
      {({ field, fieldState }) => {
        const { value = [], append: add, remove } = field;
        return (
          <div tw="pt-4">
            {value?.length === 0 ? (
              <Empty text="暂无变量，点击下方按钮添加" />
            ) : (
              <>
                {showType ? <HeaderWithType showRequired={showRequired} /> : <CommonHeader />}
                <div className="param-list">
                  {field.map((child: { name: string; key: string }, index: number) => (
                    <FormField name={child.name} key={child.key}>
                      <ParamItem
                        remove={remove}
                        index={index}
                        showDesc={showDesc}
                        checkType={checkType}
                        showType={showType}
                        quoteValType={quoteValType}
                        nameUnEditable={nameUnEditable}
                        disableRemove={disableRemove}
                        noOperation={noOperation}
                        deep={1}
                        name={child.name}
                        selectNames={selectNames}
                        disableValueType={disableValueType}
                        excludeValType={excludeValType}
                        quoteValSubType={quoteValSubType}
                        showRequired={showRequired}
                      />
                    </FormField>
                  ))}
                </div>
              </>
            )}

            {!disableAdd && value.length < limit && (
              <Button
                type="link"
                block
                onClick={() => add({ id: nanoid(), valueType: SimpleParamTypeEnum.quote, deep: 1 })}
                className="add-button"
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
    <div className="m-params-value-form">
      {needFragWrap ? (
        <FormFragment title={title} desc={desc}>
          {fieldArrayContent}
        </FormFragment>
      ) : (
        fieldArrayContent
      )}
    </div>
  );
};

// -------- 旧数据兼容校验：输入模式下按 type 校验 value 格式 --------

function validateArrayElementsBySubType(parsed: unknown[], subType: ToolParamsTypeEnum): string | undefined {
  for (let i = 0; i < parsed.length; i++) {
    const el = parsed[i];
    if ([undefined, '', null].includes(el as string | null | undefined)) {
      return '不能为空';
    }
    switch (subType) {
      case ToolParamsTypeEnum.integer: {
        const num = Number(el);
        if (Number.isNaN(num) || !Number.isInteger(num))
          return `数组元素类型不匹配（第 ${i + 1} 项需为整数），请重新填写`;
        break;
      }
      case ToolParamsTypeEnum.number: {
        if (Number.isNaN(Number(el))) return `数组元素类型不匹配（第 ${i + 1} 项需为数字），请重新填写`;
        break;
      }
      case ToolParamsTypeEnum.boolean: {
        if (el !== 'true' && el !== 'false') return `数组元素类型不匹配（第 ${i + 1} 项需为 true / false），请重新填写`;
        break;
      }
      default:
        break;
    }
  }
  return undefined;
}

function validateValueByType(
  type: ToolParamsTypeEnum,
  value: string | undefined,
  subType?: ToolParamsTypeEnum,
): string | undefined {
  // 空值不校验（由 required 规则处理）
  if (value === undefined || value === '') return undefined;

  switch (type) {
    case ToolParamsTypeEnum.integer: {
      if (!/^-?\d+$/.test(value.trim())) {
        return '当前值与参数类型不匹配（需为整数），请重新填写';
      }
      break;
    }
    case ToolParamsTypeEnum.number: {
      if (Number.isNaN(Number(value))) {
        return '当前值与参数类型不匹配（需为数字），请重新填写';
      }
      break;
    }
    case ToolParamsTypeEnum.boolean: {
      if (value !== 'true' && value !== 'false') {
        return '当前值与参数类型不匹配（需为 true / false），请重新填写';
      }
      break;
    }
    case ToolParamsTypeEnum.array: {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          return '当前值与参数类型不匹配（需为数组），请重新填写';
        }
        if (subType !== undefined) {
          const subTypeError = validateArrayElementsBySubType(parsed, subType);
          return subTypeError;
        }
      } catch (_) {
        return '当前值与参数类型不匹配（需为合法 JSON 数组），请重新填写';
      }
      break;
    }
    default:
      break;
  }
  return undefined;
}

export type CheckTypeFunction<T = Record<string, unknown>> = (params: {
  param: WorkflowNS.WorkflowSimpleParamType;
  sourceType: number;
  sourceSubType: number | undefined;
  formValues: T;
  name: string;
}) => boolean;

export type SkipCheckFunction<T = Record<string, unknown>> = (formValues: T) => boolean;

export const genInputParamValidate = <T = Record<string, unknown>>({
  inputName = 'inputParam',
  checkType,
  customcheckName,
  skipCheck,
  canEmpty = false,
  checkRequired = false,
  noCheckName = false,
  privateScope = false,
  checkInputValueType = false,
}: {
  inputName?: string;
  checkType?: CheckTypeFunction<T>;
  skipCheck?: SkipCheckFunction<T>; //用于联动数据的时候要不校验
  canEmpty?: boolean;
  checkRequired?: boolean;
  noCheckName?: boolean;
  customcheckName?: (name: string) => string | undefined;
  privateScope?: boolean; // 是否是私有作用域变量
  checkInputValueType?: boolean;
} = {}) => {
  const validateName = ({ value, formValues, name }) => {
    if (noCheckName) {
      return undefined;
    }
    if (skipCheck) {
      if (skipCheck(formValues)) {
        return undefined;
      }
    }
    if (value === undefined || value?.toString().trim() === '') {
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
    if (customcheckName) {
      return customcheckName(value);
    }
    return undefined;
  };

  const validateValue = ({ value, formValues, context, name }) => {
    if (skipCheck) {
      if (skipCheck(formValues)) {
        return undefined;
      }
    }
    // 根据name提取父级对象 item
    const arr = name.split('.');
    let item = formValues;
    // 去掉最后项
    for (let i = 0; i < arr.length - 1; i++) {
      item = item?.[arr[i]];
    }
    if (item?.type === ToolParamsTypeEnum.object) {
      return undefined;
    } else if (
      item.valueType === SimpleParamTypeEnum.input &&
      checkInputValueType &&
      ![undefined, null].includes(item.value) &&
      String(item.value).trim() !== ''
    ) {
      return validateValueByType(item.type, item.value, item.subType);
    } else if (checkRequired && item.type !== ToolParamsTypeEnum.object && !item.required) {
      return undefined;
    } else if (value === undefined || value.trim() === '') {
      return '变量值不能为空';
    }

    if (item?.valueType === SimpleParamTypeEnum.quote) {
      const scope = privateScope ? getNodePrivateScope(context.node) : getNodeScope(context.node);
      const availableVariables = scope.available.variables;
      const sourceVariable = getSourceVariable(value, availableVariables);
      if (!sourceVariable) {
        return '引用的变量不存在';
      } else if (checkType) {
        //引用变量类型不对
        if (
          !checkType({
            name: name,
            param: item,
            sourceType: sourceVariable.meta.type,
            sourceSubType: sourceVariable.meta.subType,
            formValues,
          })
        ) {
          return '引用的变量类型未匹配';
        }
      }
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
    [`${inputName}.*.name`]: validateName,

    [`${inputName}.*.value`]: validateValue,
    [`${inputName}.*.subParams.*.name`]: validateName,
    [`${inputName}.*.subParams.*.value`]: validateValue,
    [`${inputName}.*.subParams.*.subParams.*.name`]: validateName,
    [`${inputName}.*.subParams.*.subParams.*.value`]: validateValue,
    [`${inputName}.*.subParams.*.subParams.*.subParams.*.name`]: validateName,
    [`${inputName}.*.subParams.*.subParams.*.subParams.*.value`]: validateValue,
  };
};
