import React from 'react';
import { FormField, FormFragmentFieldWrapper } from '@form';
import { PlusOutlined } from '@ant-design/icons';
import type { OutputParamsType } from '../../form-components/input-output';
import { useField, useForm, useWatch } from '@form/hooks';
import { Button, Select } from 'antd';
import { FieldArray, nanoid, useAvailableVariables } from '@flowgram.ai/free-layout-editor';
import { SimpleParamTypeEnum, VariableNameSplitSymbol, VariableSplitSymbol } from '../../constants';
import { IconTuozhuai, IconXiajiantou } from '../icons';
import ParamsFormWithValueItem from '../../form-components/input-output/form-item';
import { Shanchu } from '@/assets/icons';
import { SortableHandle, SortableElement, SortableContainer } from 'react-sortable-hoc';
import { ToolParamsTypeEnum, ToolParamsTypeShowEnum } from '@/constants';
import { getSourceVariable } from '../../utils/variables';
import Output from './output';
import TypeCascader from '@/components/TypeCascader';
import { VariableSelectorProvider } from '../../components/variable-selector';

const MAX_PARAM_COUNT = 50;
const MAX_GROUP_COUNT = 20;

// 拖拽手柄组件
const DragHandle = SortableHandle(() => (
  <div tw="h-[32px] flex items-center pr-1 cursor-grab" className="j-group-item-drag-handle">
    <IconTuozhuai />
  </div>
));

type ParamItemData = {
  id: string;
  valueType: SimpleParamTypeEnum;
  value: string | undefined;
};

type GroupItemData = {
  groupName?: string;
  type?: ToolParamsTypeEnum | undefined;
  subType?: ToolParamsTypeEnum | undefined;
  params: ParamItemData[];
};

export type MergeFormData = {
  strategy: number;
  inputParam: GroupItemData[];
  outputParam: OutputParamsType[];
};

export const genGroup = () => {
  return {
    groupName: '', //预留下占个位置
    type: undefined, //前端自用
    params: [
      {
        id: nanoid(),
        valueType: SimpleParamTypeEnum.quote,
        value: undefined,
      },
    ],
  } as GroupItemData;
};

// 参数项组件
const ParamItem = ({ type, subType, disableRemove = false, remove, onQuoteValueChange, items }) => {
  const field = useField<ParamItemData>();
  return (
    <div tw="flex gap-2">
      <DragHandle />
      <div tw="flex-1">
        <VariableSelectorProvider
          skipVariable={(variable) => {
            const targetVariable = variable as {
              meta?: { type?: ToolParamsTypeEnum; subType?: ToolParamsTypeEnum };
              keyPath: string[];
            };
            // 过滤类型
            if (type && targetVariable?.meta?.type !== type) {
              return true;
            } else if (type === ToolParamsTypeEnum.array && subType !== targetVariable?.meta?.subType) {
              return true;
            }
            // 判断是否是被用过
            const arrayValue = items.filter((item) => !!item.value && item.id !== field.value.id);
            for (const item of arrayValue) {
              const paramInfo = item.value?.split(VariableSplitSymbol);
              if (
                `${paramInfo?.[0]}${VariableNameSplitSymbol}${paramInfo?.[1]}` ===
                targetVariable?.keyPath.join(VariableNameSplitSymbol)
              ) {
                // ['start_node', 'obj', 'obj1', 'obj2', 'str']
                // ['start_node', obj.obj1.obj2.str, 1]
                return true;
              }
            }
            return false;
          }}
        >
          <ParamsFormWithValueItem hideType onQuoteValueChange={onQuoteValueChange} />
        </VariableSelectorProvider>
      </div>
      {!disableRemove ? (
        <div onClick={() => remove()} tw="cursor-pointer text-[rgba(0, 0, 0, 0.45)] hover:text-[#ff4d4f] py-[5px]">
          <Shanchu />
        </div>
      ) : (
        <div tw="w-[14px] h-[32px]" />
      )}
    </div>
  );
};

const SortableParamItem = SortableElement<{
  type?: ToolParamsTypeEnum;
  subType?: ToolParamsTypeEnum;
  disableRemove?: boolean;
  remove: () => void;
  name: string;
  key: string;
  onQuoteValueChange: (value?: string) => void;
  items: ParamItemData[];
}>(({ type, subType, disableRemove = false, remove, name, key, onQuoteValueChange, items }) => {
  return (
    <FormField name={name} key={key}>
      <ParamItem
        disableRemove={disableRemove}
        remove={remove}
        onQuoteValueChange={onQuoteValueChange}
        items={items}
        type={type}
        subType={subType}
      />
    </FormField>
  );
});

const SortableParamList = SortableContainer<{
  children: React.ReactNode;
}>(({ children }) => {
  return <div tw="flex flex-col gap-3">{children}</div>;
});

