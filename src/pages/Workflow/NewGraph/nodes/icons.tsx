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

export const IconKaishi: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 18 18" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="18" height="18" rx="3.75" fill={getIconColor(color, 0, '#337EFF')} />
      <path
        d="M13.05 8.22a.9.9 0 0 1 0 1.56l-5.4 3.117a.9.9 0 0 1-1.35-.78V5.883a.9.9 0 0 1 1.35-.78l5.4 3.118ZM7.38 6.195v5.61L12.24 9 7.38 6.195Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};

export const IconJieshu: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 18 18" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="18" height="18" rx="3.75" fill={getIconColor(color, 0, '#F25555')} />
      <path
        d="M11.813 12.15v1.35H6.186v-1.35h5.625Zm.337-.338V6.189a.338.338 0 0 0-.338-.338H6.189a.338.338 0 0 0-.338.338v5.625c0 .186.151.337.338.337v1.35A1.687 1.687 0 0 1 4.5 11.812V6.189c0-.932.756-1.688 1.688-1.688h5.625c.931 0 1.687.756 1.687 1.688v5.625c0 .931-.755 1.687-1.688 1.687v-1.35a.338.338 0 0 0 .338-.338Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};

export const IconTiaojianpanduan: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" rx="3.333" fill={getIconColor(color, 0, '#00BCEB')} />
      <g>
        <path
          d="M10.75 10.696v-.862l2.291 1.375-2.291 1.375v-.959a4.124 4.124 0 0 1-3.208-2.458l-.001-.003-.001.003a4.125 4.125 0 0 1-3.792 2.5.332.332 0 0 1-.332-.333v-.252c0-.183.149-.332.332-.332a3.208 3.208 0 0 0 2.95-1.945l.345-.804-.346-.806A3.209 3.209 0 0 0 3.748 5.25a.332.332 0 0 1-.332-.332v-.252c0-.184.149-.332.332-.332a4.125 4.125 0 0 1 3.792 2.5l.001.002.001-.003a4.125 4.125 0 0 1 3.208-2.458v-.959l2.291 1.375-2.291 1.375v-.862a3.208 3.208 0 0 0-2.365 1.89L8.039 8l.346.805a3.208 3.208 0 0 0 2.365 1.891Z"
          fill={getIconColor(color, 1, '#fff')}
        />
      </g>
      <defs />
    </svg>
  );
};

export const IconHuifu: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" rx="3.333" fill={getIconColor(color, 0, '#7D7DFA')} />
      <path fill={getIconColor(color, 1, '#7D7DFA')} d="M2.4 2.4h11.2v11.2H2.4z" />
      <path
        d="M8 3.333c2.835 0 5.134 1.985 5.134 4.434 0 2.448-2.299 4.433-5.134 4.433a5.88 5.88 0 0 1-1.585-.216l-2.305.807a.233.233 0 0 1-.31-.22v-2.255c-.588-.72-.933-1.6-.933-2.55 0-2.448 2.298-4.433 5.133-4.433Zm0 .934c-2.453 0-4.2 1.69-4.2 3.5 0 .714.259 1.39.723 1.96l.21.257v1.601l1.652-.578.282.079c.417.117.865.18 1.333.18 2.453 0 4.2-1.69 4.2-3.5 0-1.809-1.747-3.5-4.2-3.5Zm-2.333 2.8a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4Zm2.333 0a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4Zm2.334 0a.7.7 0 1 1-.001 1.4.7.7 0 0 1 .001-1.4Z"
        fill={getIconColor(color, 2, '#fff')}
      />
    </svg>
  );
};

export const IconDuihua: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" rx="3.333" fill={getIconColor(color, 0, '#F5993D')} />
      <path
        d="m5.179 9.867-1.702 1.336a.233.233 0 0 1-.377-.183V4.033a.467.467 0 0 1 .466-.466h7a.467.467 0 0 1 .467.466v5.834H5.179Zm-.323-.934H10.1V4.5H4.033v5.08l.823-.647Zm1.51 1.634h4.777l.823.646v-5.08h.467a.467.467 0 0 1 .467.467v6.053a.233.233 0 0 1-.378.183L10.821 11.5H6.833a.467.467 0 0 1-.467-.467v-.466Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};

