import React from 'react';
import type { CSSProperties, FunctionComponent, SVGAttributes } from 'react';

interface Props extends Omit<SVGAttributes<SVGElement>, 'color'> {
  size?: number | string;
  color?: string | string[];
  title?: string | string[];
}

const getColor = (color: string | string[] | undefined, index: number, def: string) =>
  color ? (typeof color === 'string' ? color : color[index] || def) : def;

const DEFAULT_STYLE: CSSProperties = {};
const SZ = '1em';

// ── 开始节点：蓝底白三角 ───────────────────────────────────────────────────
export const IconScheduleStart: FunctionComponent<Props> = ({ size = SZ, color, style: _s, title, ...rest }) => (
  <svg
    viewBox="0 0 18 18"
    width={size}
    height={size}
    style={_s ? { ...DEFAULT_STYLE, ..._s } : DEFAULT_STYLE}
    {...rest}
  >
    {title && <title>{title}</title>}
    <rect width="18" height="18" rx="3.75" fill={getColor(color, 0, '#337EFF')} />
    <path
      d="M13.05 8.22a.9.9 0 0 1 0 1.56l-5.4 3.117a.9.9 0 0 1-1.35-.78V5.883a.9.9 0 0 1 1.35-.78l5.4 3.118ZM7.38 6.195v5.61L12.24 9 7.38 6.195Z"
      fill={getColor(color, 1, '#fff')}
    />
  </svg>
);

// ── 意图识别节点：蓝底白分叉箭头 ─────────────────────────────────────────
export const IconScheduleIntent: FunctionComponent<Props> = ({ size = SZ, color, style: _s, title, ...rest }) => (
  <svg
    viewBox="0 0 18 18"
    width={size}
    height={size}
    style={_s ? { ...DEFAULT_STYLE, ..._s } : DEFAULT_STYLE}
    {...rest}
  >
    {title && <title>{title}</title>}
    <rect width="18" height="18" rx="3.75" fill={getColor(color, 0, '#337EFF')} />
    <path
      d="M4.5 6.75h1.5L9 9.75l3-3h1.5v1.5H12l-2.25 2.25V12H8.25v-1.5L6 8.25H4.5V6.75ZM8.25 6h1.5V4.5H8.25V6Zm0 7.5h1.5V12H8.25v1.5Z"
      fill={getColor(color, 1, '#fff')}
    />
  </svg>
);

// ── Agent 节点：蓝底白机器人 ────────────────────────────────────────────
export const IconScheduleAgent: FunctionComponent<Props> = ({ size = SZ, color, style: _s, title, ...rest }) => (
  <svg
    viewBox="0 0 18 18"
    width={size}
    height={size}
    style={_s ? { ...DEFAULT_STYLE, ..._s } : DEFAULT_STYLE}
    {...rest}
  >
    {title && <title>{title}</title>}
    <rect width="18" height="18" rx="3.75" fill={getColor(color, 0, '#337EFF')} />
    <path
      d="M9 3.75a1.5 1.5 0 0 1 1.061 2.56A3.75 3.75 0 0 1 12.75 10v.75h.75v1.5h-.75V13.5h-7.5v-1.25H4.5v-1.5h.75V10A3.75 3.75 0 0 1 7.94 6.31 1.5 1.5 0 0 1 9 3.75Zm0 3.75a2.25 2.25 0 0 0-2.25 2.25v2.25h4.5V9.75A2.25 2.25 0 0 0 9 7.5Zm-1.125 2.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm2.25 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
      fill={getColor(color, 1, '#fff')}
    />
  </svg>
);

// ── NLP 节点：紫底白气泡 ──────────────────────────────────────────────
export const IconScheduleNLP: FunctionComponent<Props> = ({ size = SZ, color, style: _s, title, ...rest }) => (
  <svg
    viewBox="0 0 18 18"
    width={size}
    height={size}
    style={_s ? { ...DEFAULT_STYLE, ..._s } : DEFAULT_STYLE}
    {...rest}
  >
    {title && <title>{title}</title>}
    <rect width="18" height="18" rx="3.75" fill={getColor(color, 0, '#764AF5')} />
    <path
      d="M4.5 4.5h9a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75H7.5L5.4 13.8a.375.375 0 0 1-.652-.25V12h-.748a.75.75 0 0 1-.75-.75v-6A.75.75 0 0 1 4.5 4.5Zm.75 1.5v4.5h.75v1.19l1.19-.94H13.5V6H5.25Zm1.5 1.5h4.5v1.5h-4.5V7.5Zm0 2.25h3v1.5h-3V9.75Z"
      fill={getColor(color, 1, '#fff')}
    />
  </svg>
);

// ── 结束节点：红底白停止框 ────────────────────────────────────────────
export const IconScheduleEnd: FunctionComponent<Props> = ({ size = SZ, color, style: _s, title, ...rest }) => (
  <svg
    viewBox="0 0 18 18"
    width={size}
    height={size}
    style={_s ? { ...DEFAULT_STYLE, ..._s } : DEFAULT_STYLE}
    {...rest}
  >
    {title && <title>{title}</title>}
    <rect width="18" height="18" rx="3.75" fill={getColor(color, 0, '#F25555')} />
    <path
      d="M11.813 12.15v1.35H6.186v-1.35h5.625Zm.337-.338V6.189a.338.338 0 0 0-.338-.338H6.189a.338.338 0 0 0-.338.338v5.625c0 .186.151.337.338.337v1.35A1.687 1.687 0 0 1 4.5 11.812V6.189c0-.932.756-1.688 1.688-1.688h5.625c.931 0 1.687.756 1.687 1.688v5.625c0 .931-.755 1.687-1.688 1.687v-1.35a.338.338 0 0 0 .338-.338Z"
      fill={getColor(color, 1, '#fff')}
    />
  </svg>
);
