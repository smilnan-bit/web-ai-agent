import React, { useCallback, useEffect } from 'react';
import { Form, message } from 'antd';
import { useRecoilState } from 'recoil';
import { updateTool } from '@/api';
import { useMaxParamId } from '@/utils';
import { accAllExpandedKeys, useQueryLocationSearch } from '@/utils/other';
import ParamsTable from './components/ParamsTable';
import Actions from './Actions';
import { CurrentToolState } from './model';
import { deleteId } from './utils';
import { useSize } from 'ahooks';

const OutputParams = () => {
  const [form] = Form.useForm();
  const [currentTool, setCurrentTool] = useRecoilState(CurrentToolState);
  const { toolId, responseParams } = currentTool || {};
  const { toolboxId } = useQueryLocationSearch();
  const inputParamData = Form.useWatch('responseParams', form);
  const { maxParamId, setMaxParamId } = useMaxParamId(inputParamData);
  const [expandedRowKeys, setExpandedRowKeys] = React.useState<Set<string>>(new Set());
  const tableWrapperWidth = useSize(document.querySelector('.CreateTool') as HTMLElement);

  const validateData = useCallback(async () => {
    const values = await form.validateFields();

    values.responseParams = deleteId(values.responseParams);
    await updateTool({ ...values, toolboxId, toolId });
    setCurrentTool((pre) => ({ ...(pre || {}), ...values }));
  }, [form, setCurrentTool, toolId, toolboxId]);

  useEffect(() => {
    responseParams && form.setFieldsValue({ responseParams });
    accAllExpandedKeys(responseParams, ['responseParams'], setExpandedRowKeys);
  }, [form, responseParams]);
  return (
    <>
      <Form form={form}>
        <ParamsTable
          isResponse={true}
          formListNamePath={['responseParams']}
          form={form}
          maxParamId={maxParamId}
          setMaxParamId={setMaxParamId}
          expandedRowKeys={expandedRowKeys}
          setExpandedRowKeys={setExpandedRowKeys}
          wrapperWidth={(tableWrapperWidth?.width || document.body.clientWidth) - 32}
        />
      </Form>
      <Actions validateData={validateData} />
    </>
  );
};
export default OutputParams;
