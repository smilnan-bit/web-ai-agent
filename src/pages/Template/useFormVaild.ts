import { useEffect, useState } from 'react';
import { Form } from 'antd';
export const useFormValidation = (form, requiredFields: string[] = []) => {
  const [isValid, setIsValid] = useState(false);
  const values = Form.useWatch([], form);

  useEffect(() => {
    const checkFormValid = async () => {
      try {
        // 检查必填字段
        if (requiredFields.length > 0) {
          const hasAllRequired = requiredFields.every((field) => {
            const value = form.getFieldValue(field);
            return value && value.toString().trim() !== '';
          });

          if (!hasAllRequired) {
            setIsValid(false);
            return;
          }
        }

        // 验证表单
        await form.validateFields({ validateOnly: true });
        setIsValid(true);
      } catch {
        setIsValid(false);
      }
    };

    checkFormValid();
  }, [values, form, requiredFields]);

  return isValid;
};
