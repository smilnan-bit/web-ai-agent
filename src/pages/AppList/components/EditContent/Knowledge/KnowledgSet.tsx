import React, { useEffect } from 'react';
import type { InputNumberProps, ModalProps } from 'antd';
import { Form, InputNumber, Modal, Radio, Slider, Space, Switch, message } from 'antd';
import { useRecoilValue } from 'recoil';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { SliderBaseProps } from 'antd/lib/slider';
import { KnowledgeCallTypeConfig, KnowledgeCallTypeEnum, KnowledgeRecallTypeConfig } from '@/constants';
import useAgentHistory from '@/pages/AppList/components/EditContent/History/useAgentHistory';
import { convertToDecimal } from '@/utils';
import { getRagSetting, saveRagSetting } from '@/api';
import { CurrentAppState } from '@/model';
import './index.less';

// 1. 创建一个自定义组件
const SliderWithNumber: React.FC<InputNumberProps & SliderBaseProps> = ({
  value,
  onChange,
  min,
  max,
  precision,
  disabled,
}) => (
  <Space>
    <Slider
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      style={{ width: 200 }}
      tooltip={{ formatter: null }}
      step={convertToDecimal(precision)}
      disabled={disabled}
    />
    <InputNumber
      value={value}
      onChange={(_value) => ![null, undefined].includes(_value) && onChange(_value)}
      min={min}
      max={max}
      precision={precision}
      disabled={disabled}
    />
  </Space>
);

const KnowledgeSet: React.FC<ModalProps> = (modalProps) => {
  const [form] = Form.useForm();
  const { appId } = useRecoilValue(CurrentAppState);
  const callTypeValue = Form.useWatch('knowledgeToolCallType', form);
  const { isHistoryMode } = useAgentHistory();

  const onSubmit = async (e) => {
    const values = await form.validateFields();
    values.appId = appId;
    await saveRagSetting(values);
    message.success('保存成功');
    modalProps.onCancel?.(e);
  };

  useEffect(() => {
    if (modalProps?.open) {
      getRagSetting({ appId }).then(({ data }) => {
        data ? form.setFieldsValue(data) : form.resetFields();
      });
    }
  }, [appId, form, modalProps?.open]);

  return (
    <Modal
      title="知识库设置"
      wrapClassName="KnowledgeSet"
      okButtonProps={{ disabled: isHistoryMode }}
      cancelButtonProps={{ disabled: isHistoryMode }}
      onOk={onSubmit}
      {...modalProps}
    >
      <Form form={form} disabled={isHistoryMode}>
        <div className="KnowledgeSet-title">调用方式</div>
        <Form.Item name="knowledgeToolCallType" rules={[{ required: true, message: '请选择调用方式' }]}>
          <Radio.Group
            options={Object.entries(KnowledgeCallTypeConfig).map(([value, label]) => ({ value: Number(value), label }))}
          />
        </Form.Item>
        {callTypeValue === KnowledgeCallTypeEnum.manual && (
          <Form.Item name="isSpecifySpaceCall" label="是否指定空间调用" normalize={Number} valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
        <div className="KnowledgeSet-title">召回策略</div>
        {Object.entries(KnowledgeRecallTypeConfig)
          .sort((a, b) => a[1].order - b[1].order)
          .map(([value, { label, tip, min, max, precision = 0 }]) => (
            <Form.Item
              key={value}
              label={label}
              name={value}
              tooltip={{ title: tip, icon: <InfoCircleOutlined /> }}
              style={{ marginBottom: 6, textAlign: 'right' }}
            >
              <SliderWithNumber min={min} max={max} precision={precision} disabled={isHistoryMode} />
            </Form.Item>
          ))}
      </Form>
    </Modal>
  );
};

export default KnowledgeSet;
