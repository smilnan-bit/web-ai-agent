import React from 'react';
import type { FormListProps } from 'antd/es/form';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Shanchu } from '@/assets/icons';
import EnumSelect from '@/components/EnumSelect';

import { Feedback, FormField, useForm, useWatch } from '@form';
import { FieldArray, useAvailableVariables, useFieldValidate } from '@flowgram.ai/free-layout-editor';
import './var-table.less';
import ParamSelect from '../../../form-components/input-output/param-select';
import { getSourceVariable } from '../../../utils/variables';
import type { FieldInstance } from '../../../form-components/type';
import ParamsFormWithValueItem from '../../../form-components/input-output/form-item';
import { SimpleParamTypeEnum } from '../../../constants';
import { ConditionNodeSelectConfig, type ConditionNodeSelectEnum, ConditionValueDisableTypes } from '../const';

const VarItem = ({
  subField,
  index,
  remove,
  disableRemove,
}: { subField: FieldInstance; index: number; remove: (index: number) => void; disableRemove: boolean }) => {
  const form = useForm();
  const { name, key } = subField;
  const quoteCondition = useWatch<ConditionNodeSelectEnum>(`${name}.quoteCondition`);
  const cannotEditValue = ConditionValueDisableTypes.includes(quoteCondition);
  const quoteParamValue = useWatch<string>(`${name}.quoteParam`);
  const availableVariables = useAvailableVariables();
  const sourcetype = getSourceVariable(quoteParamValue, availableVariables)?.meta?.type;
  const validateValue = useFieldValidate(`${name}.value`);

  return (
    <div key={key} className="var-table-row">
      {/* 引用变量列 */}
      <div className="var-table-cell">
        <FormField<string> name={`${name}.quoteParam`} style={{ width: '100%' }}>
          {({ value, onChange, status }) => (
            <ParamSelect
              hasError={status === 'error'}
              value={value}
              onChange={(value) => {
                onChange(value);
              }}
            />
          )}
        </FormField>
      </div>

      {/* 选择条件列 */}
      <div className="var-table-cell">
        <FormField name={`${name}.quoteCondition`} style={{ width: '100%' }}>
          {({ value, onChange }) => {
            return (
              <EnumSelect
                optionsConfig={ConditionNodeSelectConfig[sourcetype] || {}}
                hasAll={false}
                value={value}
                onChange={(newValue) => {
                  onChange(newValue);
                  if (ConditionValueDisableTypes.includes(newValue)) {
                    form.setFieldValue(`${name}.value`, undefined);
                  } else {
                    validateValue();
                  }
                }}
                placeholder="请选择条件"
              />
            );
          }}
        </FormField>
      </div>
      {/* 比较值列 */}
      <div className="var-table-cell long-cell" tw="flex gap-2">
        <ParamsFormWithValueItem placeholder="请输入变量值" disableAll={cannotEditValue} />
      </div>
      {/* 操作列 */}

      {!disableRemove && (
        <div className="var-table-cell operation">
          <Button type="link" onClick={() => remove(index)} className="delete-button">
            <Shanchu className="action-delete" />
          </Button>
        </div>
      )}
    </div>
  );
};

const VarTable: React.FC<
  {
    formListName: string; // 当前FormList的namePath
    maxNum?: number;
  } & Partial<FormListProps>
> = ({ formListName, maxNum = 10, ...formListProps }) => {
  return (
    <FieldArray name={formListName as any} {...formListProps}>
      {({ field, fieldState }) => {
        const { value = [], append: add, remove } = field;

        return (
          <div className="var-table">
            {/* 表头 */}
            <div className="var-table-header">
              <div className="var-table-cell required">引用变量</div>
              <div className="var-table-cell required">选择条件</div>
              <div className="var-table-cell long-cell">比较值</div>
              {value.length > 1 && <div className="var-table-cell operation"></div>}
            </div>

            {/* 表体 */}
            <div className="var-table-body">
              {value?.length === 0 ? (
                <div className="var-table-empty">暂无数据，请点击下方按钮添加</div>
              ) : (
                field.map((subField: FieldInstance, index: number) => (
                  <FormField name={subField.name} key={subField.key}>
                    <VarItem
                      key={subField.key}
                      index={index}
                      subField={subField}
                      remove={remove}
                      disableRemove={value.length === 1}
                    />
                  </FormField>
                ))
              )}
            </div>

            {/* 添加按钮 */}
            {value.length < maxNum && (
              <Button
                type="link"
                onClick={() => add({ valueType: SimpleParamTypeEnum.quote })}
                block
                className="add-button"
                icon={<PlusOutlined />}
              >
                新增
              </Button>
            )}
            <Feedback
              errors={fieldState?.errors?.filter((item) => item.name === formListName)}
              style={{ marginTop: '8px' }}
            />
          </div>
        );
      }}
    </FieldArray>
  );
};

export default VarTable;
