import debounce from 'lodash/debounce';
import { Storage } from '@ysf/helper';

const { Local } = Storage;

// 处理窗口 resize 事件
export const debouncedHandleResize = debounce((key: string, val: string) => {
  Local.setItem(key, val);
}, 200);

// 获取宽度百分比，相对于body
export const getWidthPercentage = (ww: number) => {
  const total = document.body.clientWidth > 1280 ? document.body.clientWidth : 1280;
  return ww / total;
};

// 获取高度百分比，相对于body
export const getHeigthPercentage = (hh: number) => {
  const total = document.body.clientHeight > 580 ? document.body.clientHeight : 580;
  return hh / total;
};

// 宽度百分比转为宽度
export const getWidthByPercent = (pct: number) => {
  const total = document.body.clientWidth > 1280 ? document.body.clientWidth : 1280;
  return total * pct;
};

// 高度百分比转为高度
export const getHeigthByPercent = (pct: number) => {
  const total = document.body.clientHeight > 580 ? document.body.clientHeight : 580;
  return total * pct;
};
