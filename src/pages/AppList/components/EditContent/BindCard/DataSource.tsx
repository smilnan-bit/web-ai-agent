import React, { type ReactNode } from 'react';
import { Form, InputNumber, Popover, Radio, Switch, Tooltip } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useRecoilValue } from 'recoil';
import type { ToolNS } from '@/types/Tools';
import {
  CardModeEnum,
  CardStyleEnum,
  CardTypeConfig,
  DialogueCardTypeConfig,
  ReplyCardTypeConfig,
  VerticalCardStyleEnum,
  modulePrefix,
} from './constants';
import { SelectCardState } from './model';
import './index.less';
import NumInRow from './components/NumInRow';
import { useGetFormData } from './utils';
import CustomFormItem from './components/CustomFormItem';
import CustomFields from './components/CustomFields';
const FormItem = Form.Item;

const DataSourceConfigMap = {
  [CardModeEnum.dialogue]: DialogueCardTypeConfig,
  [CardModeEnum.reply]: ReplyCardTypeConfig,
  [CardModeEnum.bind]: CardTypeConfig,
};

const CustomActionSwitch: React.FC<{
  value?: any;
  onChange?: (data: any) => void;
  actionSwitch: any;
  hide?: boolean;
}> = ({ value, onChange, actionSwitch, hide }) => (
  <Switch
    style={hide ? { display: 'none' } : {}}
    checked={value === actionSwitch?.checkedValue}
    onChange={(checked) => onChange?.(checked ? actionSwitch?.checkedValue : actionSwitch?.unCheckedValue)}
  />
);

