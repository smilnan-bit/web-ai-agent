import React, { useRef } from 'react';
import { Button } from 'antd';
import { Feedback, useForm, useWatch } from '@form';
import { PlusOutlined } from '@ant-design/icons';
import SingleCondition from './single-condition';
import PortEdit from './single-condition/port-edit';
import { SimpleParamTypeEnum } from '../../constants';
import { nanoid } from 'nanoid';
import { FieldArray, usePlayground } from '@flowgram.ai/free-layout-editor';
import FormFragment from '../../components/form-fragment';
import { ConditionRelationEnum, type ConditionNodeSelectEnum } from './const';

export type ConditionFormData = {
  conditions: Array<{
    portTitle: string;
    params: Array<{
      valueType: SimpleParamTypeEnum;
      value?: string;
      quoteParam?: string;
      quoteCondition?: ConditionNodeSelectEnum;
    }>;
    relation: number;
    id: string;
  }>;
  lastPortTitle: string;
};
const FormCondition = () => {
  const form = useForm();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listAddRef = useRef<(value: any) => any>();
  const conditionsValue = useWatch<ConditionFormData['conditions']>('conditions');
  const playground = usePlayground();
  return (
    <>
      <FieldArray<ConditionFormData['conditions']> name={'conditions'}>
        {({ field, fieldState }) => {
          const { value = [], append: add, remove } = field;

          const onRemove = (removeIndex) => {
            // 重置portTitle字段
            value.forEach((_item, index) => {
              const titlePathName = `conditions.${index}.portTitle`;
              if (index > removeIndex && form?.getFieldValue(titlePathName) === `优先级${index + 1}`) {
                form.setFieldValue?.(titlePathName, `优先级${index}`);
              }
            });
            form?.getFieldValue('lastPortTitle') === `优先级${value.length + 1}` &&
              form.setFieldValue?.('lastPortTitle', `优先级${value.length}`);
            remove(removeIndex);
          };
          listAddRef.current = add;

          return (
            <>
              {field.map(({ name }, index) => (
                <SingleCondition
                  index={index}
                  name={name}
                  key={name}
                  removeCondition={onRemove}
                  canDelete={value.length > 1}
                />
              ))}

              <Feedback
                errors={fieldState?.errors?.filter((item) => item.name === 'conditions')}
                style={{ marginTop: '8px' }}
              />
            </>
          );
        }}
      </FieldArray>
      <FormFragment
        title={
          <>
            否则
            <PortEdit name={'lastPortTitle'} />
          </>
        }
      />
      {conditionsValue?.length < 20 && (
        <Button
          type="dashed"
          onClick={() => {
            form?.getFieldValue('lastPortTitle') === `优先级${conditionsValue.length + 1}` &&
              form.setFieldValue?.('lastPortTitle', `优先级${conditionsValue.length + 2}`);
            listAddRef.current?.({
              portTitle: `优先级${conditionsValue.length + 1}`,
              params: [{ valueType: SimpleParamTypeEnum.quote }],
              relation: ConditionRelationEnum.and,
              id: nanoid(),
            });
          }}
          block
          style={{ width: 110, marginTop: 16 }}
          disabled={playground.config.readonly}
        >
          <PlusOutlined />
          新增分支
        </Button>
      )}
    </>
  );
};

export default FormCondition;
