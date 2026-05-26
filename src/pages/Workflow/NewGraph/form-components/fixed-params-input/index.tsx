import React, { useState } from 'react';
import { Button, Checkbox, Input, InputNumber, Select } from 'antd';
import { PlusOutlined, MinusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { FieldArray } from '@flowgram.ai/free-layout-editor';
import { FormField, useField, useWatch } from '@form';
import { ToolParamsTypeEnum } from '@/constants';
import { ToolParamsTypeShowEnum, VARIABLE_TYPE_ARRAY_ICON, VARIABLE_TYPE_ICON } from '@/constants';
import EnumSelect from '@/components/EnumSelect';
import TooltipFormItem from '../../components/tooltip-form-item';
import { SimpleParamTypeConfig, SimpleParamTypeEnum } from '../../constants';
import ParamSelect from '../input-output/param-select';
import { ToolParamsTypeEnum as ParamsTypeEnum } from '@/constants/enum';
import FormFragment from '../../components/form-fragment';
import '../input-output/form-with-value.less';
import './index.less';

const ModuleName = 'FixedParamsInput';

// -------- 工具函数：按类型渲染「输入」模式控件 --------

interface InputByTypeProps {
  value?: string;
  onChange: (v: string) => void;
  status?: string;
  disabled?: boolean;
}

function renderInputByType(
  type: ToolParamsTypeEnum,
  subType: ToolParamsTypeEnum,
  props: InputByTypeProps,
): React.ReactNode {
  const { value, onChange, status, disabled } = props;
  switch (type) {
    case ParamsTypeEnum.integer:
    case ParamsTypeEnum.number:
      return (
        <InputNumber
          style={{ width: '100%' }}
          value={value !== '' && value !== undefined ? Number(value) : undefined}
          onChange={(v) => onChange(String(v ?? ''))}
          status={status === 'error' ? 'error' : undefined}
          disabled={disabled}
          placeholder="请输入"
        />
      );
    case ParamsTypeEnum.boolean:
      return (
        <Select
          style={{ width: '100%' }}
          value={value}
          onChange={(v) => onChange(String(v))}
          status={status === 'error' ? 'error' : undefined}
          disabled={disabled}
          placeholder="请选择"
        >
          <Select.Option value="true">true</Select.Option>
          <Select.Option value="false">false</Select.Option>
        </Select>
      );
    default:
      return (
        <Input
          placeholder="请输入"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          status={status === 'error' ? 'error' : undefined}
          disabled={disabled}
          maxLength={100}
        />
      );
  }
}

// -------- Array 行渲染 --------
// value 字段存 JSON 字符串，如 '["a","b"]'，UI 层 parse/stringify

function parseArrayValue(raw?: string): string[] {
  if (!raw) return [];
  // 如果是合法的 JSON 数组则解析，否则（如引用字符串）兜底返回空数组
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch (_) {
    // 非 JSON（如变量引用字符串），兜底返回空数组
  }
  return [];
}

function stringifyArrayValue(rows: string[]): string {
  return JSON.stringify(rows);
}

interface ArrayRowsProps {
  name: string;
  subType: ToolParamsTypeEnum;
}

const ArrayRows: React.FC<ArrayRowsProps> = ({ name, subType }) => {
  return (
    <FormField<string> name={`${name}.value`}>
      {(field) => {
        const rows = parseArrayValue(field.value);

        const updateRows = (next: string[]) => {
          field.onChange(stringifyArrayValue(next));
        };

        return (
          <div>
            {rows.length === 0 && (
              <Button
                type="link"
                size="small"
                tw="h-[32px]"
                icon={<PlusOutlined />}
                onClick={() => field.onChange(stringifyArrayValue(['']))}
              >
                新增
              </Button>
            )}
            {rows.map((row, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: array 元素无稳定 ID
              <div key={index} className={`${ModuleName}-array-row`}>
                <div className={`${ModuleName}-array-row-input`}>
                  {
                    renderInputByType(subType, subType, {
                      value: row,
                      onChange: (v) => {
                        const next = [...rows];
                        next[index] = v;
                        updateRows(next);
                      },
                    }) as React.ReactElement
                  }
                </div>
                <div className={`${ModuleName}-array-row-actions`}>
                  <Button
                    type="link"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      const next = [...rows];
                      next.splice(index + 1, 0, '');
                      updateRows(next);
                    }}
                  />
                  <Button
                    type="link"
                    size="small"
                    icon={<MinusOutlined />}
                    onClick={() => {
                      const next = rows.filter((_, i) => i !== index);
                      field.onChange(next.length > 0 ? stringifyArrayValue(next) : undefined);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      }}
    </FormField>
  );
};

// -------- 单参数行的值区域 --------

interface ParamValueCellProps {
  name: string;
  type: ToolParamsTypeEnum;
  subType: ToolParamsTypeEnum;
  quoteValType?: ToolParamsTypeEnum | ToolParamsTypeEnum[];
  quoteValSubType?: ToolParamsTypeEnum[];
  excludeValType?: ToolParamsTypeEnum[];
}

const ParamValueCell: React.FC<ParamValueCellProps> = ({
  name,
  type,
  subType,
  quoteValType,
  quoteValSubType,
  excludeValType,
}) => {
  const itemField = useField();
  const valueType = useWatch<number>(`${name}.valueType`);

  // Object 类型：占位只读框，值由 subParams 子字段承载
  if (type === ParamsTypeEnum.object) {
    return (
      <div tw="flex-[4] min-w-0 overflow-hidden">
        <Input placeholder="请通过添加子节点进行配置" disabled />
      </div>
    );
  }

  // Array 类型：输入/引用切换，输入模式走行级增删
  if (type === ParamsTypeEnum.array) {
    return (
      <div tw="flex items-start gap-[8px] w-full">
        {/* 输入/引用 切换下拉 */}
        <div tw="flex-[1] min-w-0" style={{ minWidth: 64, maxWidth: 72 }}>
          <FormField<number> name={`${name}.valueType`}>
            <EnumSelect
              optionsConfig={SimpleParamTypeConfig}
              hasAll={false}
              onChange={(value) => {
                itemField.onChange({
                  ...(itemField.value as Record<string, unknown>),
                  valueType: value,
                  value: undefined,
                });
              }}
              hasSortValue={true}
            />
          </FormField>
        </div>

        {/* 值输入区域 */}
        <div tw="flex-[3] min-w-0 overflow-hidden">
          {valueType === SimpleParamTypeEnum.input ? (
            <ArrayRows name={name} subType={subType} />
          ) : (
            <FormField<string> name={`${name}.value`}>
              {(field) => {
                // value 可能是 JSON 数组字符串（从「输入」模式切换过来），需要清空后再传给 ParamSelect
                const safeValue =
                  typeof field.value === 'string' && !field.value.startsWith('[') ? field.value : undefined;
                return (
                  <ParamSelect
                    hasError={field.status === 'error'}
                    quoteValType={quoteValType ?? (type as ToolParamsTypeEnum)}
                    quoteValSubType={quoteValSubType?.length ? quoteValSubType : ([subType] as ToolParamsTypeEnum[])}
                    excludeValType={excludeValType}
                    value={safeValue}
                    onChange={(value) => field.onChange(value)}
                    placeholder="请选择引用变量"
                  />
                );
              }}
            </FormField>
          )}
        </div>
      </div>
    );
  }

  // 其他基本类型：输入/引用切换
  return (
    <>
      {/* 输入/引用 切换下拉 */}
      <div tw="flex-[1] min-w-0" style={{ minWidth: 64, maxWidth: 72 }}>
        <FormField<number> name={`${name}.valueType`}>
          <EnumSelect
            optionsConfig={SimpleParamTypeConfig}
            hasAll={false}
            onChange={(value) => {
              itemField.onChange({
                ...(itemField.value as Record<string, unknown>),
                valueType: value,
                value: undefined,
              });
            }}
            hasSortValue={true}
          />
        </FormField>
      </div>

      {/* 值输入区域：「输入」模式按类型渲染，「引用」模式渲染 ParamSelect */}
      <div tw="flex-[3] min-w-0 overflow-hidden">
        <FormField<string> name={`${name}.value`}>
          {(field) =>
            valueType === SimpleParamTypeEnum.input ? (
              (renderInputByType(type, subType, {
                value: field.value,
                onChange: (v) => field.onChange(v),
                status: field.status,
              }) as React.ReactElement)
            ) : (
              <ParamSelect
                hasError={field.status === 'error'}
                quoteValType={quoteValType ?? (type as ToolParamsTypeEnum)}
                quoteValSubType={quoteValSubType?.length ? quoteValSubType : ([subType] as ToolParamsTypeEnum[])}
                excludeValType={excludeValType}
                value={field.value}
                onChange={(value) => field.onChange(value)}
                placeholder="请选择引用变量"
              />
            )
          }
        </FormField>
      </div>
    </>
  );
};

// -------- 单参数行（支持递归渲染 subParams） --------

interface ParamInputItemProps {
  name: string;
  index: number;
  deep?: number;
  showDesc?: boolean;
  quoteValType?: ToolParamsTypeEnum | ToolParamsTypeEnum[];
  quoteValSubType?: ToolParamsTypeEnum[];
  excludeValType?: ToolParamsTypeEnum[];
}

const ParamInputItem: React.FC<ParamInputItemProps> = ({
  name,
  index,
  deep = 1,
  showDesc,
  quoteValType,
  quoteValSubType,
  excludeValType,
}) => {
  const [showSub, setShowSub] = useState(true);
  const type = useWatch<ToolParamsTypeEnum>(`${name}.type`);
  const subType = useWatch<ToolParamsTypeEnum>(`${name}.subType`) ?? ParamsTypeEnum.string;
  const desc = useWatch<string>(`${name}.desc`) ?? '';
  const subParamsLength = useWatch<unknown[]>(`${name}.subParams`)?.length ?? 0;

  const indentLeft = (deep - 1) * 20 + (deep !== 1 && type !== ParamsTypeEnum.object ? 20 : 0);

  return (
    <>
      <div className="param-item">
        {/* 变量名称列 */}
        <div className="param-name">
          <FormField name={`${name}.name`}>
            {({ value, onChange, status }) => (
              <div tw="flex items-center gap-1" style={{ paddingLeft: indentLeft }}>
                {subParamsLength ? (
                  <div onClick={() => setShowSub(!showSub)} className="sub-param-toggle">
                    {showSub ? <MinusOutlined /> : <PlusOutlined />}
                  </div>
                ) : null}
                <TooltipFormItem
                  status={status === 'error' ? 'error' : undefined}
                  placeholder="变量名称"
                  disabled={true}
                  Content={Input}
                  value={value}
                  onChange={onChange}
                  style={{ flex: 1 }}
                />
                {showDesc && desc ? (
                  <Tooltip title={desc}>
                    <ExclamationCircleOutlined style={{ color: 'var(--tip-color)', marginLeft: 4 }} />
                  </Tooltip>
                ) : null}
              </div>
            )}
          </FormField>
        </div>

        {/* 必填列 */}
        <div className="param-required">
          <FormField<boolean> name={`${name}.required`} style={{ alignItems: 'center' }}>
            {({ value }) => <Checkbox checked={!!value} disabled style={{ cursor: 'not-allowed' }} />}
          </FormField>
        </div>

        {/* 类型图标列 */}
        <div className="param-type" tw="cursor-pointer items-center justify-center">
          <TooltipFormItem
            Content={() =>
              type === ToolParamsTypeEnum.array ? VARIABLE_TYPE_ARRAY_ICON[subType] : VARIABLE_TYPE_ICON[type]
            }
            tooltipProps={{
              title:
                type === ParamsTypeEnum.array
                  ? `${ToolParamsTypeShowEnum[type]}<${ToolParamsTypeShowEnum[subType]}>`
                  : ToolParamsTypeShowEnum[type],
            }}
            style={{ alignItems: 'center', display: 'flex', height: 32, justifyContent: 'center' }}
          />
        </div>

        {/* 值列 */}
        <div className={`param-value ${ModuleName}-value`}>
          <ParamValueCell
            name={name}
            type={type}
            subType={subType}
            quoteValType={quoteValType}
            quoteValSubType={quoteValSubType}
            excludeValType={excludeValType}
          />
        </div>
      </div>

      {/* subParams 递归渲染 */}
      {subParamsLength ? (
        <FieldArray name={`${name}.subParams`}>
          {({ field: subField }) => (
            <div className="sub-param-list param-list" style={showSub ? {} : { display: 'none' }}>
              {subField.map((subChild: { name: string; key: string }, subIndex: number) => (
                <FormField name={subChild.name} key={subChild.key}>
                  <ParamInputItem
                    name={subChild.name}
                    index={subIndex}
                    deep={deep + 1}
                    showDesc={showDesc}
                    quoteValType={quoteValType}
                    quoteValSubType={quoteValSubType}
                    excludeValType={excludeValType}
                  />
                </FormField>
              ))}
            </div>
          )}
        </FieldArray>
      ) : null}
    </>
  );
};

// -------- 主组件 --------

export interface FixedParamsInputProps {
  /** flowgram form 中的字段名，默认 'inputParam' */
  name?: string;
  /** 是否展示参数描述 */
  showDesc?: boolean;
  /** 引用模式允许的变量类型 */
  quoteValType?: ToolParamsTypeEnum | ToolParamsTypeEnum[];
  /** 引用模式允许的数组子类型 */
  quoteValSubType?: ToolParamsTypeEnum[];
  /** 引用模式排除的变量类型 */
  excludeValType?: ToolParamsTypeEnum[];
  /** 是否用 FormFragment（带标题折叠块）包裹，默认 true；传 false 时直接渲染参数列表 */
  needFragWrap?: boolean;
  /** FormFragment 标题，needFragWrap=true 时生效，默认「输入」 */
  title?: string;
  /** FormFragment 描述，needFragWrap=true 时生效 */
  desc?: string;
}

const FixedParamsInput: React.FC<FixedParamsInputProps> = ({
  name = 'inputParam',
  showDesc,
  quoteValType,
  quoteValSubType,
  excludeValType,
  needFragWrap = true,
  title = '输入',
  desc,
}) => {
  const content = (
    <FieldArray name={name}>
      {({ field }) => (
        <div className="m-params-value-form">
          {/* 表头 */}
          <div className="param-header">
            <div className="param-name-header">
              变量名称 <span style={{ color: '#FF4D4F' }}>*</span>
            </div>
            <div className="param-required-header">必填</div>
            <div className="param-type-header">变量类型</div>
            <div className="param-value-header">变量值</div>
          </div>
          {/* 参数行列表 */}
          <div className="param-list">
            {field.map((child: { name: string; key: string }, index: number) => (
              <FormField name={child.name} key={child.key}>
                <ParamInputItem
                  name={child.name}
                  index={index}
                  deep={1}
                  showDesc={showDesc}
                  quoteValType={quoteValType}
                  quoteValSubType={quoteValSubType}
                  excludeValType={excludeValType}
                />
              </FormField>
            ))}
          </div>
        </div>
      )}
    </FieldArray>
  );

  if (needFragWrap) {
    return (
      <FormFragment title={title} desc={desc}>
        {content}
      </FormFragment>
    );
  }

  return content;
};

export default FixedParamsInput;
