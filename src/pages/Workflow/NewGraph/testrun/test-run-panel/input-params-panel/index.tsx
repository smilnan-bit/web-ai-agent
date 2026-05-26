import React, { useCallback } from 'react';
import RenderInput from '@/components/RenderInput';
import FormFragment from '../../../components/form-fragment';
import { Button, Form } from 'antd';
import { useGetWorkflowInput } from '../../../hooks/use-get-workflow-input';
import { INPUT_PARAM_FILTER_DEFAULT } from '../../../constants';
import { IconJiantouXia } from '../../../nodes/icons';

export function InputParamsPanel({ onStartChat }: { onStartChat: (values: Record<string, any>) => void }) {
  const [form] = Form.useForm();

  const getWorkflowInput = useGetWorkflowInput();
  const { inputParam } = getWorkflowInput();
  const inputParamFilterDefault = inputParam?.slice(INPUT_PARAM_FILTER_DEFAULT.length);

  const onSaveAndStartChat = useCallback(() => {
    form.validateFields().then((values) => {
      onStartChat(values);
    });
  }, [form, onStartChat]);

  return (
    <div tw="px-[16px] pb-[16px] h-[calc(100% - 64px)] flex flex-col">
      <div tw="overflow-y-auto h-[calc(100% - 40px)]">
        <FormFragment title="试运行输入" disableWhenReadonly={false}>
          <RenderInput inputParam={inputParamFilterDefault || []} form={form} renderInitParam={true} />
        </FormFragment>
      </div>
      <Button
        onClick={onSaveAndStartChat}
        type="primary"
        tw="mt-auto flex items-center justify-center gap-1"
        icon={<IconJiantouXia color="currentColor" size={16} style={{ transform: 'rotate(-90deg)' }} />}
      >
        保存并开始对话
      </Button>
    </div>
  );
}
