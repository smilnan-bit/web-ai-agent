import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Select as AntdSelect, message } from 'antd';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import MulSelect from '@ysf/mul-select';
import type { SelectProps } from 'antd/es/select';
import { useMemoizedFn } from 'ahooks';

const SEARCH_LIMIT = 200;
export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions?: any; // 外部传入请求函数
  handleOptions?: (options: any[]) => void; // 获得数据源
  debounceTimeout?: number; // 防抖时间
  defaultOption?: any; // 外部传入初始化的数据
  total?: number; // 外部传入规则组总数
  fetchData?: any; // 请求参数， 改请求参数对象变动自动刷新。注意不要这样传入不稳定的变量引用 params={ { xxx: 111 } }，造成多次请求
  value?: any; // 外部传入的值
  optionLabelName?: string; // select option label name
  optionKey?: string; // select option key name
  editSaveValue?: any; // 编辑的时候带入的值
  groupKey?: string; // 有分组时OptGroup的key
  groupValueName?: string; // 有分组时OptGroup的value
  selectAllValue?: number[] | string[] | { value: number; label: string }[]; // 多选选择全部时传的值
  searchName?: string; // 搜索的字段名
  fetchResultAddOption?: any; // 请求结果添加的选项
  selectAllSingleValue?: boolean; // 是否在多选选择全部时传特定值，否的话传所有选项
  getDataSource?: (dataSource?: any[]) => void; // 获得数据源
  filterRes?: (item: any) => any; // 过滤结果
}

function DebounceSelect<ValueType>({
  handleOptions,
  fetchOptions,
  debounceTimeout = 800,
  defaultOption,
  total = 0,
  fetchData,
  value,
  editSaveValue,
  optionLabelName = 'name',
  optionKey = 'id',
  groupKey,
  groupValueName,
  selectAllValue,
  onChange,
  searchName = 'keyword',
  fetchResultAddOption, // 请求结果添加的选项
  selectAllSingleValue = true,
  getDataSource,
  filterRes,
  ...props
}: DebounceSelectProps<ValueType>) {
  // const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>(defaultOption || []);
  const [optionTotal, setOptionTotal] = useState(total); // 规则组总数
  const [searchValue, setSearchValue] = useState<string>(); // 搜索值

  const fetchRef = useRef(0);

  const fetchInitList = useMemoizedFn(() => {
    fetchOptions({ offset: 0, limit: SEARCH_LIMIT, ...(fetchData || {}) }).then((res) => {
      if (fetchResultAddOption) {
        res.data.unshift(fetchResultAddOption);
      }
      if (filterRes) {
        res.data = res.data.filter(filterRes);
      }
      setOptions(res.data);
      handleOptions && handleOptions(res.data);
      setOptionTotal(res.total);
    });
  });
  useEffect(() => {
    // 如果没有传初始化的数据，组件请求一下接口
    if (!defaultOption) {
      fetchInitList();
    } else {
      setOptions(defaultOption || []);
      setOptionTotal(total || 0);
    }
  }, [defaultOption, total, fetchInitList]);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      // 数据小于200前端搜索
      if (optionTotal < SEARCH_LIMIT) return;
      if (!value?.trim()) return;
      if (value?.trim()?.length < 2) {
        message.error('搜索关键字不能少于1个字符');
        return;
      }
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      // setFetching(true);
      fetchOptions({ [searchName]: value, offset: 0, limit: SEARCH_LIMIT, ...(fetchData || {}) }).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        setOptions(newOptions.data);
        // setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [debounceTimeout, optionTotal, fetchOptions, searchName, fetchData]);

  const childrenOptions = useMemo(() => {
    const optionFromItem = (item) => (
      <MulSelect.Option key={item[optionKey]} value={item[optionKey]}>
        {item[optionLabelName]}
      </MulSelect.Option>
    );
    // 有分组的情况
    if (groupKey && groupValueName) {
      const groupOptions = options as any;
      return groupOptions.map((group) => {
        return (
          <AntdSelect.OptGroup key={group[groupKey]} label={group[groupKey]}>
            {group[groupValueName].map(optionFromItem)}
          </AntdSelect.OptGroup>
        );
      });
    }
    // 无分组直接返回Options
    return options?.map(optionFromItem);
  }, [groupKey, groupValueName, optionKey, optionLabelName, options]);

  const handleChange = useMemoizedFn((_value, option) => {
    const isMultiple = props.mode === 'multiple';
    const isSelectAll = isMultiple && _value?.length === options.length && !searchValue && selectAllSingleValue;
    const emptyValue = !_value?.length;
    if (!isMultiple || (!isSelectAll && !emptyValue)) {
      onChange?.(_value, option);
      return;
    }
    // 多选选择全部传特定值
    if (isSelectAll) {
      onChange?.(selectAllValue, option);
      return;
    }
    // 不选统一传undefined
    if (emptyValue) {
      onChange?.(undefined, option);
      return;
    }
  });

  useEffect(() => {
    getDataSource?.(options);
    return () => {
      getDataSource?.([]);
    };
  }, [getDataSource, options]);

  return (
    <MulSelect
      filterOption={
        optionTotal < SEARCH_LIMIT
          ? (input, option) => {
              return (option?.children?.toString()?.indexOf?.(input) ?? -1) > -1;
            }
          : false
      }
      value={
        props.mode === 'multiple' && value?.length && isEqual(value[0], selectAllValue?.[0])
          ? options.map((item) => item[optionKey])
          : value
      }
      onChange={handleChange}
      onSearch={(_value) => {
        setSearchValue(_value);
        if (!_value && !defaultOption) {
          fetchInitList();
        }
        debounceFetcher(_value);
      }}
      searchValue={searchValue}
      // 请求数据的loading暂时先隐藏
      // notFoundContent={fetching ? <Spin size="small" /> : noData ? <span>暂无数据</span> : null}
      {...props}
    >
      {childrenOptions}
    </MulSelect>
  );
}

export default DebounceSelect;
