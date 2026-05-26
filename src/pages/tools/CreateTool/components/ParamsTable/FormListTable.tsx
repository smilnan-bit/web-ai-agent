import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { FormListFieldData, TableProps } from 'antd';
import { Button, Checkbox, Form, Input, Table } from 'antd';
import { isEqual } from 'lodash-es';
import { useRecoilValue } from 'recoil';
import type { ColumnsType } from 'antd/es/table';
import type { FormInstance } from 'antd/es/form/Form';
import { PlusOutlined } from '@ant-design/icons';
import { ParamNameValidator, ToolParamsLocationEnum, ToolParamsTypeEnum } from '@/constants';
import EnumSelect from '@/components/EnumSelect';
import { Shanchu } from '@/assets/icons';
import { GlobalConfigState } from '@/model';
import { accAllParamsPath, getObjValueFromArr, validateRepeatItem } from '@/utils';
import { pickEnumKeys, syncSubParamsType } from '@/pages/tools/CreateTool/utils';
import './index.less';
import { TypeSelectItem } from './TypeSelectItem';

const MaxLevel = 4; // Object/Array最大嵌套层级

export interface FormListTableProps {
  form: FormInstance;
  formListNamePath: (string | number)[]; // 当前FormList的namePath
  fullNamePath?: (string | number)[]; // 完整路径，用于读取FormItem中的值(FormList中getFieldValue的namepath必须是完整的)
  isResponse?: boolean; // 是否是输出参数
  level?: number; // 当前是第几层，用于控制最大嵌套层数
  tableProps?: TableProps<FormListFieldData>; // 其他的TableProps
  maxParamId: number;
  setMaxParamId: React.Dispatch<React.SetStateAction<number>>;
  expandedRowKeys: Set<string>;
  setExpandedRowKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
  wrapperWidth: number;
}

export interface FormListTableRefType {
  add: (data: any) => void;
  onValueChange: (changedValues: any, allValues: any) => void;
}

const ColumnFormItemStyle = { marginTop: 0, marginBottom: 0 };

