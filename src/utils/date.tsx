import { DateUtil } from '@ysf/helper';
import _ from 'lodash';

export const formatDate = (time) => {
  return DateUtil.timestamp2fixedDate(time, 'MM-dd HH:mm:ss', true);
};

/**
 * 不满两位的整数，左侧补一个零
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
export const paddingZero = (value) => {
  return _.padStart(value, 2, '0');
};

/**
 * 时间戳转为日期的格式
 * @param value
 * @param format  可选 默认 'yyyy-MM-dd HH:mm'
 * @returns {*}
 */
export const timestamp2date = (value, format = 'yyyy-MM-dd HH:mm') => {
  if (!value) return '--';

  const maps = {
    yyyy(date) {
      return date.getFullYear();
    },
    MM(date) {
      return paddingZero(date.getMonth() + 1);
    },
    dd(date) {
      return paddingZero(date.getDate());
    },
    HH(date) {
      return paddingZero(date.getHours());
    },
    mm(date) {
      return paddingZero(date.getMinutes());
    },
    ss(date) {
      return paddingZero(date.getSeconds());
    },
  };

  const trunk = new RegExp(Object.keys(maps).join('|'), 'g');

  value = new Date(value || +new Date());

  return format.replace(trunk, (capture) => {
    return maps[capture] ? maps[capture](value) : '';
  });
};

// 毫秒数转换为 X天X小时X分X秒
export function formatDuration(ms) {
  const timeUnits = [
    { unit: '天', ms: 60000 * 60 * 24 },
    { unit: '小时', ms: 60000 * 60 },
    { unit: '分', ms: 60000 },
    { unit: '秒', ms: 1000 },
  ];

  let remaining = ms;
  const parts = [];

  for (const { unit, ms: unitMs } of timeUnits) {
    const value = Math.floor(remaining / unitMs);
    remaining %= unitMs;
    if (value > 0) {
      parts.push(`${value}${unit}`);
    }
  }

  // 处理毫秒数不足1秒的情况
  if (parts.length === 0) {
    return ms >= 1 ? `0.${Math.round(ms)}秒` : '0秒';
  }

  return parts.join('');
}
