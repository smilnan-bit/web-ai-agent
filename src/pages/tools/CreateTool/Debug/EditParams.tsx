import React, { useCallback, useEffect } from 'react';
import { Button, Checkbox, Form, type FormListFieldData, Input, InputNumber, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRecoilState, useSetRecoilState } from 'recoil';
import type { FormInstance } from 'antd/es/form/Form';
import { ToolDebugStatusEnum, ToolParamsTypeEnum, ToolboxTypeEnum } from '@/constants';
import type { ToolNS } from '@/types/Tools';
import { debugTool } from '@/api';
import { accAllExpandedKeys, convertToObject, useQueryLocationSearch } from '@/utils/other';
import RenderFormTable from '@/pages/tools/CreateTool/Debug/EditParamsList';
import { CurrentDebugState, CurrentToolState } from '../model';

const EditParams: React.FC = () => {
  const [form] = Form.useForm();
  const [currentTool, setCurrentTool] = useRecoilState(CurrentToolState);
  const setDebugState = useSetRecoilState(CurrentDebugState);
  const { toolboxId, toolId, toolboxType } = useQueryLocationSearch();

  const [expandedRowKeys, setExpandedRowKeys] = React.useState<Set<string>>(new Set());

  const isModelTool = toolboxType === ToolboxTypeEnum.modelTool;
  useEffect(() => {
    if (isModelTool) {
      setCurrentTool((pre) => ({
        ...pre,
        requestParams: [
          {
            name: 'query',
            type: ToolParamsTypeEnum.string,
            value: '',
          },
        ],
      }));
    }
  }, [isModelTool, setCurrentTool]);

  const onDebug = useCallback(async () => {
    const values = await form.validateFields();
    const { requestParams } = values || {};

    const formatValue = convertToObject(requestParams || []);
    setCurrentTool((pre) => ({
      ...pre,
      debugStatus: undefined,
    }));
    try {
      const res = await debugTool({
        toolId: currentTool?.toolId || toolId,
        toolboxId,
        params: formatValue,
      });

      setDebugState({ params: formatValue, debugRes: res });
      setCurrentTool((pre) => ({
        ...pre,
        debugStatus: ToolDebugStatusEnum.success,
      }));
    } catch (e) {
      setDebugState({ params: formatValue, debugRes: e });
      setCurrentTool((pre) => ({
        ...pre,
        debugStatus: ToolDebugStatusEnum.fail,
      }));
    }
  }, [form, setCurrentTool, currentTool?.toolId, toolId, toolboxId, setDebugState]);

  const renderTypeComponent = useCallback((type: ToolNS.ToolParamsType['type']) => {
    switch (type) {
      case ToolParamsTypeEnum.string:
        return <Input maxLength={100} />;
      case ToolParamsTypeEnum.number:
      case ToolParamsTypeEnum.integer:
        return <InputNumber style={{ width: '100%' }} />;
      case ToolParamsTypeEnum.boolean:
        return (
          <Select>
            <Select.Option value={true}>true</Select.Option>
            <Select.Option value={false}>false</Select.Option>
          </Select>
        );
      default:
        return <Input />;
    }
  }, []);

  const columns: ColumnsType<ToolNS.ToolParamsType> = [
    {
      title: '参数名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (val, { required }) => (required ? <div className="RequiredColumn">{val}</div> : val),
    },
    { title: '参数类型', dataIndex: 'type', render: (val) => ToolParamsTypeEnum[val] },
    {
      title: '参数值',
      dataIndex: 'value',
      width: 220,
      render: (_, { name, required, type }) => (
        <Form.Item name={name} required={required} rules={[{ required, message: '请输入' }]} style={{ marginTop: 16 }}>
          {renderTypeComponent(type)}
        </Form.Item>
      ),
    },
  ];

  /**
   * 递归清空Form List中指定字段的值
   * @param form AntD Form实例
   * @param fieldNames 需要清空的字段名数组
   */
  const clearNestedFormFields = (form: FormInstance, fieldNames: string[]) => {
    // 获取当前表单所有值
    const currentValues = form.getFieldsValue(true);

    // 递归处理嵌套字段
    const processObject = (obj: Record<string, any>, path: string[] = []) => {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = [...path, key];
        console.log('key===', key);
        console.log('currentPath===', currentPath);
        // 如果是数组（Form List）
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            processObject(item, [...currentPath, index.toString()]);
          });
        } else if (value && typeof value === 'object') {
          processObject(value, currentPath);
        } else if (fieldNames.includes(key)) {
          const fullPath = currentPath.join('.');
          console.log('fullPath===', fullPath);
          form.setFieldsValue({ [fullPath]: undefined });
        }
      });
    };

    processObject(currentValues);
  };

  useEffect(() => {
    form.setFieldsValue({ requestParams: currentTool?.requestParams });

    try {
      accAllExpandedKeys(currentTool?.requestParams || [], ['requestParams'], setExpandedRowKeys);
    } catch (e) {}
  }, [form, currentTool?.requestParams]);

  return (
    <div className="EditParams">
      <div className="EditParams-header">输入参数</div>
      <div className="EditParams-content">
        <Form form={form}>
          <RenderFormTable
            form={form}
            formListNamePath={['requestParams']}
            fullNamePath={[...['requestParams']]}
            expandedRowKeys={expandedRowKeys}
            setExpandedRowKeys={setExpandedRowKeys}
          />
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={() => onDebug()}>运行</Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default EditParams;