interface DataSourceProps {
  responseParams: ToolNS.ToolParamsType[];
  mode?: CardModeEnum;
}
const DataSource: React.FC<DataSourceProps> = ({ responseParams, mode = CardModeEnum.bind }) => {
  const selectCardType = useRecoilValue(SelectCardState);

  const { formConfig } = DataSourceConfigMap[mode][selectCardType] || {};
  const selectFromWorkFlow = [CardModeEnum.dialogue, CardModeEnum.reply].includes(mode);
  const { cardStyleValue, hasActionValue, actionValue, verticalCardStyle } = useGetFormData();

  return (
    <div className={`${modulePrefix}-datasource`}>
      <div className={`${modulePrefix}-title`} style={{ marginBottom: 24 }} key={0}>
        为卡片绑定数据源
      </div>
      <div className={`${modulePrefix}-datasource-form`} key={1}>
        {formConfig?.map(
          (
            {
              title,
              styleConfig,
              limitConfig,
              bindArray,
              bindFields,
              numInRow,
              actionSwitch,
              actionRadio,
              urlInput,
              btnTextInput,
              btnActionInput,
              verticalCardConfig,
              onlyOutputActionSwitch,
              outputModeRadio,
            },
            idx,
          ) => {
            console.group(actionSwitch);
            const isSelectFromArray =
              !!bindArray &&
              (!bindArray.dependenceStyleValues || bindArray.dependenceStyleValues.includes(cardStyleValue));
            const arrayBindIsInput = bindArray?.isSelectFromArray !== undefined ? bindArray.isSelectFromArray : false;
            return (
              <div key={title || idx} className={`${modulePrefix}-datasource-form-part`}>
                {!!title && <div style={{ fontWeight: 500, marginBottom: 8 }}>{title}</div>}
                {styleConfig && (
                  <FormItem
                    label="选择卡片样式"
                    name="cardStyle"
                    labelCol={{ span: 24 }}
                    initialValue={CardStyleEnum.single}
                  >
                    <Radio.Group>
                      {Object.entries(styleConfig).map(([value, label]) => (
                        <Radio value={Number(value)} key={Number(value)}>
                          {label as ReactNode}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </FormItem>
                )}
                {numInRow && <NumInRow />}
                {!!verticalCardConfig &&
                  (!verticalCardConfig?.dependenceStyleValues?.length ||
                    verticalCardConfig?.dependenceStyleValues.includes(cardStyleValue)) && (
                    <>
                      <FormItem
                        label={verticalCardConfig?.label}
                        name={verticalCardConfig?.name}
                        labelCol={{ span: 24 }}
                        initialValue={verticalCardConfig?.initialValue}
                      >
                        <Radio.Group>
                          {Object.entries(verticalCardConfig.option).map(([value, label]) => (
                            <Radio value={Number(value)} key={Number(value)}>
                              {label}
                            </Radio>
                          ))}
                        </Radio.Group>
                      </FormItem>
                      {verticalCardStyle === VerticalCardStyleEnum.replace && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 16,
                            marginTop: -20,
                            color: 'rgba(0, 0, 0, 0.45)',
                          }}
                        >
                          用户可通过点击“换一换”按顺序轮换查看，每批展示
                          <FormItem
                            style={{
                              display: 'inline-block',
                              margin: '0 4px',
                              width: 70,
                            }}
                            name={verticalCardConfig?.limitName || 'cardLimit'}
                            initialValue={5}
                          >
                            <InputNumber style={{ width: '100%' }} precision={0} min={1} />
                          </FormItem>
                          个
                        </div>
                      )}
                    </>
                  )}
                {limitConfig &&
                  (!limitConfig.dependenceStyleValues || limitConfig.dependenceStyleValues.includes(cardStyleValue)) &&
                  (verticalCardStyle !== VerticalCardStyleEnum.replace || !verticalCardConfig) && (
                    <FormItem
                      label={limitConfig.label}
                      name={limitConfig.name}
                      initialValue={limitConfig.initialValue}
                      labelCol={{ span: 24 }}
                    >
                      <InputNumber precision={0} min={1} />
                    </FormItem>
                  )}
                {isSelectFromArray && (
                  <CustomFormItem
                    isQuoteParamSelect={selectFromWorkFlow}
                    isSelectFromArray={arrayBindIsInput} // 默认为下拉框
                    label={bindArray.label || '为卡片整体绑定一个数组'}
                    name={bindArray.name || 'arrayName'}
                    labelCol={{ span: 24 }}
                    rules={[{ required: true, message: '请选择' }]}
                    responseParams={responseParams}
                    placeholder={arrayBindIsInput ? '请输入数组来源' : '请选择数组来源'}
                  />
                )}
                <div style={{ marginBottom: 16 }}>
                  为卡片内元素绑定数据
                  {bindFields?.fieldsTipSrc && (
                    <Popover content={<img src={bindFields?.fieldsTipSrc} width={600} />}>
                      <ExclamationCircleOutlined style={{ marginLeft: 4, color: '#BFBFBF', cursor: 'pointer' }} />
                    </Popover>
                  )}
                </div>
                {bindFields?.fields?.map((sonFields, index) => {
                  const fields = Array.isArray(sonFields) ? sonFields : [sonFields];
                  const showAsGroup = fields.length > 1;
                  return (
                    <div key={fields[0].name} className={`bindfield ${showAsGroup ? 'groupWrap' : ''}`}>
                      <div className="bindfield-index" style={{ marginRight: 8 }}>
                        {index + (bindFields.startIndex || 1)}
                      </div>
                      <span className={showAsGroup ? 'itemgroup' : 'item'}>
                        {fields.map(({ name, required, isSelectFromArray: fieldIsInput, placeholder }) => (
                          <CustomFormItem
                            key={name}
                            isQuoteParamSelect={selectFromWorkFlow}
                            isSelectFromArray={fieldIsInput !== undefined ? fieldIsInput : isSelectFromArray}
                            name={name}
                            rules={[{ required, message: isSelectFromArray ? '请输入' : '请选择' }]}
                            responseParams={responseParams}
                            placeholder={placeholder}
                          />
                        ))}
                      </span>
                    </div>
                  );
                })}

                {bindFields?.otherFields && (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      为卡片绑定其他数据
                      <Tooltip
                        title={
                          '除了为卡片内展现元素绑定数据外，也支持为卡片绑定其他更多数据，例如商品ID、订单ID等。作用是，当客户点击卡片进行选择后，可将客户选择的卡片绑定参数值向下传递'
                        }
                      >
                        <ExclamationCircleOutlined style={{ marginLeft: 4, color: '#BFBFBF', cursor: 'pointer' }} />
                      </Tooltip>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      {bindFields?.otherFields?.map(({ name, required, isSelectFromArray: fieldIsInput }) => (
                        <div key={name}>
                          <div className="bindfield-name">{`${name}:`}</div>
                          <div key={name} className="bindfield nameWrap">
                            <CustomFormItem
                              isQuoteParamSelect={selectFromWorkFlow}
                              isSelectFromArray={fieldIsInput !== undefined ? fieldIsInput : isSelectFromArray}
                              name={name}
                              style={{ marginBottom: '6px' }}
                              rules={[{ required, message: isSelectFromArray ? '请输入' : '请选择' }]}
                              responseParams={responseParams}
                            />
                          </div>
                        </div>
                      ))}
                      {bindFields?.customFields && (
                        <CustomFields
                          name={bindFields.customFields.name}
                          isSelectFromArray={isSelectFromArray}
                          isQuoteParamSelect={selectFromWorkFlow}
                          responseParams={responseParams}
                          validateRepeatField={bindFields.customFields.validateRepeatField}
                        />
                      )}
                    </div>
                  </>
                )}
                {!!outputModeRadio?.show?.({ cardStyleValue }) && (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      {outputModeRadio.label}
                      {outputModeRadio.labelTipSrc && (
                        <Popover
                          content={<img src={outputModeRadio?.labelTipSrc} width={600} />}
                          placement="top"
                          overlayClassName="output-mode-popover"
                        >
                          <ExclamationCircleOutlined style={{ marginLeft: 4, color: '#BFBFBF', cursor: 'pointer' }} />
                        </Popover>
                      )}
                    </div>
                    <FormItem name={outputModeRadio.name} initialValue={outputModeRadio.initialValue}>
                      <Radio.Group>
                        {Object.entries(outputModeRadio.config).map(([value, label]) => (
                          <Radio key={Number(value)} value={Number(value)}>
                            {label as ReactNode}
                          </Radio>
                        ))}
                      </Radio.Group>
                    </FormItem>
                  </>
                )}
                {!!actionSwitch && (
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
                  >
                    <span>
                      {actionSwitch.label}
                      {actionSwitch.labelTip && (
                        <Tooltip title={actionSwitch.labelTip}>
                          <ExclamationCircleOutlined style={{ marginLeft: 4, color: '#BFBFBF' }} />
                        </Tooltip>
                      )}
                    </span>
                    <FormItem name={actionSwitch.name} noStyle initialValue={actionSwitch.initialValue}>
                      <CustomActionSwitch actionSwitch={actionSwitch} hide={mode === CardModeEnum.dialogue} />
                    </FormItem>
                  </div>
                )}
                {!!actionRadio?.show?.({ hasActionValue }) && (
                  <FormItem name={actionRadio.name} initialValue={actionRadio.initialValue}>
                    <Radio.Group>
                      {Object.entries(actionRadio.config).map(([value, label]) => (
                        <Radio key={Number(value)} value={Number(value)}>
                          {label as ReactNode}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </FormItem>
                )}
                {!!btnTextInput?.show?.({ actionValue }) && (
                  <CustomFormItem
                    isSelectFromArray={
                      btnTextInput.isSelectFromArray !== undefined ? btnTextInput.isSelectFromArray : isSelectFromArray
                    }
                    isQuoteParamSelect={selectFromWorkFlow}
                    responseParams={responseParams}
                    name={btnTextInput.name || 'title'}
                    rules={[
                      {
                        required: true,
                        message: (
                          btnTextInput.isSelectFromArray !== undefined
                            ? btnTextInput.isSelectFromArray
                            : isSelectFromArray
                        )
                          ? '请输入'
                          : '请选择',
                      },
                    ]}
                    label="按钮文案"
                  />
                )}
                {!!urlInput?.show?.({ actionValue, hasActionValue }) && (
                  <CustomFormItem
                    isSelectFromArray={
                      urlInput.isSelectFromArray !== undefined ? urlInput.isSelectFromArray : isSelectFromArray
                    }
                    isQuoteParamSelect={selectFromWorkFlow}
                    responseParams={responseParams}
                    name={'url'}
                    rules={[
                      {
                        required: true,
                        message: (
                          urlInput.isSelectFromArray !== undefined
                            ? urlInput.isSelectFromArray
                            : isSelectFromArray
                        )
                          ? '请输入'
                          : '请选择',
                      },
                    ]}
                    label="跳转链接"
                  />
                )}
                {!!btnActionInput?.show?.({ actionValue }) && (
                  <CustomFormItem
                    isQuoteParamSelect={selectFromWorkFlow}
                    isSelectFromArray={
                      btnActionInput.isSelectFromArray !== undefined
                        ? btnActionInput.isSelectFromArray
                        : isSelectFromArray
                    }
                    responseParams={responseParams}
                    name={btnActionInput.name || 'content'}
                    label="点击按钮发送文案"
                    rules={[
                      {
                        required: true,
                        message: (
                          btnActionInput.isSelectFromArray !== undefined
                            ? btnActionInput.isSelectFromArray
                            : isSelectFromArray
                        )
                          ? '请输入'
                          : '请选择',
                      },
                    ]}
                  />
                )}
                {onlyOutputActionSwitch ? (
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
                  >
                    <span>
                      {onlyOutputActionSwitch?.label}
                      {onlyOutputActionSwitch?.labelTip && (
                        <Tooltip title={onlyOutputActionSwitch.labelTip}>
                          <ExclamationCircleOutlined style={{ marginLeft: 4, color: '#BFBFBF' }} />
                        </Tooltip>
                      )}
                    </span>
                    <FormItem
                      name={onlyOutputActionSwitch?.name}
                      noStyle
                      initialValue={onlyOutputActionSwitch?.initialValue}
                    >
                      <CustomActionSwitch actionSwitch={onlyOutputActionSwitch} />
                    </FormItem>
                  </div>
                ) : null}
              </div>
            );
          },
        )}
      </div>
    </div>
  );
};

export default DataSource;
