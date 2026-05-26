import { Form } from 'antd';

export const useGetFormData = () => {
  const form = Form.useFormInstance();
  const cardStyleValue = Form.useWatch('cardStyle', form);
  const hasActionValue = Form.useWatch('hasAction', form);
  const actionValue = Form.useWatch('action', form);
  const verticalCardStyle = Form.useWatch('showStyle', form);

  return { cardStyleValue, hasActionValue, actionValue, verticalCardStyle };
};
