import React, { useCallback, useMemo } from 'react';
import type { TreeProps } from 'antd';
import { Tag, Tooltip, Tree } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { ToolParamsTypeEnum, ToolParamsTypeShowEnum } from '@/constants';

const TreeDataShower: React.FC<
  Omit<TreeProps, 'treeData'> & {
    treeData: any[];
    titleKey?: string;
    valueKey?: string;
    typeKey?: string;
    subTypeKey?: string;
    childrenKey?: string;
  }
> = ({
  treeData,
  titleKey = 'name',
  valueKey = 'name',
  typeKey = 'type',
  subTypeKey = 'subType',
  childrenKey = 'subParams',
  style = {},
  ...treeProps
}) => {
  const handleData = useCallback(
    (initData) => {
      return initData?.map((item) => ({
        title: (
          <div>
            {item[titleKey]}
            <Tag style={{ marginLeft: 8 }}>
              {item[subTypeKey]
                ? `${ToolParamsTypeShowEnum[item[typeKey]]}<${ToolParamsTypeShowEnum[item[subTypeKey]]}>`
                : ToolParamsTypeShowEnum[item[typeKey]]}
            </Tag>
            {!!item.desc && (
              <Tooltip title={item.desc}>
                <ExclamationCircleOutlined style={{ color: 'var(--tip-color)' }} />
              </Tooltip>
            )}
          </div>
        ),
        key: item[valueKey],
        children: handleData(item[childrenKey]),
      }));
    },
    [childrenKey, titleKey, typeKey, valueKey],
  );

  const canExpand = useMemo(() => {
    return treeData.some((item) => item[typeKey] === ToolParamsTypeEnum.object);
  }, [treeData, typeKey]);

  return (
    <Tree
      selectable={false}
      // 不能展开则隐藏前面展开图标
      rootClassName={!canExpand ? 'm-custom-ant-tree' : ''}
      treeData={handleData(treeData)}
      style={{ background: '#f8f8f8', ...style }}
      defaultExpandAll
      {...treeProps}
    />
  );
};

export default TreeDataShower;
