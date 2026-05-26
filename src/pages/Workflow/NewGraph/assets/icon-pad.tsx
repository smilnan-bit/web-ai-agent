/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

export function IconPad(props: { width?: number; height?: number }) {
  const { width, height } = props;
  return (
    <svg width={width || 48} height={height || 38} viewBox="0 0 48 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="1.83317"
        y="1.49998"
        width="44.3333"
        height="35"
        rx="3.5"
        stroke="currentColor"
        strokeOpacity="0.8"
        strokeWidth="2.33333"
      />
      <path
        d="M14.6665 30.6667H33.3332"
        stroke="currentColor"
        strokeOpacity="0.8"
        strokeWidth="2.33333"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const IconPadTool = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none">
    <path
      d="M1 3.333C1 2.597 1.597 2 2.333 2h11.334C14.403 2 15 2.597 15 3.333v9.334c0 .736-.597 1.333-1.333 1.333H2.333A1.333 1.333 0 0 1 1 12.667V3.333Zm12.667 9.334V3.333H2.333v9.334h11.334Z"
      fill="#000"
    ></path>
    <path stroke="#000" strokeLinecap="round" d="M5.334 10.667h5.333"></path>
  </svg>
);
