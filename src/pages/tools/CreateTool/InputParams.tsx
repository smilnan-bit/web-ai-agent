import React, { useCallback, useEffect, useRef } from 'react';
import { Form } from 'antd';
import { useRecoilState } from 'recoil';
import { useMemoizedFn, useSize } from 'ahooks';
import { updateTool } from '@/api';
import { accAllExpandedKeys, useQueryLocationSearch } from '@/utils/other';
import { useMaxParamId } from '@/utils';
import type { FormListTableRefType } from '@/pages/tools/CreateTool/components/ParamsTable/FormListTable';
import ParamsTable from './components/ParamsTable';
import Actions from './Actions';
import { CurrentToolState } from './model';
import { deleteId } from './utils';

const InputParams = () => {
  const [form] = Form.useForm();
  const [currentTool, setCurrentTool] = useRecoilState(CurrentToolState);
  const { toolId, requestParams } = currentTool || {};
  const { toolboxId } = useQueryLocationSearch();
  const inputParamData = Form.useWatch('requestParams', form);
  const { maxParamId, setMaxParamId } = useMaxParamId(inputParamData);
  const [expandedRowKeys, setExpandedRowKeys] = React.useState<Set<string>>(new Set());
  const paramTableRef = useRef<FormListTableRefType>(null);
  const tableWrapperWidth = useSize(document.querySelector('.CreateTool') as HTMLElement);

  const validateData = useCallback(async () => {
    const values = await form.validateFields();
    values.requestParams = deleteId(values.requestParams);
    await updateTool({ ...values, toolboxId, toolId });
    setCurrentTool((pre) => ({ ...(pre || {}), ...values }));
  }, [form, setCurrentTool, toolId, toolboxId]);

  const { setFieldsValue } = form;

  useEffect(() => {
    requestParams && setFieldsValue({ requestParams });
    accAllExpandedKeys(requestParams, ['requestParams'], setExpandedRowKeys);
  }, [requestParams, setFieldsValue]);

  const handleValueChange = useMemoizedFn((changedValues, allValues) => {
    paramTableRef?.current?.onValueChange(changedValues, allValues);
  });

  return (
    <>
      <Form form={form} onValuesChange={handleValueChange}>
        <ParamsTable
          formListNamePath={['requestParams']}
          form={form}
          maxParamId={maxParamId}
          setMaxParamId={setMaxParamId}
          expandedRowKeys={expandedRowKeys}
          setExpandedRowKeys={setExpandedRowKeys}
          ref={paramTableRef}
          wrapperWidth={(tableWrapperWidth?.width || document.body.clientWidth) - 32}
        />
      </Form>
      <Actions validateData={validateData} />
    </>
  );
};
export default InputParams;