const GroupItem = ({ disableFirstRemove, removeGroup }) => {
  const field = useField();
  const form = useForm();
  const variables = useAvailableVariables();
  const type = useWatch<ToolParamsTypeEnum | undefined>(`${field.name}.type`);
  const subType = useWatch<ToolParamsTypeEnum | undefined>(`${field.name}.subType`);
  return (
    <div>
      <FieldArray<ParamItemData> name={`${field.name}.params`}>
        {({ field: childField }) => {
          const { value = [], append: add, remove, move } = childField;
          const onQuoteValueChange = (value?: string) => {
            //要限制选择变量，第一次不限制
            if (!type && !!value) {
              const sourceVariable = getSourceVariable(value, variables);
              const type = sourceVariable?.meta?.type;
              form.setFieldValue(`${field.name}.type`, type);
              if (type === ToolParamsTypeEnum.array) {
                const subType = sourceVariable?.meta?.subType;
                if (subType) {
                  form.setFieldValue(`${field.name}.subType`, subType);
                }
              }
            }
          };
          return (
            <>
              <SortableParamList
                lockAxis="y"
                helperClass="sortable-helper"
                helperContainer={() => document.getElementById('j-form-container-sidebar') as HTMLElement}
                distance={10}
                onSortEnd={({ oldIndex, newIndex }) => {
                  if (oldIndex !== newIndex) {
                    move(oldIndex, newIndex);
                  }
                  setTimeout(() => {
                    const helpers = document.querySelectorAll('.sortable-helper');
                    helpers?.forEach((el) => el.parentNode && el.parentNode.removeChild(el));
                  }, 0);
                }}
              >
                {childField.map((child, index: number) => {
                  return (
                    <SortableParamItem
                      type={type}
                      subType={subType}
                      disableRemove={disableFirstRemove && value.length === 1}
                      onQuoteValueChange={(value) => {
                        if (value) {
                          const sourceVariable = getSourceVariable(value, variables);
                          const name = sourceVariable?.meta?.name;
                          form.setFieldValue(`${child.name}.name`, name);
                        }
                        onQuoteValueChange(value);
                      }}
                      remove={() => {
                        !disableFirstRemove && value.length === 1 ? removeGroup() : remove(index);
                      }}
                      items={value} //所有数据
                      name={child.name}
                      key={child.key}
                      index={index}
                    />
                  );
                })}
              </SortableParamList>
              {value.length < MAX_PARAM_COUNT && (
                <div tw="mt-3">
                  <Button
                    type="link"
                    block
                    onClick={() => add({ id: nanoid(), valueType: SimpleParamTypeEnum.quote, value: undefined })}
                    className="add-button"
                  >
                    <PlusOutlined />
                    新增
                  </Button>
                </div>
              )}
            </>
          );
        }}
      </FieldArray>
    </div>
  );
};

const FormContent = () => {
  const form = useForm();
  return (
    <>
      <FormFragmentFieldWrapper<MergeFormData['strategy']>
        name="strategy"
        title="聚合策略"
        desc="对同一组内的变量实施相应聚合策略"
      >
        <Select options={[{ label: '返回每个分组第一个非空的值', value: 1 }]}>
          <Select.Option value={0}>返回每个分组第一个非空的值</Select.Option>
        </Select>
      </FormFragmentFieldWrapper>
      <FieldArray<GroupItemData> name="inputParam">
        {({ field }) => {
          const { value = [], append: add, remove } = field;
          return (
            <>
              {field.map((child, index: number) => {
                return (
                  <FormFragmentFieldWrapper<GroupItemData>
                    name={child.name}
                    title={child?.value?.groupName || `Group${index + 1}`}
                    key={child.key}
                    extra={
                      <FormField name={`${child.name}.type`} deps={[`${child.name}.type`]}>
                        {({ value }) => {
                          const subType = form.getValueIn(`${child.name}.subType`);
                          const cascaderValue = subType
                            ? ([value, subType] as [ToolParamsTypeEnum, ToolParamsTypeEnum])
                            : (value as ToolParamsTypeEnum);
                          if (!value) {
                            return null;
                          }
                          const showText = subType
                            ? `${ToolParamsTypeShowEnum[value as ToolParamsTypeEnum]}<${ToolParamsTypeShowEnum[subType as ToolParamsTypeEnum]}>`
                            : ToolParamsTypeShowEnum[value as ToolParamsTypeEnum];
                          return (
                            <TypeCascader
                              style={{ width: '120px' }}
                              // disabled={!!value}
                              cascaderProps={{ size: 'small' }}
                              value={cascaderValue}
                              onChange={(value) => {
                                const type = value?.[0];
                                form.setFieldValue(`${child.name}.type`, type || undefined);
                                form.setFieldValue(`${child.name}.subType`, value?.[1] || undefined);
                              }}
                              placeholder="请选择变量类型"
                            >
                              <div tw="hover:text-[#337eff] cursor-pointer flex items-center">
                                {showText} <IconXiajiantou tw="ml-2" />
                              </div>
                            </TypeCascader>
                          );
                        }}
                      </FormField>
                    }
                  >
                    <GroupItem
                      removeGroup={() => remove(index)}
                      disableFirstRemove={index === 0 && value.length === 1}
                    />
                  </FormFragmentFieldWrapper>
                );
              })}

              {value.length < MAX_GROUP_COUNT && (
                <div>
                  <Button type="link" block onClick={() => add(genGroup())} className="add-button">
                    <PlusOutlined />
                    新增分组
                  </Button>
                </div>
              )}
            </>
          );
        }}
      </FieldArray>
      <Output />
    </>
  );
};

export default FormContent;
