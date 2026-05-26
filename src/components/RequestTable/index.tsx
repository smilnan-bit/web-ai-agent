import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table } from 'antd';
import type { PaginationProps, TableProps } from 'antd';
import isEqual from 'lodash/isEqual';

export type TableChangeInterface = (data: any) => void;

export interface TableResInterface<T> {
  code?: number; // 自定义请求状态码，例如 200
  message?: string; // 接口返回提示说明
  data?: { list: T[]; total: number };
  headers?: any; // 后端直接返回表头数据，需包含前端组件columns所需的所有属性
}

export type TableAxiosPromiseResInterface<T> = Promise<TableResInterface<T>>;

interface RequestTableProps<T = any> extends Omit<TableProps<T>, 'pagination'> {
  defaultPageSize?: (typeof pageSizeOptionsDef)[number];
  defaultPage?: number;
  isAutoColumns?: boolean; // 自动显示列, 需要满足返回的数据有headers定义列
  queryKey?: string; // 查询参数包一层，例如一般传数据 data: { ...props }，此值存在时变成 data: { [queryKey]: { ...props } }
  pagination?: boolean | PaginationProps; // 是否需要统一的分页
  params?: Record<string, unknown>; // 改请求参数对象变动自动刷新列表。注意不要这样传入不稳定的变量引用 params={ { xxx: 111 } }，造成多次请求
  request?: (params: any) => TableAxiosPromiseResInterface<T>; // 请求函数
  getTableChange?: (params: TableChangeInterface) => void; // 获取内部 params = onChange 函数引用，用来列表操作后刷新列表
  getRes?: (data?: Pick<TableResInterface<T>, 'data' | 'headers'>) => void; // 获取请求后的 data
  noDataNode?: any;
  errorNode?: (err: { code: number; message: string }) => React.ReactNode; // 出错后的展示元素
  [propName: string]: any; // 其他元素 Table 属性
}

const PageConst = {
  total: 0,
  current: 1,
  pageSize: 50,
} as const;

export const pageSizeOptionsDef = [10, 20, 30, 40, 50, 100] as const;

