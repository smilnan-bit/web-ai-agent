import React from 'react';
import type { CSSProperties, FunctionComponent, SVGAttributes } from 'react';

interface Props extends Omit<SVGAttributes<SVGElement>, 'color'> {
  size?: number | string;
  color?: string | string[];
  title?: string | string[];
}

const getIconColor = (color: string | string[] | undefined, index: number, defaultColor: string) => {
  return color ? (typeof color === 'string' ? color : color[index] || defaultColor) : defaultColor;
};

const DEFAULT_STYLE: CSSProperties = {};

const defaultSize = '1em';
export const IconChuangjianfenzu: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M18 12.5a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3h-3a1 1 0 1 1 0-2h3v-3a1 1 0 0 1 1-1Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
      <path
        d="M20 2a2 2 0 0 1 2 2v7a1 1 0 1 1-2 0V4H4v16h8a1 1 0 1 1 0 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16Z"
        fill={getIconColor(color, 1, 'currentColor')}
      />
    </svg>
  );
};

export const IconFangda: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M21.924 21.383a.996.996 0 0 1-.21.318c-.005.004-.01.008-.013.013a.997.997 0 0 1-.698.286H14a1 1 0 1 1 0-2h4.586l-5.293-5.293a1 1 0 0 1 1.414-1.414L20 18.586V14a1 1 0 1 1 2 0v7.003a.996.996 0 0 1-.076.38ZM2.286 2.3A.996.996 0 0 0 2 2.996V10a1 1 0 1 0 2 0V5.414l5.293 5.293a1 1 0 0 0 1.414-1.414L5.414 4H10a1 1 0 1 0 0-2H2.997a.997.997 0 0 0-.697.286l-.014.013Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
    </svg>
  );
};

export const IconSuoxiao: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M10.924 10.383a.996.996 0 0 1-.921.617H3a1 1 0 1 1 0-2h4.586L2.293 3.707a1 1 0 0 1 1.414-1.414L9 7.586V3a1 1 0 0 1 2 0v7.003a.996.996 0 0 1-.076.38Zm2.152 3.234a.996.996 0 0 1 .921-.617H21a1 1 0 1 1 0 2h-4.586l5.293 5.293a1 1 0 0 1-1.414 1.414L15 16.414V21a1 1 0 1 1-2 0v-7.003c0-.134.027-.263.076-.38Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
    </svg>
  );
};

export const IconFuzhi3: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M7 7V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3Zm0 2H4v11h11v-3H9a2 2 0 0 1-2-2V9Zm2-5v11h11V4H9Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
    </svg>
  );
};

export const IconShanchu: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M16 1a1 1 0 1 1 0 2H8a1 1 0 0 1 0-2h8Zm6 3.5a1 1 0 1 1 0 2h-1.5v13a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-13H2a1 1 0 0 1 0-2h20Zm-3.5 2h-13v13a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-13ZM11 17a1 1 0 1 1-2 0v-7a1 1 0 1 1 2 0v7Zm4 0a1 1 0 1 1-2 0v-7a1 1 0 1 1 2 0v7Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
    </svg>
  );
};

export const IconWenjian: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 14 14" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M1.546 1.738C1.546 1.054 2.1.5 2.784.5h5.678c.328 0 .643.13.875.363l2.99 2.989c.231.232.362.547.362.875v7.535c0 .684-.555 1.238-1.238 1.238H2.784a1.238 1.238 0 0 1-1.238-1.238V1.738Zm1.238 0v10.524h8.667v-6.81H8.974a1.238 1.238 0 0 1-1.238-1.238V1.738H2.784Zm6.19.513v1.963h1.964L8.974 2.251Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};
