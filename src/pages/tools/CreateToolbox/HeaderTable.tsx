import React, { useCallback } from 'react';
import type { FormListFieldData } from 'antd';
import { Form, Input, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRecoilValue } from 'recoil';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Shanchu } from '@/assets/icons';
import { GlobalConfigState } from '@/model';

const HeaderTable = () => {
  const globalConfig = useRecoilValue(GlobalConfigState);

  const getColumns: (remove: (id: number) => void) => ColumnsType<FormListFieldData> = useCallback(
    (remove) => [
      {
        title: 'Key',
        dataIndex: 'key',
        width: 180,
        render: (v, { name, ...fieldProp }) => (
          <Form.Item
            {...fieldProp}
            style={{ marginBottom: 0 }}
            name={[name, 'headerKey']}
            required
            rules={[{ required: true, message: '请输入' }]}
          >
            <Input maxLength={globalConfig.toolboxHeaderKeyLimit} />
          </Form.Item>
        ),
      },
      {
        title: 'Value',
        dataIndex: 'value',
        width: 180,
        render: (v, { name, ...fieldProp }) => (
          <Form.Item
            {...fieldProp}
            style={{ marginBottom: 0 }}
            name={[name, 'headerValue']}
            rules={[{ required: true, message: '请输入' }]}
          >
            <Input maxLength={globalConfig.toolboxHeaderValueLimit} />
          </Form.Item>
        ),
      },
      {
        title: '操作',
        dataIndex: 'ope',
        render: (v, { name }) => (
          <span className="AiAgent-link">
            <Shanchu
              onClick={() => {
                remove(name);
              }}
              color="currentColor"
            />
          </span>
        ),
      },
    ],
    [globalConfig.toolboxHeaderKeyLimit, globalConfig.toolboxHeaderValueLimit],
  );
  return (
    <>
      <Form.List name="headers">
        {(fields, { add, remove }) => (
          <>
            <div className="HeaderTable-header">
              <span>
                Header列表
                <Tooltip title="HTTP请求头列表是客户端程序和服务器在每个HTTP请求和响应中发送和接收的字符串列表。这些标头通常对最终用户不可见，仅由服务器和客户端应用程序处理或记录。">
                  <InfoCircleOutlined style={{ marginLeft: 8, color: '#bfbfbf' }} />
                </Tooltip>
              </span>
              {fields.length < globalConfig.toolboxHeaderLimit && (
                <PlusOutlined onClick={() => add()} className="AiAgent-link" />
              )}
            </div>
            {/* Form.List接管后，数据源中的每一行数据都变为一个field */}
            <Table<FormListFieldData> columns={getColumns(remove)} dataSource={fields} bordered pagination={false} />
          </>
        )}
      </Form.List>
    </>
  );
};

export default HeaderTable;
