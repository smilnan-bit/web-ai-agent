// 引用变量树形选择
import React, { useCallback } from 'react';
import type { TreeSelectProps } from 'antd';
import { TreeSelect } from 'antd';
import type { ToolNS } from '@/types/Tools';
import { ToolParamsTypeEnum } from '@/constants';

const SelectParams: React.FC<TreeSelectProps & { data: ToolNS.ToolParamsType[]; selectType?: ToolParamsTypeEnum }> = ({
  data,
  selectType,
  ...treeProps
}) => {
  const paramDataToTreeData = useCallback(
    (params, parentValue = '') => {
      return params?.map(({ name, type, subParams }) => {
        const value = `${parentValue ? `${parentValue}.` : ''}${name}`; // 把上级名字也传服务端 一级.二级.三级
        return {
          title: name,
          value,
          disabled: selectType !== undefined && selectType !== type,
          children: subParams && type !== ToolParamsTypeEnum.array ? paramDataToTreeData(subParams, value) : [],
        };
      });
    },
    [selectType],
  );

  return (
    <TreeSelect
      allowClear
      showSearch
      treeData={paramDataToTreeData(data)}
      virtual={false}
      popupClassName="QuoteParamSelect"
      dropdownMatchSelectWidth={200}
      {...treeProps}
    />
  );
};

export default SelectParams;
