import React, { useCallback } from 'react';
import { Form, type FormListFieldData, Input, InputNumber, Select, Table, type TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FormInstance } from 'antd/es/form/Form';
import { ToolParamsTypeEnum, ToolParamsTypeShowEnum } from '@/constants';
import type { ToolNS } from '@/types/Tools';
import { useSize } from 'ahooks';

interface IProps {
  level?: number; // 当前表格层级，默认1级
  form: FormInstance<any>;
  formListNamePath: (string | number)[];
  fullNamePath: (string | number)[];
  expandedRowKeys: Set<string>;
  setExpandedRowKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
  tableProps?: TableProps<FormListFieldData>; // 其他的TableProps
}

const RenderFormTable: React.FC<IProps> = ({
  level = 1,
  form,
  formListNamePath,
  fullNamePath,
  expandedRowKeys,
  setExpandedRowKeys,
  tableProps,
}) => {
  const { getFieldValue } = form;
  const wrapperWidth = useSize(document.querySelector('.EditParams-content'))?.width || 320 - 32;

  const renderTypeComponent = useCallback((type: ToolNS.ToolParamsType['type']) => {
    switch (type) {
      case ToolParamsTypeEnum.string:
        return <Input maxLength={100} />;
      case ToolParamsTypeEnum.number:
      case ToolParamsTypeEnum.integer:
        return <InputNumber style={{ width: '100%' }} />;
      case ToolParamsTypeEnum.boolean:
        return (
          <Select allowClear>
            <Select.Option value={true}>true</Select.Option>
            <Select.Option value={false}>false</Select.Option>
          </Select>
        );
      default:
        return <Input />;
    }
  }, []);

  const onExpandChange = useCallback(
    ({ expanded, rowKey }) => {
      setExpandedRowKeys((pre) => {
        const newSet = new Set(pre);
        if (expanded) {
          return newSet.add(rowKey);
        } else {
          newSet.delete(rowKey);
          return newSet;
        }
      });
    },
    [setExpandedRowKeys],
  );
  const getColumns: (params: {
    fields: FormListFieldData[];
    add: () => void;
    remove: (id: number) => void;
  }) => ColumnsType<FormListFieldData> = useCallback(
    ({ fields, add, remove }) => {
      const initColumns = [
        {
          title: '参数名称',
          dataIndex: 'name',
          ellipsis: true,
          width: wrapperWidth * 0.3 - (level - 1) * 32,
          render: (val, { name }) => {
            const { name: paName, required } = form.getFieldValue([...fullNamePath, name]) || {};
            return required ? <div className="RequiredColumn">{paName}</div> : paName;
          },
        },
        {
          title: '参数类型',
          dataIndex: 'type',
          width: wrapperWidth * 0.25,
          render: (val, { name }) => {
            const { type, subType } = form.getFieldValue([...fullNamePath, name]) || {};
            return (
              ToolParamsTypeShowEnum[type] +
              (type === ToolParamsTypeEnum.array
                ? `<${ToolParamsTypeShowEnum[subType || ToolParamsTypeEnum.string]}>`
                : '')
            );
          },
        },
        {
          title: '参数值',
          dataIndex: 'value',
          render: (_, { name }) => {
            const { type, required, name: paName } = form.getFieldValue([...fullNamePath, name]) || {};
            if (type === ToolParamsTypeEnum.object) return null;
            return (
              <Form.Item
                name={[name, 'value']}
                required={required}
                rules={[{ required, message: '请输入' }]}
                style={{ marginTop: 0, marginBottom: 0 }}
              >
                {renderTypeComponent(type)}
              </Form.Item>
            );
          },
        },
      ];
      return initColumns;
    },
    [wrapperWidth],
  );

  const expandedRowRender = useCallback(
    (record) => {
      return (
        <RenderFormTable
          form={form}
          formListNamePath={[record.name, 'subParams']}
          fullNamePath={[...fullNamePath, record.name, 'subParams']}
          expandedRowKeys={expandedRowKeys}
          setExpandedRowKeys={setExpandedRowKeys}
          tableProps={{ showHeader: false }}
          level={level + 1}
        />
      );
    },
    [form, fullNamePath],
  );
  return (
    <Form.List name={formListNamePath}>
      {(fields, { add, remove }) => {
        return (
          <>
            {/* Form.List接管后，数据源中的每一行数据都变为一个field */}
            <Table<FormListFieldData>
              rowKey={({ name }) => [...fullNamePath, name].join('.')}
              columns={getColumns({ fields, add, remove })}
              dataSource={fields}
              bordered={false}
              pagination={false}
              className={'formListTable'}
              expandable={{
                expandedRowRender,
                defaultExpandAllRows: true,
                rowExpandable: (record) => {
                  return getFieldValue([...fullNamePath, record.name, 'subParams']);
                },
                expandedRowKeys: [...expandedRowKeys],
                onExpand: (expanded, record) => {
                  const rowKey = [...fullNamePath, record.name].join('.');
                  onExpandChange({ expanded, rowKey });
                },
              }}
              {...tableProps}
            />
          </>
        );
      }}
    </Form.List>
  );
};

export default RenderFormTable;