const FormListTable: React.ForwardRefRenderFunction<FormListTableRefType, FormListTableProps> = (
  {
    form,
    formListNamePath,
    fullNamePath = formListNamePath,
    isResponse = false,
    level = 1,
    tableProps = {},
    maxParamId,
    setMaxParamId,
    expandedRowKeys,
    setExpandedRowKeys,
    wrapperWidth,
  },
  parentRef,
) => {
  const currentAddFunc = useRef<() => void>();
  const sonTableRef = useRef<FormListTableRefType[]>([]); // 子表格的ref,因为子表格可能有多个，所以采用数组存储
  const globalConfig = useRecoilValue(GlobalConfigState) || {};
  const { getFieldValue } = form;

  useImperativeHandle(
    parentRef,
    () => ({
      add: currentAddFunc?.current || (() => {}),
      onValueChange: (changedValues, allValues) => {
        if (isResponse) return;
        const changedParams = changedValues[fullNamePath[0]];
        (changedParams || []).forEach((changedItem, index) => {
          if (changedItem?.location !== undefined) {
            const currentItem = allValues?.[fullNamePath[0]]?.[index];
            if (currentItem?.deep === 1) {
              // deep=1的type变化，需要同步所有子项
              const newType = changedItem?.location;
              syncSubParamsType(form, [fullNamePath[0], index, 'subParams'], newType);
            }
          }
        });
      },
    }),
    [],
  );

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
          title: <div className="RequiredColumn">参数名称</div>,
          dataIndex: 'name',
          width: wrapperWidth * 0.2 - (level - 1) * 32,
          render: (v, { name }) => (
            <>
              <Form.Item name={[name, 'id']} noStyle>
                <></>
              </Form.Item>
              <Form.Item name={[name, 'deep']} initialValue={level} noStyle>
                <></>
              </Form.Item>
              <Form.Item
                name={[name, 'name']}
                dependencies={accAllParamsPath([fullNamePath[0]], getFieldValue(fullNamePath[0]))}
                rules={[
                  { required: true, message: '请输入' },
                  ParamNameValidator,
                  ({ getFieldValue }) => {
                    return {
                      validator: (rule, val, cb) => {
                        const itemValue = getFieldValue([...fullNamePath, name]);
                        // 动态获取当前表单数据进行验证
                        const currentAllValues = getFieldValue(fullNamePath[0]);
                        const isRepeat = validateRepeatItem(itemValue, currentAllValues);
                        if (isRepeat) cb('变量名重复');
                        cb();
                      },
                    };
                  },
                ]}
                style={{ ...ColumnFormItemStyle, width: wrapperWidth * 0.2 - 32 - (level - 1) * 32 }} // formItem中也要固定宽度，不然嵌套表格样式错乱
              >
                <Input placeholder="请输入参数名称，确保含义清晰" maxLength={globalConfig.toolParamNameLimit} />
              </Form.Item>
            </>
          ),
        },
        {
          title: isResponse ? '参数描述' : <div className="RequiredColumn">参数描述</div>,
          dataIndex: 'desc',
          render: (v, { name }) => (
            <Form.Item
              name={[name, 'desc']}
              style={ColumnFormItemStyle}
              rules={isResponse ? [] : [{ required: true, message: '请输入' }]}
            >
              <Input placeholder="请描述参数功能，确保含义清晰、易理解" maxLength={globalConfig.toolParamDescLimit} />
            </Form.Item>
          ),
        },
        {
          title: <div className="RequiredColumn">参数类型</div>,
          dataIndex: 'type',
          width: wrapperWidth * 0.15,
          render: (v, { name }) => (
            <>
              <Form.Item
                name={[name, 'subType']}
                noStyle
                initialValue={
                  form.getFieldValue([...fullNamePath, name, 'type']) === ToolParamsTypeEnum.array
                    ? ToolParamsTypeEnum.string
                    : undefined
                }
              >
                <></>
              </Form.Item>
              <Form.Item
                name={[name, 'type']}
                style={{ ...ColumnFormItemStyle, width: wrapperWidth * 0.15 }}
                rules={[{ required: true, message: '请选择' }]}
              >
                <TypeSelectItem
                  subType={form.getFieldValue([...fullNamePath, name, 'subType'])}
                  disableObject={level >= MaxLevel}
                  // 输入参数 object下不允许选择array
                  disableArray={!isResponse && level > 1}
                  otherChange={(value) => {
                    const { location } = form.getFieldValue([...fullNamePath, name]) || {};
                    const requestObject = [ToolParamsLocationEnum.body, ToolParamsLocationEnum.header];
                    const type = value?.[0];
                    if (type && [ToolParamsTypeEnum.object].includes(type)) {
                      form.setFieldValue(
                        [...fullNamePath, name, 'subParams'],
                        [{ id: maxParamId + 1, ...(location && requestObject.includes(location) ? { location } : {}) }],
                      );
                      if (!requestObject.includes(location))
                        form.setFieldValue([...fullNamePath, name, 'location'], null);
                      form.setFieldValue([...fullNamePath, name, 'required'], false); // object类型不支持必填
                      setMaxParamId((pre) => pre + 1);
                    } else {
                      form.setFieldValue([...fullNamePath, name, 'subParams'], undefined);
                    }
                    type &&
                      onExpandChange({
                        expanded: [ToolParamsTypeEnum.object].includes(type),
                        rowKey: [...fullNamePath, name].join('.'),
                      });

                    form.setFieldValue(
                      [...fullNamePath, name, 'subType'],
                      type === ToolParamsTypeEnum.array ? value?.[1] : undefined,
                    );
                  }}
                />
              </Form.Item>
            </>
          ),
        },
        {
          title: <div className="RequiredColumn">传入方法</div>,
          dataIndex: 'location',
          width: wrapperWidth * 0.1,
          render: (v, { name }) => {
            const { deep, type } = form.getFieldValue([...fullNamePath, name]) || {};
            const isObjectRequest = !isResponse && [ToolParamsTypeEnum.object, ToolParamsTypeEnum.array].includes(type);
            const requestObject = pickEnumKeys(ToolParamsLocationEnum, ['body', 'header']);
            const config = isObjectRequest ? requestObject : ToolParamsLocationEnum;
            return (
              <Form.Item
                name={[name, 'location']}
                style={ColumnFormItemStyle}
                rules={[{ required: true, message: '请选择' }]}
              >
                <EnumSelect
                  disabled={!isResponse && deep > 1}
                  optionsConfig={config}
                  hasAll={false}
                  isNumberEnum={true}
                />
              </Form.Item>
            );
          },
        },
        {
          title: '是否必填',
          dataIndex: 'required',
          width: wrapperWidth * 0.1,
          render: (v, { name }) => {
            const { deep, type } = form.getFieldValue([...fullNamePath, name]) || {};
            const isObjectRequest = !isResponse && type === ToolParamsTypeEnum.object;
            return (
              <Form.Item
                name={[name, 'required']}
                style={ColumnFormItemStyle}
                initialValue={false}
                valuePropName="checked"
              >
                <Checkbox disabled={isObjectRequest} />
              </Form.Item>
            );
          },
        },
        {
          title: '操作',
          dataIndex: 'ope',
          width: wrapperWidth * 0.1,
          render: (v, { name, ...params }) => {
            return (
              <Form.Item
                shouldUpdate={(prev, current) => {
                  const prevValue = getObjValueFromArr(prev, [...fullNamePath, name]);
                  const currentValue = getObjValueFromArr(current, [...fullNamePath, name]);
                  return (
                    prevValue?.subParams?.length !== currentValue?.subParams?.length ||
                    prevValue?.type !== currentValue?.type ||
                    prevValue?.location !== currentValue?.location
                  );
                }}
                noStyle
              >
                {({ getFieldValue }) => {
                  const sameLevelParam = getFieldValue([...fullNamePath, name]);
                  return (
                    <div style={{ display: 'flex' }} className="AiAgent-link">
                      {[ToolParamsTypeEnum.object].includes(sameLevelParam?.type) &&
                        (sameLevelParam?.subParams?.length || 0) < globalConfig.subParamLimit && (
                          <PlusOutlined
                            style={{ marginRight: 12, fontSize: 16 }}
                            onClick={() => {
                              const type = sameLevelParam?.type;
                              // object类型的时候，新增子参数location需要和父参数保持一致
                              const location = sameLevelParam?.location;
                              const requestObject = [ToolParamsLocationEnum.body, ToolParamsLocationEnum.header];

                              const subLoation = requestObject.includes(location) ? location : null;

                              sonTableRef?.current[name]?.add({
                                id: maxParamId + 1,
                                ...(type === ToolParamsTypeEnum.object ? { location: subLoation } : {}),
                              });
                              setMaxParamId((pre) => pre + 1);
                            }}
                          />
                        )}
                      <span className="AiAgent-link" style={{ display: 'inline-flex' }}>
                        {(level === 1 || fields.length !== 1) && (
                          <Shanchu
                            onClick={() => {
                              remove(name);
                            }}
                            color={'currentColor'}
                            size={16}
                          />
                        )}
                      </span>
                    </div>
                  );
                }}
              </Form.Item>
            );
          },
        },
      ];
      return !isResponse ? initColumns : initColumns.filter((column) => column.dataIndex !== 'location');
    },
    [
      wrapperWidth,
      isResponse,
      level,
      fullNamePath,
      globalConfig.toolParamNameLimit,
      globalConfig.toolParamDescLimit,
      globalConfig.subParamLimit,
      onExpandChange,
      form,
      maxParamId,
      setMaxParamId,
      getFieldValue,
    ],
  );
  const expandedRowRender = useCallback(
    (record) => {
      return (
        <FormListTableWrapper
          ref={(ref) => {
            if (ref) {
              sonTableRef.current[record.name] = ref;
            }
          }}
          form={form}
          isResponse={isResponse}
          level={level + 1}
          tableProps={{ showHeader: false }}
          formListNamePath={[record.name, 'subParams']}
          fullNamePath={[...fullNamePath, record.name, 'subParams']}
          maxParamId={maxParamId}
          setMaxParamId={setMaxParamId}
          expandedRowKeys={expandedRowKeys}
          setExpandedRowKeys={setExpandedRowKeys}
          wrapperWidth={wrapperWidth}
        />
      );
    },
    [
      form,
      isResponse,
      level,
      fullNamePath,
      maxParamId,
      setMaxParamId,
      expandedRowKeys,
      setExpandedRowKeys,
      wrapperWidth,
    ],
  );

  return (
    <>
      <Form.List name={formListNamePath}>
        {(fields, { add, remove }) => {
          currentAddFunc.current = add;
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
                    return [ToolParamsTypeEnum.object].includes(getFieldValue([...fullNamePath, record.name, 'type']));
                  },
                  expandedRowKeys: [...expandedRowKeys],
                  onExpand: (expanded, record) => {
                    const rowKey = [...fullNamePath, record.name].join('.');
                    onExpandChange({ expanded, rowKey });
                  },
                }}
                {...tableProps}
              />
              {level === 1 && fields.length < globalConfig.paramLimit && (
                <Button
                  type="dashed"
                  onClick={() => {
                    add({ id: maxParamId + 1 });
                    setMaxParamId((pre) => pre + 1);
                  }}
                  block
                  style={{ width: 110, marginTop: 16 }}
                >
                  <PlusOutlined />
                  新增参数
                </Button>
              )}
            </>
          );
        }}
      </Form.List>
    </>
  );
};

// 使用 React.memo 包装组件，避免不必要的重渲染
const FormListTableWrapper = React.memo(
  forwardRef<FormListTableRefType, FormListTableProps>(FormListTable),
  // 自定义比较函数，只比较真正影响渲染的 props
  (prevProps, nextProps) => {
    return (
      prevProps.level === nextProps.level &&
      prevProps.isResponse === nextProps.isResponse &&
      prevProps.wrapperWidth === nextProps.wrapperWidth &&
      prevProps.maxParamId === nextProps.maxParamId &&
      prevProps.expandedRowKeys === nextProps.expandedRowKeys &&
      isEqual(prevProps.formListNamePath, nextProps.formListNamePath) &&
      isEqual(prevProps.fullNamePath, nextProps.fullNamePath)
    );
  },
);

export default FormListTableWrapper;