export const IconDamoxing: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" rx="3.333" fill={getIconColor(color, 0, '#9F80FF')} />
      <g>
        <path
          d="m8.227 2.925 4.2 2.334c.148.082.24.238.24.408v4.666c0 .17-.092.326-.24.408l-4.2 2.334a.467.467 0 0 1-.453 0l-4.2-2.334a.467.467 0 0 1-.24-.408V5.667c0-.17.092-.326.24-.408l4.2-2.334a.467.467 0 0 1 .453 0ZM4.762 5.667 8 7.467l3.239-1.8L8 3.867l-3.238 1.8Zm3.705 2.608v3.599l3.267-1.815v-3.6L8.467 8.276Zm-.933 0L4.267 6.46v3.599l3.267 1.815v-3.6Z"
          fill={getIconColor(color, 1, '#fff')}
        />
      </g>
      <defs />
    </svg>
  );
};

export const IconDaima: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" rx="3.333" fill={getIconColor(color, 0, '#1FC2D1')} />
      <path
        d="M6.004 11.077a.514.514 0 0 1-.894.509L3.167 8.17a.514.514 0 0 1 0-.51l1.945-3.383a.514.514 0 0 1 .891.512L4.207 7.917l1.797 3.16Zm3.99 0 1.799-3.159L9.996 4.79a.514.514 0 0 1 .892-.513L12.83 7.66a.514.514 0 0 1 .001.511l-1.943 3.415a.514.514 0 0 1-.894-.51ZM8.63 4.402a.514.514 0 1 1 .98.316l-2.2 6.826a.515.515 0 1 1-.979-.314L8.63 4.4v.002Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};

export const IconGongju: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" rx="3.333" fill={getIconColor(color, 0, '#50BF88')} />
      <g>
        <path
          d="M6.6 9.4v2.333a1.4 1.4 0 1 1-2.8 0V9.4c0-.61.39-1.128.933-1.32V5.2h-.2a.233.233 0 0 1-.232-.264l.25-1.867a.233.233 0 0 1 .23-.202h.837a.233.233 0 0 1 .23.202l.25 1.867a.233.233 0 0 1-.231.264h-.2v2.88A1.4 1.4 0 0 1 6.6 9.4Zm-1.4-.56a.56.56 0 0 0-.56.56v2.333a.56.56 0 0 0 1.12 0V9.4a.56.56 0 0 0-.56-.56Zm4.433-5.651v1.35a.467.467 0 1 0 .934 0V3.19c0-.145.132-.256.271-.215a2.565 2.565 0 0 1 .662 4.61v4.15a1.4 1.4 0 1 1-2.8 0v-4.15a2.564 2.564 0 0 1-.66-3.683 2.557 2.557 0 0 1 1.321-.926c.14-.042.272.068.272.214ZM9.16 6.88l.38.249v4.603a.56.56 0 0 0 1.12 0V7.13l.382-.249a1.725 1.725 0 0 0 .365-2.577v.235a1.307 1.307 0 0 1-2.613 0v-.234a1.725 1.725 0 0 0 .365 2.577Z"
          fill={getIconColor(color, 1, '#fff')}
        />
      </g>
      <defs />
    </svg>
  );
};

export const IconZhishiku: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" rx="3.333" fill={getIconColor(color, 0, '#4BB1FA')} />
      <path
        d="M11.266 10.333h.467V5.2H9.866a1.4 1.4 0 0 0-1.4 1.4v4.27c.994-.413 1.909-.537 2.8-.537ZM8 12.045a.519.519 0 0 1-.283-.058c-1.08-.564-2.032-.72-2.984-.72H3.8a.466.466 0 0 1-.467-.467V4.733a.467.467 0 0 1 .467-.466h2.333A2.329 2.329 0 0 1 8 5.2a2.33 2.33 0 0 1 1.866-.933H12.2a.467.467 0 0 1 .466.466V10.8a.467.467 0 0 1-.466.467h-.934c-.952 0-1.905.155-2.984.72a.514.514 0 0 1-.282.058Zm-.467-1.175V6.6a1.4 1.4 0 0 0-1.4-1.4H4.266v5.133h.467c.892 0 1.806.124 2.8.537Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};

export const IconGengduo: FunctionComponent<Props> = ({
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
        d="M11.76 8.26a1.26 1.26 0 1 0 0-2.52 1.26 1.26 0 0 0 0 2.52ZM3.5 7A1.26 1.26 0 1 1 .98 7 1.26 1.26 0 0 1 3.5 7Zm4.76 0a1.26 1.26 0 1 1-2.52 0 1.26 1.26 0 0 1 2.52 0Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity=".85"
      />
    </svg>
  );
};

