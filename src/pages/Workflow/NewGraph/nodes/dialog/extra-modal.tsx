import type { ModalProps } from 'antd';
import { Col, Form, Input, InputNumber, Modal, Row, Slider } from 'antd';
import React, { useEffect } from 'react';
import { DialogAnswerTypeEnum } from './type';
import { usePlayground, useWatch } from '@flowgram.ai/free-layout-editor';

const DialogDefaultAskUserLimit = 0;
const DirectAskUserLimit = 2;

const IntegerStep = React.memo(
  ({
    value,
    onChange,
    disabled,
  }: { value?: number; onChange?: (value: number | null) => void; disabled?: boolean }) => {
    return (
      <Row>
        <Col span={12}>
          <Slider
            min={0}
            max={5}
            onChange={onChange}
            value={typeof value === 'number' ? value : 0}
            step={1}
            disabled={disabled}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            min={0}
            max={5}
            style={{ margin: '0 16px' }}
            value={value}
            onChange={onChange}
            precision={0}
            disabled={disabled}
          />
        </Col>
      </Row>
    );
  },
);

const InputDescWord = {
  [DialogAnswerTypeEnum.direct]: '必填字段',
  [DialogAnswerTypeEnum.fixed]: '按钮选项',
  [DialogAnswerTypeEnum.dynamic]: '按钮选项',
  [DialogAnswerTypeEnum.card]: '选择的卡片',
};

const ExtraModal: React.FC<ModalProps & { outform }> = ({ outform, onCancel, ...modalProps }) => {
  const [form] = Form.useForm();
  const typeValue = useWatch<DialogAnswerTypeEnum>('type');
  const playground = usePlayground();
  const readonly = playground?.config?.readonly ?? false;

  const onOk = async (e) => {
    const values = await form.validateFields();
    outform.setFieldValue('askUserLimit', values.askUserLimit);
    outform.setFieldValue('askUserPrompt', values.askUserPrompt);
    onCancel?.(e);
  };

  useEffect(() => {
    if (modalProps.open) {
      const initAskUserLimit = outform.getFieldValue('askUserLimit');
      const askUserLimit =
        initAskUserLimit !== undefined
          ? initAskUserLimit
          : typeValue === DialogAnswerTypeEnum.direct
            ? DirectAskUserLimit //直接回答默认值为2次，其他为0
            : DialogDefaultAskUserLimit;
      form.setFieldsValue({
        askUserLimit,
        askUserPrompt: outform.getFieldValue('askUserPrompt'),
      });
    }
  }, [outform, modalProps.open, form]);

  return (
    <Modal {...modalProps} title="反问策略" onCancel={onCancel} onOk={onOk} okButtonProps={{ disabled: readonly }}>
      <Form form={form} layout="vertical" disabled={readonly}>
        <Form.Item
          name="askUserLimit"
          label="最大反问次数"
          tooltip="在当前对话节点下，允许大模型反问客户的次数，若输入为0，则代表无需大模型反问。若在多次反问后，还是未获取到必填参数，则工作流将终止运行"
        >
          <IntegerStep disabled={readonly} />
        </Form.Item>
        <Form.Item name="askUserPrompt" label="提示词">
          <Input.TextArea
            placeholder={`支持设置额外的提示词，当用户回复中没有获取到${typeValue !== undefined && InputDescWord?.[typeValue] ? InputDescWord[typeValue] : ''}信息时，大模型将根据本提示词中设置的人设进行主动反问。
示例：请根据上下文进行反问，注意反问时尽量做到语气温和，自然。多使用俏皮的反问语句引导客户。`}
            rows={5}
            style={{ maxHeight: 'calc(100vh - 500px)' }}
            maxLength={1000}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExtraModal;
