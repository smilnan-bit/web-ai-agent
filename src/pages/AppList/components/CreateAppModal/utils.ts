import { TEMPLATE_KEY_LIST, TemplateKeyenum } from '@/pages/AppList/components/CreateAppModal/constanst';
import { isUndefined } from 'lodash';

export const checkArrayNotEmpty = (array) => {
  return Array.isArray(array) && array.length > 0;
};

export const formatInitTemplateValues = (initData, templateCategoryOptions) => {
  return TEMPLATE_KEY_LIST.reduce(
    (acc, key) => {
      if (!isUndefined(initData?.[key])) {
        acc[key] = initData?.[key];
      }
      if (key === TemplateKeyenum.templateCategoryId && isUndefined(initData?.[key])) {
        acc[key] = templateCategoryOptions?.[0]?.value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );
};
import { isNil, isEmpty } from 'lodash';

export function isTruthyIncludingZero(value) {
  // null 或 undefined
  if (isNil(value)) {
    return false;
  }

  // 数字 0 特殊处理
  if (value === 0) {
    return true;
  }

  // 空字符串
  if (value === '') {
    return false;
  }

  // false
  if (value === false) {
    return false;
  }

  // 空数组或空对象
  if (isEmpty(value)) {
    return false;
  }

  return true;
}

export function checkAllPermissionsTrue(permissions, permissionsKeyList) {
  if (!permissionsKeyList || permissionsKeyList?.length === 0) {
    return false;
  }
  // 查找第一个不为true的权限
  const falseIndex = permissionsKeyList?.findIndex((key) => permissions[key] !== true);

  // 如果找不到不为true的权限（即全部为true），则findIndex返回-1
  return falseIndex === -1;
}
