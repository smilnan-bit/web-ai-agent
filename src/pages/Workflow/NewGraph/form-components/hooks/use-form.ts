import { useForm as useBaseForm } from '@flowgram.ai/free-layout-editor';

export function useForm() {
  const baseForm = useBaseForm();
  const form = {
    getValueIn: baseForm.getValueIn.bind(baseForm),
    setValueIn: baseForm.setValueIn.bind(baseForm),
    validate: baseForm.validate?.bind(baseForm),
    values: baseForm.values,
    initialValues: baseForm.initialValues,
    state: baseForm.state,
    getFieldValue: baseForm.getValueIn.bind(baseForm),
    setFieldValue: baseForm.setValueIn.bind(baseForm),
    validateFields: () => {}, // flowgram.ai在validate里去定义校验逻辑
    baseForm: baseForm,
  };

  return form;
}
