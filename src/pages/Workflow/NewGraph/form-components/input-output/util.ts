import { ArrayItemName } from '@/constants';

const flattenSubParams = (params) => {
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
export const validateRepeatItemName = (item, allParams) => {
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