const RequestTable: React.FC<RequestTableProps> = (props) => {
  const {
    defaultPageSize = PageConst.pageSize,
    defaultPage = PageConst.current,
    columns,
    queryKey,
    pagination = true,
    params,
    request,
    getTableChange,
    getDataSource,
    getSetDataSource,
    getRes,
    dataSource: outerData, // 如果 dataSource 需要外部传入，则内部不发送请求获取数据
    isAutoColumns = false,
    noDataNode,
    errorNode,
  } = props;
  const [pageProps, setPage] = useState<{ pageSize: number; current: number; [propname: string]: any }>({
    ...PageConst,
    current: defaultPage,
    pageSize: pageSizeOptionsDef.includes(defaultPageSize) ? defaultPageSize : PageConst.pageSize,
    showTotal(total) {
      return `共 ${total} 条记录`;
      // return `共${total}条，共${Math.ceil(total / (this as any).pageSize) || 0}页`;
    },
    showSizeChanger: true,
    // showQuickJumper: true,
    pageSizeOptions: pageSizeOptionsDef.map((s) => s.toString()),
  });
  const [autoColumns, setAutoColumns] = useState<any[]>([]);
  const [res, setRes] = useState<Pick<TableResInterface<any>, 'data' | 'headers'>>();
  const [dataSource, setDataSource] = useState<RequestTableProps['dataSource']>([]);
  const [loading, setLoading] = useState(false);
  const { current, pageSize } = pageProps;
  const [filters, setFilters] = useState({});
  const [sorter, setSorter] = useState({});
  const [queryData, setQueryData] = useState<{ page: number; pageSize: number; [propKey: string]: any }>({
    page: current,
    pageSize,
    ...(params || {}),
  });
  const [errData, setErrorData] = useState<{ code: number; message: string } | null>();

  // 搜索参数改变时，发请求
  useEffect(() => {
    setQueryData((pre) => {
      const { page, pageSize, ...rest } = pre || {};
      return isEqual(params || {}, rest)
        ? pre
        : {
            page: page === 1 ? page : 1,
            pageSize,
            ...params,
          };
    });
  }, [params]);

  /**
   * 外部 dataSource 控制
   * 内部不自动发请求
   */
  useEffect(() => {
    if (outerData) {
      setDataSource(outerData);
    }
  }, [outerData]);

  const outerChange = props.onChange;
  /**
   * 页码跳转
   * @param current
   * @param pageSize
   * @param queryLastPage 是否查询上一页 用于删除的是当页最后一条且不是第一页，则直接查询上一页
   * @param specifyPage 指定页码
   */

  const onChange: TableChangeInterface = useCallback(
    ({ page = pageProps, f, s, e, queryLastPage = false, specifyPage } = {}) => {
      const { current, pageSize } = page;
      // console.log(f, s);
      if (f && !isEqual(f, filters)) {
        setFilters(f);
        outerChange?.(pageProps, f, s, e);
        return;
      }
      if (s && !isEqual(s, sorter)) {
        setSorter(s);
        outerChange?.(pageProps, f, s, e);
        return;
      }
      if (specifyPage !== undefined) {
        setQueryData((pre) => ({
          ...pre,
          page: specifyPage,
          pageSize,
        }));
      } else {
        setQueryData((pre) => ({
          ...pre,
          page: pre.pageSize !== pageSize ? 1 : queryLastPage ? current - 1 : current,
          pageSize,
        }));
      }
    },
    [pageProps, outerChange, filters, sorter],
  );

  useEffect(() => {
    getTableChange?.(onChange);
    return () => {
      // 这里不能直接传 undefined，因为 getTableChange 需要的是 TableChangeInterface 类型参数
      // 可以传递一个空函数，满足类型约束
      getTableChange?.(() => {});
    };
  }, [onChange, getTableChange]);
  useEffect(() => {
    getDataSource?.(dataSource);
    return () => {
      getDataSource?.([]);
    };
  }, [getDataSource, dataSource]);
  useEffect(() => {
    getRes?.(res);
    return () => {
      getRes?.(undefined);
    };
  }, [getRes, res]);
  useEffect(() => {
    getSetDataSource?.(setDataSource);
    return () => {
      getSetDataSource?.(undefined);
    };
  }, [getSetDataSource]);

  /**
   * 搜索参数和table请求url变动，自动发送请求
   */
  useEffect(() => {
    let isMounted = true;
    if (!outerData && request) {
      setLoading(true);
      const { page, pageSize, ...qiyuQueryParams } = queryData;
      if (pagination) {
        qiyuQueryParams.pageNo = page;
        qiyuQueryParams.pageSize = pageSize;
      }
      request?.(queryKey ? { [queryKey]: qiyuQueryParams } : qiyuQueryParams)
        .then(({ data, headers }) => {
          if (isMounted) {
            setRes({ data: data || { list: [], total: 0 }, headers });
            if (!data) return;
            if (Array.isArray(data)) {
              setDataSource(data);
            } else {
              // 如果是自动生成的列
              if (isAutoColumns) {
                const autoColumnsTmp = headers.map((head) => {
                  return {
                    title: head.title,
                    dataIndex: head.key,
                    key: head.key,
                  };
                });
                setAutoColumns(autoColumnsTmp);
              }
            }
            if (qiyuQueryParams.pageSize) {
              setPage((pre) => ({
                ...pre,
                total: data?.total !== undefined ? data?.total : pre.total,
                current: queryData.page, // data.page !== undefined ? data.page : queryData.page,
                pageSize: queryData.pageSize, // data.pageSize !== undefined ? data.pageSize : queryData.pageSize,
              }));
            }
            setDataSource(data?.list || []);
          }
        })
        .catch((err) => {
          setErrorData(err);
          setLoading(false);
        })
        .finally(() => isMounted && setLoading(false));
    }
    return () => {
      isMounted = false;
      setErrorData(undefined);
    };
  }, [queryData, queryKey, request, outerData, isAutoColumns, pagination]);

  const element = useMemo(() => {
    return columns || autoColumns.length ? (
      errData && errorNode ? (
        errorNode(errData)
      ) : noDataNode && !dataSource?.length ? (
        noDataNode
      ) : (
        <Table
          rowKey="id"
          loading={loading}
          {...props}
          dataSource={dataSource}
          pagination={
            pagination
              ? {
                  ...pageProps,
                  ...(pagination && typeof pagination === 'object' ? pagination : undefined),
                }
              : false
          }
          onChange={(pagination, filters, sorter, extra) =>
            onChange({ page: pagination, f: filters, s: sorter, e: extra })
          }
          columns={isAutoColumns ? autoColumns : columns}
        />
      )
    ) : (
      <div />
    );
  }, [autoColumns, columns, dataSource, noDataNode, isAutoColumns, loading, onChange, pageProps, pagination, props]);

  return element;
};

export default React.memo(RequestTable);
