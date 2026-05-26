import { useLocation } from '@ysf/ys-router';
import queryString from 'query-string';
import { isArray, isEmpty, isNil, isPlainObject, transform } from 'lodash';

import { ArrayItemName, ToolParamsTypeEnum } from '@/constants';
/** query参数查询 */
export function useQueryLocationSearch(): Record<string, any> {
  const { search } = useLocation();
  return queryString.parse(search);
}

/** state参数查询 */
export function useQueryLocationState(): Record<string, any> {
  const { state } = useLocation();
  return state || {};
}

/**
 * 文本转json
 * @param {string} text
 * @return {object}
 */
export const text2object = (text) => {
  try {
    return JSON.parse(text);
  } catch (ex) {
    return null;
  }
};

// 数组元素作为索引从对象中取值
export const getObjValueFromArr = (obj, keyArr) => {
  return keyArr.reduce((acc, cur) => acc?.[cur], obj);
};

export const flattenSubParams = (params) => {
  const allParams = [...(params || [])];
  const flattenParams = (initParams) =>
    initParams?.forEach((param) => {
      if (param?.subParams) {
        allParams.push(...param.subParams);
        flattenParams(param.subParams);
      }
    });
  flattenParams(params);
  return allParams;
};
// 校验单个参数的名称是否重复
export const validateRepeatItem = (item, allParams) => {
  if (item.id === undefined && item.index === undefined) {
    return false;
  }
  const flattenParams = flattenSubParams(allParams);
  const sameParamItem = flattenParams.find((param, paramIndex) => {
    return (
      param?.name &&
      param?.name !== ArrayItemName &&
      param?.name === item?.name &&
      (item.id !== undefined ? item.id !== param.id : item.index !== paramIndex)
    );
  });
  if (flattenParams?.length > 1 && sameParamItem) {
    return true;
  }
  return false;
};

// 校验参数名是否重复
export const validateRepeatParamName = (params, callback) => {
  const flattenParams = flattenSubParams(params);
  if (flattenParams?.find((item, index) => validateRepeatItem({ ...item, index }, params))) {
    callback('变量名重复');
  }
  callback();
};

// 获得所有params的namePath
export const accAllParamsPath = (parentPath, parentValue) =>
  parentValue?.reduce((acc, cur, index) => {
    acc.push([...parentPath, index, 'name']);
    if (parentValue?.[index].subParams) {
      acc = acc.concat(accAllParamsPath([...parentPath, index, 'subParams'], parentValue[index].subParams));
    }
    return acc;
  }, []);

export const accAllExpandedKeys = (initData, fullNamepath, setExpandedRowKeys) =>
  initData?.forEach(({ type, subParams = [] }, index) => {
    if (type === ToolParamsTypeEnum.object) {
      setExpandedRowKeys((pre) => new Set(pre).add([...fullNamepath, index].join('.')));
      accAllExpandedKeys(subParams, [...fullNamepath, index, 'subParams'], setExpandedRowKeys);
    }
  });

// 将数字转换为小数点后几位  0=》1 1=》0.1
export function convertToDecimal(num: number): number {
  if (num === 0) return 1;
  return Math.pow(10, -num);
}
/**
 * 判断批量操作
 * @param  {Number}   selectedLength  [description] 勾选项长度
 * @param  {Number}   currentPage     [description] 勾选所在页
 * @param  {Number}   PAGE_SIZE       [description] 每页长度
 * @param  {Number}   totalNum        [description] 数据总量
 * @param  {Boolean}  selectAll       [description] 是否处于选中所有页状态
 */
export const getBatchResult = (selectedLength, currentPage, PAGE_SIZE, totalNum, selectAll) => {
  // 存在翻页
  const moreOnePage = totalNum > PAGE_SIZE;
  // 勾选当前页非最后一页
  const selectPageSize = selectedLength === PAGE_SIZE;
  // 勾选最后一页
  const selectLastPage = currentPage === Math.ceil(totalNum / PAGE_SIZE);
  const selectLastPageSize = selectedLength === totalNum - (currentPage - 1) * PAGE_SIZE;

  const flag1 = selectPageSize && moreOnePage;
  const flag2 = selectLastPage && selectLastPageSize && moreOnePage;
  let flag3 = selectAll;
  if (selectAll && !selectPageSize) {
    // 全部选中时后取消当前页某几项
    flag3 = false;
  }
  return {
    selectPageAll: flag1 || flag2, // 当前页全选
    selectAllFlag: flag3, // 所有页全选
  };
};

type Cleanable = object | any[];

type CleanedType<T extends Cleanable> = T extends any[] ? CleanedArray<T> : CleanedObject<T>;

type CleanedArray<T extends any[]> = Array<CleanedValue<T[number]>>;

type CleanedObject<T extends object> = {
  [K in keyof T as CleanedValue<T[K]> extends never ? never : K]: CleanedValue<T[K]>;
};

type CleanedValue<T> = T extends Cleanable ? CleanedType<T> : T extends null | undefined | '' ? never : T;

// 主函数
export function cleanObject<T extends Cleanable>(obj: T): CleanedType<T> {
  if (isArray(obj)) {
    // 使用类型断言确保 TypeScript 知道这是数组
    const arrayObj = obj as any[];
    const cleaned = arrayObj
      .map((item) => {
        const isRecursiveType = isPlainObject(item) || isArray(item);
        return isRecursiveType ? cleanObject(item as Cleanable) : item;
      })
      .filter((item) => {
        if (isNil(item) || item === '') return false;
        if (isPlainObject(item) || isArray(item)) {
          return !isEmpty(item);
        }
        return true;
      });
    return cleaned as CleanedType<T>;
  } else {
    // 对对象使用 lodash 的 transform
    return transform(
      obj,
      (result: any, value, key) => {
        const isRecursiveType = isPlainObject(value) || isArray(value);
        const cleanedValue = isRecursiveType ? cleanObject(value as Cleanable) : value;

        if (!(isNil(cleanedValue) || cleanedValue === '' || (isRecursiveType && isEmpty(cleanedValue)))) {
          result[key] = cleanedValue;
        }
      },
      {} as any,
    ) as CleanedType<T>;
  }
}
export const convertToObject = (params) => {
  const result = {};

  params.forEach((param) => {
    if (param.subParams && param.subParams.length > 0) {
      // 如果有子参数，递归处理
      result[param.name] = convertToObject(param.subParams);
    } else {
      // 否则直接取value值
      result[param.name] = param.value;
    }
    if (param.type === ToolParamsTypeEnum.array) {
      result[param.name] = param.value?.split(',');
    }
  });

  return result;
};