export const IconJiantouXia: FunctionComponent<Props> = ({
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
        d="M7.6 9.707c-.266.39-.934.39-1.2 0L3.093 4.878c-.267-.39.067-.878.6-.878h6.611c.534 0 .868.488.601.878L7.6 9.708Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity=".85"
      />
    </svg>
  );
};

export const IconWenbenchuli: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" rx="3.333" fill={getIconColor(color, 0, '#EDBE00')} />
      <path
        d="M11.557 3.9a.544.544 0 0 1 0 1.089h-3.01v7.01a.546.546 0 0 1-1.09 0V4.99H4.446a.545.545 0 0 1 0-1.089h7.111Zm-3.635 8.537.08.007a.449.449 0 0 1-.086-.009l.006.002Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};
export const IconJuhebianliang: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 20 20" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="20" height="20" rx="4.167" fill={getIconColor(color, 0, '#E573E5')} />
      <path
        d="M14.376 11.75a2.042 2.042 0 1 1-1.845 2.917H7.47a2.042 2.042 0 1 1-1.597-2.902l2.524-4.291a2.042 2.042 0 1 1 3.205 0l2.524 4.291a2.06 2.06 0 0 1 .249-.015ZM10 5.333a.875.875 0 1 0 0 1.75.875.875 0 0 0 0-1.75Zm.644 2.813a2.04 2.04 0 0 1-1.289 0L6.95 12.238c.369.315.625.759.697 1.262h4.708a2.04 2.04 0 0 1 .697-1.262l-2.407-4.092ZM6.5 13.792a.875.875 0 1 0-1.75 0 .875.875 0 0 0 1.75 0Zm7.875-.875a.875.875 0 1 0 0 1.75.875.875 0 0 0 0-1.75Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};

export const IconTuozhuai: FunctionComponent<Props> = ({
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
        d="M4.375 10.5a.875.875 0 1 1 0 1.75.875.875 0 0 1 0-1.75Zm0-8.75a.875.875 0 1 1 0 1.75.875.875 0 0 1 0-1.75Zm0 4.375a.875.875 0 1 1 0 1.75.875.875 0 0 1 0-1.75Zm5.25 4.375a.875.875 0 1 1 0 1.75.875.875 0 0 1 0-1.75Zm0-8.75a.875.875 0 1 1 0 1.75.875.875 0 0 1 0-1.75Zm0 4.375a.875.875 0 1 1 0 1.75.875.875 0 0 1 0-1.75Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
    </svg>
  );
};

export const IconXiajiantou: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 12 12" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M5.545 8.383a.643.643 0 0 0 .915-.006l3.852-3.852a.643.643 0 0 0-.91-.909L6 7.02 2.597 3.616a.643.643 0 0 0-.909.91l3.857 3.857Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
    </svg>
  );
};

export const IconJiantoukaozuo: FunctionComponent<Props> = ({
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
        d="M2.293 11.293a1 1 0 0 0 .008 1.422l5.992 5.992a1 1 0 0 0 1.414-1.414L4.414 12l5.293-5.293a1 1 0 0 0-1.414-1.414l-6 6Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconLiaotian2: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <g fill={getIconColor(color, 0, 'currentColor')}>
        <path
          d="M.667 8a7.333 7.333 0 1 1 14.666 0A7.333 7.333 0 0 1 .667 8ZM14 8A6 6 0 1 0 2 8a6 6 0 0 0 12 0Z"
          fill={getIconColor(color, 1, 'currentColor')}
        />
        <path
          d="M5.167 7.167a.833.833 0 1 0 0 1.666.833.833 0 0 0 0-1.667Zm2.833 0a.833.833 0 1 0 0 1.666.833.833 0 0 0 0-1.667Zm2.833 0a.833.833 0 1 0 0 1.666.833.833 0 0 0 0-1.667Z"
          fill={getIconColor(color, 2, 'currentColor')}
        />
      </g>
      <defs />
    </svg>
  );
};

export const IconSuccess: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <g>
        <path
          d="M.667 8a7.333 7.333 0 1 1 14.666 0A7.333 7.333 0 0 1 .667 8ZM14 8A6 6 0 1 0 2 8a6 6 0 0 0 12 0Zm-6.195 3.037a.6.6 0 0 1-.923.025L4.549 8.395a.6.6 0 0 1 .903-.79l1.857 2.122 3.22-4.098a.6.6 0 1 1 .943.742l-3.667 4.666Z"
          fill={getIconColor(color, 0, 'currentColor')}
        />
      </g>
      <defs />
    </svg>
  );
};

