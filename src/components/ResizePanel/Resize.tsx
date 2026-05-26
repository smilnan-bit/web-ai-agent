import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { Resizable } from 'react-resizable';
import { Storage } from '@ysf/helper';
import useResize from './hooks';
import type { MaxFunc } from './type';
import {
  debouncedHandleResize,
  getHeigthByPercent,
  getHeigthPercentage,
  getWidthByPercent,
  getWidthPercentage,
} from './utils';

import './index.less';

const { Local } = Storage;

interface IProps {
  horizontal: boolean;
  min: number;
  max: number | MaxFunc;
  value: number;
  resizeHandles: Array<string>;
  storeKey?: string;
  setSize?: (size: { width: number; height: number; transition: boolean }) => void;
}

const View: FC<IProps> = (props: IProps) => {
  const { horizontal, value, min, max, resizeHandles, storeKey } = props;

  const dynamicMax = typeof max !== 'number';
  const { first, ...data } = useResize(dynamicMax);
  let maxValue;
  if (dynamicMax) {
    maxValue = max(data);
  } else {
    maxValue = max;
  }
  let initValue;
  if (storeKey && Local.getItem(storeKey)) {
    initValue = JSON.parse(Local.getItem(storeKey));
    // 水平方向，修正最大值
    if (horizontal && maxValue < initValue.width) {
      initValue.width = maxValue;
    }
    // 垂直方向，修正最大值
    if (!horizontal && maxValue < initValue.height) {
      initValue.height = maxValue;
    }
  } else if (horizontal) {
    // 水平方向
    initValue = { width: value < maxValue ? value : maxValue, height: 0 };
  } else {
    // 垂直方向
    initValue = { height: value < maxValue ? value : maxValue, width: 0 };
  }
  const widthPercentageRef = useRef(getWidthPercentage(initValue.width));
  const heightPercentageRef = useRef(getHeigthPercentage(initValue.height));

  const [{ width, height, transition }, setSize] = useState(initValue);

  const onResize = useCallback(
    (event, { size }) => {
      widthPercentageRef.current = getWidthPercentage(size.width);
      heightPercentageRef.current = getHeigthPercentage(size.height);

      setSize({ ...size, transition: false });

      if (storeKey) {
        debouncedHandleResize(storeKey, JSON.stringify(size));
      }
    },
    [storeKey],
  );

  useEffect(() => {
    props.setSize?.({ width, height, transition });
  }, [width, height, transition, props]);

  useEffect(() => {
    setSize(() => {
      const ww = getWidthByPercent(widthPercentageRef.current);
      const hh = getHeigthByPercent(heightPercentageRef.current);

      const size = {
        width: ww < min ? min : ww > maxValue ? maxValue : ww,
        height: hh < min ? min : hh > maxValue ? maxValue : hh,
        transition: !first,
      };
      if (storeKey) {
        // 被动触发的resize，不用延迟存储
        Local.setItem(storeKey, JSON.stringify(size));
      }
      return size;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxValue, min, first]);

  return (
    <Resizable
      width={width}
      height={height}
      maxConstraints={horizontal ? [maxValue, 0] : [0, maxValue]}
      minConstraints={horizontal ? [min, 0] : [0, min]}
      onResize={onResize}
      resizeHandles={resizeHandles}
    >
      <div
        className="resize-bar"
        style={
          horizontal
            ? { width: `${width}px`, transition: transition ? 'width 0.5s' : 'none' }
            : { height: `${height}px`, transition: transition ? 'height 0.5s' : 'none' }
        }
      />
    </Resizable>
  );
};

export default View;
