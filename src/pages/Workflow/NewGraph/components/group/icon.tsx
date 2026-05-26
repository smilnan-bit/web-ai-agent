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

export const IconDuidie: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M20 2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16ZM10 20h10V10H10v10Zm-6 0h4V10a2 2 0 0 1 2-2h10V4H4v16Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
    </svg>
  );
};

export const IconPingpu: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M20 12.691a2 2 0 0 1 2 2V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.309a2 2 0 0 1 2-2h16ZM4 20h16v-5.309H4V20ZM20 2a2 2 0 0 1 2 2v5.287a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16ZM4 9.287h16V4H4v5.287Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
    </svg>
  );
};

export const IconQuxiaofenzu: FunctionComponent<Props> = ({
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
        d="M20 5.5a2 2 0 0 1 2 2V11a1 1 0 1 1-2 0V7.5H7.5V20H12a1 1 0 1 1 0 2H7.5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2H20Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
      <path
        d="M20.121 13.965a1 1 0 1 1 1.414 1.414l-2.12 2.121 2.12 2.121a1 1 0 1 1-1.414 1.414L18 18.915l-2.121 2.12a1 1 0 1 1-1.414-1.414l2.12-2.121-2.12-2.121a1 1 0 1 1 1.414-1.414L18 16.085l2.121-2.12ZM18 2a1 1 0 1 1 0 2H4v14a1 1 0 1 1-2 0V4a2 2 0 0 1 2-2h14Z"
        fill={getIconColor(color, 1, 'currentColor')}
      />
    </svg>
  );
};
