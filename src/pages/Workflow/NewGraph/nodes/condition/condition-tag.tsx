import { Tag, Tooltip } from '@douyinfe/semi-ui';
import type { PropsWithChildren, FC, ReactNode } from 'react';

import React from 'react';
import { TAG_BACKGROUND_COLOR, TAG_COLOR, TAG_WARNING_BACKGROUND_COLOR, TAG_WARNING_COLOR } from '../../constants';

export const ConditionTag: FC<
  PropsWithChildren<{
    tooltip?: ReactNode;
    invalid?: boolean;
  }>
> = (props) => {
  const color = props.invalid
    ? { color: TAG_WARNING_COLOR, backgroundColor: TAG_WARNING_BACKGROUND_COLOR }
    : { backgroundColor: TAG_BACKGROUND_COLOR, color: TAG_COLOR };
  if (props.tooltip && !props.invalid) {
    return (
      <Tooltip
        content={props.tooltip}
        style={{
          backgroundColor: '#fff',
          color: '#000',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Tag style={color} tw="font-medium truncate w-full">
          {props.children}
        </Tag>
      </Tooltip>
    );
  } else {
    return (
      <Tag style={color} tw="font-medium truncate w-full">
        {props.children}
      </Tag>
    );
  }
};
