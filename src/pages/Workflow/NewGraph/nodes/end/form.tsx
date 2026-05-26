import React from 'react';
import { useWatch } from '@form/hooks';
import { Radio } from 'antd';
import { FieldWrapper, type OutputParamsType } from '@form';
import Tip from '@/components/Tip';
import { ParamsFormWithValue } from '@form/input-output';
import FormFragment from '../../components/form-fragment';
import FormPrompt from '../../form-components/form-prompt';
import { usePlayground } from '@flowgram.ai/free-layout-editor';

export enum EndOutputTypeEnum {
  variable = 0,
  text = 1,
  silence = 2,
}

export const EndOutputTypeConfig = {
  [EndOutputTypeEnum.variable]: {
    text: '返回变量',
    tip: '支持设置1个或多个输出变量。工作流流经该节点时，会立即将输出变量给到Agent做进一步的处理。Agent会根据工作流的输出变量和客户Query 总结润色后提供回复。',
  },
  [EndOutputTypeEnum.text]: {
    text: '返回文本',
    tip: '当工作流执行到这一步时，系统会直接使用你在此处填写的内容进行自动回复。工作流输出的文本内容不会传递给Agent做进一步的处理。即：完成自动回复后，工作流将终止，同时Agent也不会再追加回复。',
  },
  [EndOutputTypeEnum.silence]: {
    text: '静默结束',
    tip: '流转到结束节点后，工作流静默终止',
  },
};

export type EndFormData = {
  returnType: EndOutputTypeEnum;
  content?: string;
  outputParam?: OutputParamsType[];
};

const FormContent = () => {
  const returnTypeValue = useWatch('returnType');
  const playground = usePlayground();

  return (
    <>
      {/* 同行布局示例 */}
      <FieldWrapper<EndFormData['returnType']> name="returnType" title="输出模式">
        <Radio.Group>
          {Object.entries(EndOutputTypeConfig).map(([value, { text, tip }]) => (
            <Radio value={Number(value)} key={Number(value)} disabled={playground.config.readonly}>
              {text}
              <Tip title={tip} />
            </Radio>
          ))}
        </Radio.Group>
      </FieldWrapper>
      {returnTypeValue !== EndOutputTypeEnum.silence ? (
        <ParamsFormWithValue
          name="outputParam"
          title={returnTypeValue === EndOutputTypeEnum.text ? '输入' : '输出'}
          desc={returnTypeValue === EndOutputTypeEnum.text ? '回复内容中可引用的变量' : ''}
        />
      ) : null}
      {returnTypeValue === EndOutputTypeEnum.text && (
        <FormFragment title="回复内容" required>
          <div tw="pt-4" />
          <FormPrompt inputParamName="outputParam" />
        </FormFragment>
      )}
    </>
  );
};

export default FormContent;