export const IconShanchu_2: FunctionComponent<Props> = ({
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
        d="M7 13.417A6.417 6.417 0 1 1 7 .584a6.417 6.417 0 0 1 0 12.833Z"
        fill={getIconColor(color, 0, '#FF4D4F')}
      />
      <path
        d="M6.34 7 4.337 4.997a.467.467 0 1 1 .66-.66L7 6.34l2.003-2.003a.467.467 0 0 1 .66.66L7.66 7l2.003 2.004a.467.467 0 0 1-.66.66L7 7.66 4.997 9.664a.467.467 0 1 1-.66-.66L6.34 7Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};

export const IconBianliangfuzhi: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" rx="3.333" fill={getIconColor(color, 0, '#80BF00')} />
      <path
        d="M7.985 4a.5.5 0 0 1 0 1H7.58a.919.919 0 0 0-.905.763l-.099.575h.59a.5.5 0 0 1 0 1h-.763l-.605 3.517a1.918 1.918 0 0 1-1.89 1.593H3.5a.5.5 0 1 1 0-1h.406c.448 0 .83-.322.906-.763l.576-3.347H4.96a.5.5 0 0 1 0-1h.599l.128-.744A1.92 1.92 0 0 1 7.579 4h.406Zm2.381 2.508a.5.5 0 0 1 .4.374l.183.741.501-.871a.5.5 0 0 1 .434-.251h.96a.5.5 0 0 1 0 1h-.671l-.878 1.525.34 1.376h.57a.5.5 0 0 1 0 1h-.963a.501.501 0 0 1-.485-.38l-.183-.74-.5.87a.5.5 0 0 1-.367.246l-.066.004H8.359a.5.5 0 0 1 0-1h.993l.875-1.525-.337-1.376H9a.5.5 0 0 1 0-1h1.281l.085.007Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};

export const IconQuanjubianliang: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" rx="3.333" fill={getIconColor(color, 0, '#99A7BF')} />
      <path
        d="M6.291 9c.345 0 .625.28.625.625v.625h5.459a.625.625 0 1 1 0 1.25H6.916v.625a.625.625 0 1 1-1.25 0V11.5H3.625a.625.625 0 1 1 0-1.25h2.041v-.625c0-.345.28-.625.625-.625Zm3-5c.345 0 .625.28.625.625v.625h2.459a.625.625 0 1 1 0 1.25H9.916v.625a.625.625 0 0 1-1.25 0V6.5H3.625a.625.625 0 1 1 0-1.25h5.041v-.625c0-.345.28-.625.625-.625Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};

export const IconPichuli: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 18 18" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="18" height="18" rx="3.75" fill={getIconColor(color, 0, '#FF8359')} />
      <path
        d="M12.094 12.094v1.031a1.03 1.03 0 0 1-1.031 1.031H4.875a1.03 1.03 0 0 1-1.031-1.031V6.937c0-.569.461-1.03 1.031-1.03h1.031V4.874c0-.57.462-1.031 1.032-1.031h6.187c.57 0 1.031.461 1.031 1.031v6.188c0 .57-.461 1.03-1.031 1.03h-1.031Zm1.031-7.219H6.937v1.031h4.125c.57 0 1.032.462 1.032 1.032v4.125h1.031V4.875Zm-2.063 8.25V6.937H4.875v6.188h6.188Zm-.719-4.984c.19.172.204.466.032.656l-2.579 2.835a.464.464 0 0 1-.671.017l-1.29-1.29a.464.464 0 0 1 .657-.656l.945.945 2.25-2.476a.464.464 0 0 1 .656-.031Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};

export const IconZiliucheng: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <rect width="16" height="16" rx="3.333" fill={getIconColor(color, 0, '#7B61FF')} />
      <path
        d="M11.333 3.333H4.667A1.333 1.333 0 0 0 3.333 4.667v6.666A1.333 1.333 0 0 0 4.667 12.667h6.666A1.333 1.333 0 0 0 12.667 11.333V4.667A1.333 1.333 0 0 0 11.333 3.333ZM6 9.333a.667.667 0 1 1 0-1.333.667.667 0 0 1 0 1.333Zm0-2.666a.667.667 0 1 1 0-1.334.667.667 0 0 1 0 1.334Zm4 2.666H7.333a.333.333 0 0 1 0-.666H10a.333.333 0 1 1 0 .666Zm0-2.666H7.333a.333.333 0 0 1 0-.667H10a.333.333 0 1 1 0 .667Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};
