import React from 'react';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { FieldWrapper, FormField, useField, useWatch } from '@form';

import { Button, Checkbox, Input, Popover, Radio, Select } from 'antd';
import { FormReplyTypeConfig, FormReplyTypeEnum, FormReplyTypeTipImage, type ReplyFormData } from './form';
import { FieldArray, usePlayground, useWatchFormValues } from '@flowgram.ai/free-layout-editor';
import { Shanchu } from '@/assets/icons';
import { useNodeRenderContext } from '../../hooks';
import FormPrompt from '../../form-components/form-prompt';
import FormFragment from '../../components/form-fragment';
import CardSetting from '../../form-components/form-card-setting';
import { CardModeEnum } from '@/pages/AppList/components/EditContent/BindCard/constants';

const ParamItem = ({ paramsOptions, remove, index }) => {
  const field = useField<{ key: string; value: string }>();
  return (
    <div tw="flex gap-3">
      <div tw="flex-1">
        <FormField name={`${field.name}.key`}>
          <Select options={paramsOptions} style={{ width: '100%' }} placeholder="请选择变量" />
        </FormField>
      </div>
      <div tw="leading-[32px] font-medium">=</div>
      <div tw="flex-1">
        <FormField name={`${field.name}.value`}>
          <Input maxLength={100} placeholder="请填写企业对应的参数名称" />
        </FormField>
      </div>
      <div className="btn-action">
        <Button type="link" onClick={() => remove(index)} style={{ padding: 0 }}>
          <Shanchu className="action-delete" />
        </Button>
      </div>
    </div>
  );
};

export const ReplyContent = () => {
  const type = useWatch<ReplyFormData['type']>('type');
  const node = useNodeRenderContext().node;
  const data = useWatchFormValues(node);
  const outputParam = data.outputParam;
  const playground = usePlayground();
  const readonly = playground?.config?.readonly ?? false;

  console.log(outputParam, 'outputParam');

  // 过滤下当前已经选择的变量
  const selectedVariables = data?.cardParam?.params?.filter(Boolean)?.map((item) => item.key) || [];
  const paramsOptions =
    outputParam
      ?.filter((item) => !!item?.name && !selectedVariables.includes(item.name))
      .map((item) => ({
        label: item?.name,
        value: item?.name,
      })) || [];
  return (
    <FormFragment title="回复内容" required disableWhenReadonly={type !== FormReplyTypeEnum.card}>
      <div className={`field-wrapper`} tw="pt-4">
        {/* 内容区域 */}
        <div className={`field-content`} tw="flex gap-4 flex-col">
          <FormPrompt inputParamName="outputParam" />
          <FormField name="type">
            <Radio.Group disabled={readonly}>
              {Object.entries(FormReplyTypeConfig)
                .sort((a, b) => a[1].sort - b[1].sort)
                .map(([key, { label }]) => {
                  if (Number(key) !== FormReplyTypeEnum.customPage) {
                    return (
                      <Radio value={Number(key)} key={key}>
                        {label}
                      </Radio>
                    );
                  }
                  return (
                    <Radio key={key} value={Number(key)}>
                      {label}
                      <Popover
                        placement="bottom"
                        content={
                          <div>
                            <p style={{ marginBottom: '10px' }}>选择该模式，支持为用户展示自定义卡片内容。</p>
                            <p style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: '6px' }}>示例图</p>
                            <img width={200} src={FormReplyTypeTipImage} alt="FormReplyTypeTipImage" />
                          </div>
                        }
                      >
                        <InfoCircleOutlined style={{ marginLeft: 6, color: 'rgba(0, 0, 0, 0.45)' }} />
                      </Popover>
                    </Radio>
                  );
                })}
            </Radio.Group>
          </FormField>
          {type === FormReplyTypeEnum.card && <CardSetting mode={CardModeEnum.reply} />}
          {type === FormReplyTypeEnum.customPage ? (
            <>
              <FieldWrapper<ReplyFormData['cardParam'][]> name="cardParam.url" title="页面地址" labelLayout="inline">
                <Input maxLength={500} placeholder="请填写您开发的页面URL" />
              </FieldWrapper>
              <div tw="flex gap-3">
                <div tw="leading-[32px]">映射参数</div>
                <div tw="flex-1">
                  <FieldArray name="cardParam.params">
                    {({ field, fieldState }) => {
                      const { value = [], append: add, remove } = field;
                      return (
                        <>
                          <div tw="flex flex-col gap-3">
                            {field.map((child, index) => (
                              <FormField name={child.name} key={child.key}>
                                <ParamItem paramsOptions={paramsOptions} remove={remove} index={index} />
                              </FormField>
                            ))}
                          </div>
                          <Button type="link" block onClick={() => add({})} className="add-button" tw="mt-[5px]">
                            <PlusOutlined />
                            新增
                          </Button>
                        </>
                      );
                    }}
                  </FieldArray>
                </div>
              </div>
              <FormField name="cardParam.directPopup">
                {({ value, onChange }) => {
                  return (
                    <Checkbox checked={!!value} onChange={(e) => onChange(e.target.checked ? 1 : 0)}>
                      是否直接弹窗
                    </Checkbox>
                  );
                }}
              </FormField>
            </>
          ) : null}
        </div>
      </div>
    </FormFragment>
  );
};
