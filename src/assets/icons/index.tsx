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

export const Shanchu: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M8 1h8a1 1 0 1 1 0 2H8a1 1 0 0 1 0-2Zm3 9v7a1 1 0 1 1-2 0v-7a1 1 0 1 1 2 0Zm3-1a1 1 0 0 1 1 1v7a1 1 0 1 1-2 0v-7a1 1 0 0 1 1-1Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
      <path
        d="M1 5.5a1 1 0 0 1 1-1h20a1 1 0 1 1 0 2h-1.5v13a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-13H2a1 1 0 0 1-1-1Zm4.5 1v13a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-13h-13Z"
        fill={getIconColor(color, 1, 'currentColor')}
      />
    </svg>
  );
};

export const Gengduo: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M20.16 14.16a2.16 2.16 0 1 0 0-4.32 2.16 2.16 0 0 0 0 4.32ZM6 12a2.16 2.16 0 1 1-4.32 0A2.16 2.16 0 0 1 6 12Zm8.16 0a2.16 2.16 0 1 1-4.32 0 2.16 2.16 0 0 1 4.32 0Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const Yingyong: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M3 2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3Zm0 11a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1H3Zm9.78-5.826a.954.954 0 0 1 0-1.348l4.046-4.047a.954.954 0 0 1 1.348 0l4.047 4.047a.954.954 0 0 1 0 1.348l-4.047 4.047a.954.954 0 0 1-1.348 0l-4.047-4.047ZM14 13a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-7Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const Renwu: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M2.112 19.998a10.013 10.013 0 0 1 6.174-7.786 6 6 0 1 1 7.428 0 10.013 10.013 0 0 1 6.174 7.786c.125.83 0 2.502-1.944 2.502H4.056c-1.944 0-2.069-1.672-1.944-2.502Zm2.504.502h14.768c.298 0 .533-.25.48-.544-.287-1.557-1.022-2.928-2.207-4.113C16.095 14.281 14.209 13.5 12 13.5c-2.21 0-4.095.781-5.657 2.343-1.185 1.185-1.92 2.556-2.206 4.113-.054.293.18.544.48.544m4.555-10.172A3.854 3.854 0 0 0 12 11.5c1.105 0 2.047-.39 2.828-1.172A3.854 3.854 0 0 0 16 7.5c0-1.105-.39-2.047-1.172-2.828A3.854 3.854 0 0 0 12 3.5c-1.105 0-2.047.39-2.828 1.172A3.854 3.854 0 0 0 8 7.5c0 1.105.39 2.047 1.172 2.828Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const Bianpai: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M4.8 0h14.4A4.8 4.8 0 0 1 24 4.8v14.4a4.8 4.8 0 0 1-4.8 4.8H4.8A4.8 4.8 0 0 1 0 19.2V4.8A4.8 4.8 0 0 1 4.8 0Zm.9 6.9v6.6a1.2 1.2 0 0 0 1.2 1.2h2.4v2.4a1.2 1.2 0 0 0 1.2 1.2h6.6a1.2 1.2 0 0 0 1.2-1.2v-6.6a1.2 1.2 0 0 0-1.2-1.2h-2.4V6.9a1.2 1.2 0 0 0-1.2-1.2H6.9a1.2 1.2 0 0 0-1.2 1.2Zm3.6 6H7.5V7.5h5.4v1.8h-2.4a1.2 1.2 0 0 0-1.2 1.2v2.4Zm5.4.6v-2.4h1.8v5.4h-5.4v-1.8h2.4a1.2 1.2 0 0 0 1.2-1.2Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const Yulan: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M4.8 0h14.4A4.8 4.8 0 0 1 24 4.8v14.4a4.8 4.8 0 0 1-4.8 4.8H4.8A4.8 4.8 0 0 1 0 19.2V4.8A4.8 4.8 0 0 1 4.8 0Zm11.69 12.736c.547-.327.547-1.145 0-1.472L9.73 7.215c-.547-.327-1.23.082-1.23.736v8.098c0 .654.683 1.063 1.23.736l6.76-4.049Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const Bianji: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M21.44 8.56 8.292 21.708a1 1 0 0 1-.707.293H2.5a.5.5 0 0 1-.5-.5v-5.086a1 1 0 0 1 .293-.707L15.439 2.561a1.5 1.5 0 0 1 2.122 0l3.878 3.878a1.5 1.5 0 0 1 0 2.122Zm-6.82-2.352 3.172 3.172 1.88-1.88L16.5 4.328l-1.879 1.88Zm-1.414 1.414L4 16.828V20h3.172l9.207-9.207-3.172-3.172ZM21.5 20a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H10.526a.2.2 0 0 1-.133-.35l1.573-1.397A1 1 0 0 1 12.63 20h8.87Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const Jiahao: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M13 11h8a1 1 0 1 1 0 2h-8v8a1 1 0 1 1-2 0v-8H3a1 1 0 1 1 0-2h8V3a1 1 0 1 1 2 0v8Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const Bofang: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11ZM3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm13.316.428-6.55 4.093c-.333.208-.766-.017-.766-.41V7.89c0-.393.433-.618.766-.41l6.55 4.093a.507.507 0 0 1 0 .856Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const Gongjuzu: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M6.414 2h11.172a1 1 0 0 1 .707.293l3.414 3.414a1 1 0 0 1 .293.707V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6.414a1 1 0 0 1 .293-.707l3.414-3.414A1 1 0 0 1 6.414 2ZM4.828 6h14.344l-2-2H6.828l-2 2Zm6.204 3c-.465 0-.906.1-1.322.3a.17.17 0 0 0-.047.276l1.242 1.166a.862.862 0 0 1 .266.635c0 .248-.089.46-.266.635a.877.877 0 0 1-.64.263.877.877 0 0 1-.642-.263L8.46 10.926a.17.17 0 0 0-.281.063c-.12.329-.18.67-.18 1.023 0 .832.296 1.542.889 2.13a2.932 2.932 0 0 0 2.143.882c.355 0 .698-.06 1.027-.178l2.811 2.791c.244.242.538.363.882.363s.638-.12.882-.363c.244-.242.366-.535.366-.877 0-.343-.122-.636-.366-.878l-2.782-2.761a2.96 2.96 0 0 0 .213-1.11c0-.831-.297-1.541-.889-2.13A2.932 2.932 0 0 0 11.032 9Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

// 小模型工具
export const IconXiaomoxinggongju: FunctionComponent<Props> = ({
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
        d="M15.184 2.128v2.63c0 .502.4.91.895.91a.902.902 0 0 0 .895-.91v-2.63c0-.284.254-.5.521-.418.385.118.75.282 1.09.486A5.013 5.013 0 0 1 21 6.5c0 1.755-.89 3.3-2.237 4.191v9.082c0 1.506-1.202 2.727-2.684 2.727-1.482 0-2.684-1.221-2.684-2.727V10.69a5.016 5.016 0 0 1-2.237-4.19c0-1.832.97-3.434 2.416-4.304a4.855 4.855 0 0 1 1.088-.486c.268-.081.522.134.522.418Zm-5.816 12.1v5.545c0 1.506-1.201 2.727-2.684 2.727C5.202 22.5 4 21.279 4 19.773v-5.546c0-1.187.747-2.197 1.79-2.572v-5.61h-.384a.452.452 0 0 1-.444-.514l.477-3.637a.45.45 0 0 1 .444-.394h1.603a.45.45 0 0 1 .443.394l.477 3.637a.452.452 0 0 1-.443.514h-.384v5.61a2.726 2.726 0 0 1 1.79 2.572Z"
        fill={getIconColor(color, 0, '#000')}
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
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="m12.51 1.131 7.867 4.34a.312.312 0 0 1 .001.546l-1.405.782a.528.528 0 0 1-.511 0L12 3.236 5.539 6.8a.528.528 0 0 1-.512-.001l-1.405-.782a.312.312 0 0 1 0-.546l7.868-4.34a1.056 1.056 0 0 1 1.02 0Zm5.79 8.162v6.35a.637.637 0 0 1-.324.556l-5.67 3.175a.626.626 0 0 1-.612 0l-5.67-3.175a.636.636 0 0 1-.324-.555v-6.35c0-.231.124-.444.324-.556l5.67-3.175a.626.626 0 0 1 .612 0l5.67 3.175c.2.112.324.325.324.555ZM12 7.786 9.046 9.44l2.97 1.768 2.953-1.76L12 7.786Zm8.4 2.11a.52.52 0 0 1 .269-.455l1.362-.758a.315.315 0 0 1 .469.273v8.725c0 .38-.207.728-.54.912l-7.917 4.367a.315.315 0 0 1-.468-.273V21.14a.52.52 0 0 1 .27-.456l6.555-3.616V9.896ZM10.155 20.684a.52.52 0 0 1 .27.456v1.547a.315.315 0 0 1-.468.273L2.04 18.593a1.041 1.041 0 0 1-.54-.912V8.956c0-.239.259-.39.469-.273l1.363.758a.52.52 0 0 1 .268.455v7.172l6.555 3.616Zm.81-4.112v-3.558L7.8 11.13v3.67l3.165 1.773Zm5.235-5.425-3.135 1.867v3.54L16.2 14.8v-3.652Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const IconFenzhi: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M6.5 5v2.092L10.408 11H13v-1a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-1h-2.592L6.5 16.908V19H13v-1.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V21H5.5a1 1 0 0 1-1-1v-3.092L.288 12.696a.985.985 0 0 1 0-1.392L4.5 7.092V4a1 1 0 0 1 1-1H13v-.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V5H6.5Zm8.5.5h5v-2h-5v2ZM8.623 12 5.5 8.877 2.377 12 5.5 15.123 8.623 12ZM15 13h5v-2h-5v2Zm5 5.5h-5v2h5v-2Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const IconHuifu: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M12 2c6.075 0 11 4.253 11 9.5S18.075 21 12 21c-1.185 0-2.326-.162-3.396-.461l-4.939 1.728A.5.5 0 0 1 3 21.795v-4.832c-1.26-1.545-2-3.43-2-5.463C1 6.253 5.925 2 12 2ZM4.55 15.7l.45.552v3.429l3.537-1.238.606.17c.894.25 1.854.387 2.857.387 5.256 0 9-3.623 9-7.5S17.256 4 12 4s-9 3.623-9 7.5c0 1.532.554 2.978 1.55 4.2Zm.95-4.2a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const IconBianliang: FunctionComponent<Props> = ({
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
        d="M19 3.5h-8v4a2 2 0 0 1-2 2H5v11h2a1 1 0 1 1 0 2H5a2 2 0 0 1-2-2V8.328a2 2 0 0 1 .586-1.414l4.828-4.828A2 2 0 0 1 9.828 1.5H19a2 2 0 0 1 2 2v7a1 1 0 1 1-2 0v-7Zm-13.172 4H9V4.328L5.828 7.5Zm11.415 9.136c-.251.296-.448.538-.59.723.238 1.168.465 2.01.683 2.525.325.771.864 1.49 2.086 1.192.14-.034.28-.072.443-.119-.207.396-1.234 1.484-2.711 1.54-1.495.055-2.165-.61-2.755-2.813-.604.8-1.223 1.59-1.856 2.37a1.505 1.505 0 0 1-2.106 0 1.452 1.452 0 0 1 0-2.077c.017-.016.037-.027.054-.043.237-.224.545-.366.875-.407.388-.06.804-.034 1.19.037 1.018.188 1.752-.572 1.46-1.548-.135-.463-.28-.923-.434-1.38-.395-1.17-1.301-1.726-2.72-1.669.477-.659 1.223-1.08 2.24-1.264 1.398-.254 2.572.24 3.328 2.618.37-.513.685-.973 1.027-1.415.23-.294.463-.636.748-.87.397-.319.72-.536 1.212-.536.874 0 1.583.7 1.583 1.56.002.86-.707 1.56-1.581 1.56a1.606 1.606 0 0 1-.677-.156c-.475-.222-1.019-.39-1.499.172Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const IconGongju: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M9 15v5a3 3 0 1 1-6 0v-5c0-1.306.835-2.418 2-2.83V6h-.429a.5.5 0 0 1-.496-.566l.534-4A.5.5 0 0 1 5.104 1h1.792a.5.5 0 0 1 .495.434l.534 4A.5.5 0 0 1 7.429 6H7v6.17c1.165.412 2 1.524 2 2.83Zm-3-1.2A1.2 1.2 0 0 0 4.8 15v5a1.2 1.2 0 0 0 2.4 0v-5A1.2 1.2 0 0 0 6 13.8Zm9.5-12.11v2.894a1 1 0 1 0 2 0V1.691c0-.312.284-.55.583-.46A5.497 5.497 0 0 1 22 6.5c0 1.93-.995 3.63-2.5 4.61V20a3 3 0 0 1-6 0v-8.89A5.495 5.495 0 0 1 11 6.5a5.497 5.497 0 0 1 3.917-5.269c.299-.09.583.148.583.46Zm-1.017 7.913.817.532V20a1.2 1.2 0 0 0 2.4 0v-9.865l.817-.532A3.695 3.695 0 0 0 20.2 6.5c0-.924-.34-1.77-.9-2.419v.503a2.8 2.8 0 0 1-5.6 0v-.503c-.56.65-.9 1.495-.9 2.419 0 1.297.666 2.44 1.683 3.103Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
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
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M19 17h1V6h-4a3 3 0 0 0-3 3v9.15c2.129-.885 4.089-1.15 6-1.15Zm-7 3.667a1.11 1.11 0 0 1-.605-.123C9.082 19.334 7.041 19 5 19H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5a4.99 4.99 0 0 1 4 2 4.992 4.992 0 0 1 4-2h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-2c-2.041 0-4.082.333-6.395 1.544a1.1 1.1 0 0 1-.605.123Zm-1-2.516V9a3 3 0 0 0-3-3H4v11h1c1.911 0 3.871.265 6 1.15Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const IconKaishi: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M7.023 21.699C5.71 22.509 4 21.587 4 20.069V3.931C4 2.413 5.71 1.49 7.023 2.3l13.059 8.07a1.906 1.906 0 0 1 0 3.259l-13.06 8.069ZM5.97 3.931v16.138L19.03 12 5.97 3.93Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const IconJieshu: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M20 2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16ZM4 4v16h16V4H4Zm5 4h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity="1"
      />
    </svg>
  );
};

// 相似词编辑
export const IconBianji: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="m18.863 10.926 2.305-2.305a2 2 0 0 0 0-2.828L18.375 3a2 2 0 0 0-2.828 0l-2.305 2.305 5.621 5.62ZM2.147 16.353a.5.5 0 0 0-.147.355V21.5a.5.5 0 0 0 .5.5h5.29a.5.5 0 0 0 .357-.15l9.722-9.93-5.62-5.622L2.146 16.353ZM12.63 20a1 1 0 0 0-.664.253l-1.573 1.398a.2.2 0 0 0 .133.349H21.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-8.87Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
    </svg>
  );
};

// 相似词删除
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
        d="M9 2h6a1 1 0 1 1 0 2H9a1 1 0 0 1 0-2ZM2 7a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2h-1.5v11a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3V8H3a1 1 0 0 1-1-1Zm8.3 4a.8.8 0 0 0-1.6 0v6a.8.8 0 0 0 1.6 0v-6Zm5 6v-6a.8.8 0 0 0-1.6 0v6a.8.8 0 1 0 1.6 0Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
    </svg>
  );
};

// 下载
export const IconXiazai: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M12 2a1 1 0 0 1 1 1v12.586l5.293-5.293a1 1 0 1 1 1.414 1.414l-6.999 6.999-.012.012a.997.997 0 0 1-1.396-.004l-.008-.008-7-6.999a1 1 0 1 1 1.415-1.414L11 15.586V3a1 1 0 0 1 1-1ZM5 20a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2H5Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
    </svg>
  );
};

export const IconYitu: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M10.762 5.996a1.745 1.745 0 1 1 .752 1.436L9.12 8.868a2.116 2.116 0 0 1 .025.646l3.35 1.675a1.745 1.745 0 1 1-.643 1.288L8.5 10.801a2.105 2.105 0 1 1-.123-3.167l2.396-1.437a1.765 1.765 0 0 1-.011-.2Z"
        fill={getIconColor(color, 0, '#000')}
      />
      <path
        d="M21.933 9.715c.901 1.342 1.906 2.838 1.967 2.96.125.25.15.616-.8 1-.256.104-.496.195-.714.279-.782.299-1.286.492-1.286.746v3.35c0 1.2-1.125 2.325-2.3 2.325h-1.95c-.525 0-.75.225-.75.625v2.275c0 .4-.1.725-.6.725h-10c-.702 0-.7-.445-.7-.814v-3.761c0-1.35-.625-2.9-2-4.425S.4 9.675 1.6 6.475 6.2 0 11.1 0c5.49 0 9.45 4.15 9.9 8.325l.933 1.39ZM19.012 8.54C18.67 5.376 15.564 2 11.1 2 7.163 2 4.428 4.629 3.473 7.177c-.448 1.193-.5 2.566-.27 3.833.235 1.306.721 2.25 1.082 2.65C5.896 15.448 6.8 17.455 6.8 19.426V22h7.3v-1c0-.575.174-1.368.864-1.97.636-.555 1.385-.655 1.886-.655h1.938a.538.538 0 0 0 .183-.122.557.557 0 0 0 .112-.157.209.209 0 0 0 .017-.05V14.7c0-1.014.657-1.606.922-1.81.296-.231.622-.384.828-.475.104-.046.236-.1.38-.157l-.126-.19a1464.54 1464.54 0 0 0-1.767-2.631l-.273-.409-.052-.489Z"
        fill={getIconColor(color, 1, '#000')}
      />
    </svg>
  );
};

export const IconXiangsici: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 25 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M12.698 3a9 9 0 0 0-8.039 4.948.523.523 0 0 1-.671.253l-.916-.4a.483.483 0 0 1-.248-.654A11 11 0 0 1 12.698 1c6.075 0 11 4.924 11 11v.658a.5.5 0 0 1-.74.438l-3.865-2.108c-.587-.32-.582-.642.02-.935l2.085-1.019A9.004 9.004 0 0 0 12.698 3Zm.004 18a9 9 0 0 0 8.039-4.948.523.523 0 0 1 .671-.253l.916.4c.253.111.37.407.248.654A11 11 0 0 1 12.702 23c-6.075 0-11-4.924-11-11v-.658a.5.5 0 0 1 .74-.438l3.865 2.108c.588.32.582.642-.02.935l-2.085 1.019a9.004 9.004 0 0 0 8.5 6.034Z"
        fill={getIconColor(color, 0, '#000')}
      />
      <path
        d="M14.204 16.311c.52.035 1.019.052 1.498.052.608.043.891-.228.851-.812V7.959h-5.597V6.477H18.1v9.654c.008.679-.112 1.151-.36 1.418-.248.266-.691.408-1.33.425-.208.009-.46.017-.755.026h-1.163a40.166 40.166 0 0 0-.288-1.689Z"
        fill={getIconColor(color, 1, '#000')}
      />
      <path
        d="M11.136 11.517h4.41v4.55h-4.41v-4.55Zm1.39 3.183h1.642v-1.83h-1.642v1.83Zm-4.699 1.844c.312-.327.46-.748.444-1.264v-3.712h-.97V9.996h2.456v4.614l.887-.799c.096.515.228 1.104.396 1.766a30.41 30.41 0 0 0-1.594 1.495 8.328 8.328 0 0 0-.684.773l-.935-1.301Zm2.877-7.528h5.334v1.43h-5.334v-1.43ZM7.54 6.812 8.834 6c.456.601.98 1.332 1.57 2.191l-1.378.915A37.806 37.806 0 0 0 7.54 6.812Z"
        fill={getIconColor(color, 2, '#000')}
      />
    </svg>
  );
};

export const IconSanfangAgent: FunctionComponent<Props> = ({
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
      <g fill={getIconColor(color, 0, '#5983FF')}>
        <path
          d="M15.35 9.5a7.502 7.502 0 0 1-14.7 0h2.058a5.501 5.501 0 0 0 10.583 0h2.058ZM8 .5a7.502 7.502 0 0 1 7.35 6h-2.06a5.502 5.502 0 0 0-10.582 0H.648A7.503 7.503 0 0 1 8 .5Z"
          fill={getIconColor(color, 1, '#337EFF')}
        />
        <path
          d="M3 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm13 3a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-3.853-2.343L9.239 4.33a.2.2 0 0 0-.339.143V6H5.25a.75.75 0 0 0 0 1.5h6.757a.2.2 0 0 0 .14-.343ZM3.853 8.843l2.908 2.827a.2.2 0 0 0 .339-.143V10h3.65a.75.75 0 0 0 0-1.5H3.993a.2.2 0 0 0-.14.343Z"
          fill={getIconColor(color, 2, '#337EFF')}
        />
      </g>
      <defs />
    </svg>
  );
};

export const IconZiyingAgent: FunctionComponent<Props> = ({
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
      <path
        d="M12.127 1.333c.685 0 1.258.52 1.326 1.201l1.067 10.667a1.333 1.333 0 0 1-1.327 1.466H2.807A1.333 1.333 0 0 1 1.48 13.2L2.547 2.534c.068-.682.641-1.2 1.326-1.2h8.254Zm-1.46 3.223A.545.545 0 0 0 10.133 4a.545.545 0 0 0-.533.556c0 .92-.716 1.666-1.6 1.666-.884 0-1.6-.746-1.6-1.666A.545.545 0 0 0 5.867 4a.545.545 0 0 0-.534.556C5.333 6.09 6.527 7.333 8 7.333c1.473 0 2.667-1.243 2.667-2.777Z"
        fill={getIconColor(color, 0, '#FAAD14')}
      />
    </svg>
  );
};

export const IconBangdingkapian: FunctionComponent<Props> = ({
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
        d="M20 2.5a2 2 0 0 1 2 2V11a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V9.5H3v10h2.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2h17Zm-17 5h17v-3H3v3Z"
        fill={getIconColor(color, 0, '#000')}
      />
      <path
        d="M7 17a4.5 4.5 0 0 1 4.5-4.5H13a1 1 0 1 1 0 2h-1.5a2.5 2.5 0 0 0 0 5H13a1 1 0 1 1 0 2h-1.5A4.5 4.5 0 0 1 7 17Zm16 0a4.5 4.5 0 0 0-4.5-4.5H17a1 1 0 1 0 0 2h1.5a2.5 2.5 0 0 1 0 5H17a1 1 0 1 0 0 2h1.5A4.5 4.5 0 0 0 23 17Z"
        fill={getIconColor(color, 1, '#000')}
      />
      <path d="M11.5 17a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2h-5a1 1 0 0 1-1-1Z" fill={getIconColor(color, 2, '#000')} />
    </svg>
  );
};

export const IconDuigou: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M1 6.5A5.5 5.5 0 0 1 6.5 1h11A5.5 5.5 0 0 1 23 6.5v11a5.5 5.5 0 0 1-5.5 5.5h-11A5.5 5.5 0 0 1 1 17.5v-11Z"
        fill={getIconColor(color, 0, '#337EFF')}
      />
      <path
        d="M18 2H6a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4ZM6 0h12a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Z"
        fill={getIconColor(color, 1, '#fff')}
      />
      <path
        d="M17.26 8.075a.75.75 0 0 1 .04 1.06l-6.25 6.75a.75.75 0 0 1-1.117-.019l-3.25-3.75a.75.75 0 0 1 1.134-.982l2.701 3.117L16.2 8.115a.75.75 0 0 1 1.06-.04Z"
        fill={getIconColor(color, 2, '#fff')}
      />
    </svg>
  );
};

export const IconDuihua: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="m5.955 16-3.646 2.864a.5.5 0 0 1-.809-.393V3.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1V16H5.955Zm-.692-2H16.5V4.5h-13v10.885L5.263 14ZM8.5 17.5h10.237l1.763 1.385V8h1a1 1 0 0 1 1 1v12.971a.5.5 0 0 1-.809.393L18.045 19.5H9.5a1 1 0 0 1-1-1v-1Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconPeizhi: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M1.333 12.667c0-.368.299-.667.667-.667h8v-.333a1 1 0 0 1 2 0V12h2a.667.667 0 0 1 0 1.333h-2v.334a1 1 0 0 1-2 0v-.334H2a.667.667 0 0 1-.667-.666ZM11 1.333a1 1 0 0 0-1 1v.334H2A.667.667 0 0 0 2 4h8v.333a1 1 0 0 0 2 0V4h2a.667.667 0 1 0 0-1.333h-2v-.334a1 1 0 0 0-1-1Zm-9 6a.667.667 0 1 0 0 1.334h2V9a1 1 0 0 0 2 0v-.333h8a.667.667 0 1 0 0-1.334H6V7a1 1 0 1 0-2 0v.333H2Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconDaima: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M5.15 12.396a.735.735 0 1 1-1.278.726L1.097 8.244a.735.735 0 0 1 0-.73L3.875 2.68a.735.735 0 0 1 1.274.732L2.58 7.883l2.569 4.513Zm5.7 0 2.569-4.513-2.567-4.47a.734.734 0 0 1 1.274-.731l2.777 4.833a.735.735 0 0 1 0 .73l-2.775 4.877a.735.735 0 1 1-1.278-.726ZM8.9 2.86a.735.735 0 0 1 1.398.45l-3.14 9.754a.735.735 0 1 1-1.397-.45l3.138-9.756v.002Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconShouqi: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 14 14" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M7.628 6.057a.581.581 0 0 0 .537.36h4.085a.583.583 0 0 0 0-1.167H9.575l3.088-3.087a.583.583 0 0 0-.825-.825L8.75 4.425V1.75a.583.583 0 1 0-1.167 0v4.085c0 .079.016.153.045.222ZM6.373 7.943a.58.58 0 0 0-.538-.36H1.75a.583.583 0 1 0 0 1.167h2.675l-3.087 3.088a.583.583 0 0 0 .825.825L5.25 9.575v2.675a.583.583 0 1 0 1.167 0V8.165a.581.581 0 0 0-.044-.222Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconZhankai: FunctionComponent<Props> = ({
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
        d="M12.79 1.527a.58.58 0 0 0-.538-.36H8.167a.583.583 0 1 0 0 1.166h2.675L7.754 5.421a.583.583 0 0 0 .825.825l3.088-3.088v2.675a.583.583 0 0 0 1.167 0V1.748a.581.581 0 0 0-.045-.221ZM1.21 12.473a.59.59 0 0 0 .123.186l.007.007a.582.582 0 0 0 .407.167h4.085a.583.583 0 0 0 0-1.166H3.159l3.088-3.088a.583.583 0 0 0-.825-.825l-3.088 3.088V8.167a.583.583 0 1 0-1.166 0v4.085a.58.58 0 0 0 .044.221Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconSaoba: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        fill={getIconColor(color, 0, 'currentColor')}
        d="M2 6h4V2.333C6 1.597 6.597 1 7.334 1h1.333C9.403 1 10 1.597 10 2.333V6h4c.737 0 1.334.597 1.334 1.333V14c0 .736-.597 1.333-1.334 1.333H2A1.333 1.333 0 0 1 .667 14V7.333C.667 6.597 1.264 6 2 6Zm5.334-3.667v4a1 1 0 0 1-1 1H2v1.334h12V7.333H9.667a1 1 0 0 1-1-1v-4H7.334ZM2 10v4h2.667v-1.667a.667.667 0 0 1 1.333 0V14h1.334v-2a.667.667 0 1 1 1.333 0v2H10v-1.667a.667.667 0 0 1 1.334 0V14H14v-4H2Z"
      />
    </svg>
  );
};

export const IconShezhi: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <g>
        <path
          d="M1.65 11.667a7.359 7.359 0 0 1-.656-1.495c-.074-.239.051-.484.245-.641.446-.361.73-.913.73-1.531 0-.618-.283-1.169-.728-1.53-.194-.157-.318-.406-.244-.645a7.325 7.325 0 0 1 1.62-2.807c.168-.183.444-.197.677-.108a1.966 1.966 0 0 0 1.691-.133c.535-.309.87-.831.96-1.397.04-.247.19-.478.433-.534a7.325 7.325 0 0 1 3.24.002c.244.055.398.287.437.533a1.966 1.966 0 0 0 2.652 1.53c.233-.09.508-.076.677.108a7.355 7.355 0 0 1 1.622 2.81c.075.238-.05.483-.245.64a1.966 1.966 0 0 0-.001 3.06c.194.158.318.407.244.645a7.325 7.325 0 0 1-1.62 2.808c-.169.183-.445.197-.678.108a1.965 1.965 0 0 0-1.69.133 1.96 1.96 0 0 0-.96 1.397c-.04.247-.19.479-.434.534a7.325 7.325 0 0 1-3.24-.002c-.244-.054-.397-.287-.437-.533a1.966 1.966 0 0 0-.96-1.396 1.966 1.966 0 0 0-1.691-.133c-.233.09-.508.075-.678-.108a7.357 7.357 0 0 1-.967-1.315ZM3.302 8a3.29 3.29 0 0 1-.872 2.236 6.064 6.064 0 0 0 .849 1.47 3.29 3.29 0 0 1 2.372.362 3.29 3.29 0 0 1 1.5 1.872 6.03 6.03 0 0 0 1.697.002 3.29 3.29 0 0 1 1.5-1.874 3.29 3.29 0 0 1 2.373-.363c.353-.45.637-.946.847-1.47A3.29 3.29 0 0 1 12.698 8c0-.863.33-1.648.871-2.235a6.07 6.07 0 0 0-.848-1.47 3.29 3.29 0 0 1-2.372-.363 3.29 3.29 0 0 1-1.5-1.872 5.992 5.992 0 0 0-1.697-.002 3.29 3.29 0 0 1-1.5 1.874 3.29 3.29 0 0 1-2.373.363c-.353.45-.637.946-.847 1.47A3.29 3.29 0 0 1 3.303 8Zm7.364 0a2.667 2.667 0 1 1-5.333 0 2.667 2.667 0 0 1 5.333 0Zm-4 0a1.333 1.333 0 1 0 2.667 0 1.333 1.333 0 0 0-2.667 0Z"
          fill={getIconColor(color, 0, '#000')}
        />
      </g>
      <defs />
    </svg>
  );
};

export const IconChakanbiangengrizhi: FunctionComponent<Props> = ({
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
        d="M13.417 7c-1.28 2.964-3.674 4.958-6.416 4.958C4.259 11.958 1.865 9.964.584 7c1.28-2.964 3.675-4.958 6.417-4.958S12.136 4.036 13.417 7ZM1.87 7C3.061 9.41 5 10.792 7.001 10.792c2 0 3.94-1.383 5.131-3.792-1.191-2.41-3.13-3.792-5.131-3.792-2.002 0-3.94 1.383-5.132 3.792Zm3.126 0c0-1.141.898-2.066 2.006-2.066 1.107 0 2.005.925 2.005 2.066 0 1.141-.898 2.066-2.005 2.066-1.108 0-2.006-.925-2.006-2.066Zm2.006.9c.43 0 .838-.37.838-.9s-.408-.9-.838-.9-.839.37-.839.9.408.9.839.9Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconHuifucibanben: FunctionComponent<Props> = ({
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
        d="M7.506 1.384a5.616 5.616 0 0 0-5.582 5.015h-.648a.352.352 0 0 0-.306.527l1.316 2.256a.357.357 0 0 0 .612 0l1.316-2.256a.352.352 0 0 0-.307-.527h-.772a4.414 4.414 0 1 1 2.606 4.648.602.602 0 0 0-.481 1.102A5.616 5.616 0 1 0 7.506 1.383Zm.561 11.103c-.092.01-.184.018-.277.023l-.284.007c.19 0 .377-.011.561-.03Zm-2.767-.43c.164.072.333.134.506.19-.084-.027-.168-.054-.25-.085a5.37 5.37 0 0 1-.256-.105Zm-.29-.559v-.004l.006-.023-.006.027Zm3.036-.018a4.513 4.513 0 0 1-.308.028l.215-.017.093-.011Zm4.797-3.08Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconXinxi: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 12 12" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M6 0a6 6 0 1 0 0 12A6 6 0 0 0 6 0Zm-.455 4.097a.643.643 0 1 0 .91-.909.643.643 0 0 0-.91.91Zm.134 1.046a.107.107 0 0 0-.108.107v3.643c0 .059.049.107.108.107h.642a.107.107 0 0 0 .108-.107V5.25a.107.107 0 0 0-.108-.107H5.68ZM1.018 6a4.983 4.983 0 1 1 9.966.002A4.983 4.983 0 0 1 1.018 6Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconChakanlishifabubanben: FunctionComponent<Props> = ({
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
      <path
        d="M13 1c.736 0 1.333.597 1.333 1.333V7a.667.667 0 0 1-1.334 0V2.333H3v11.334h4.334a.667.667 0 1 1 0 1.333H2.999a1.333 1.333 0 0 1-1.333-1.333V2.333C1.666 1.597 2.263 1 2.999 1h10Zm-2 3a.667.667 0 1 1 0 1.333H5A.667.667 0 0 1 5 4h6ZM8.332 6.667a.667.667 0 1 1 0 1.333H4.999a.667.667 0 1 1 0-1.333h3.334Z"
        fill={getIconColor(color, 0, '#000')}
      />
      <path
        d="M11.999 8.533a3.467 3.467 0 1 1 0 6.934 3.467 3.467 0 0 1 0-6.934Zm0 .873a2.594 2.594 0 1 0 0 5.188 2.594 2.594 0 0 0 0-5.188Zm-.151.61c.24 0 .436.194.436.435v1.416h.745a.437.437 0 0 1 0 .872h-1.181a.436.436 0 0 1-.437-.436v-1.852c0-.24.196-.436.437-.436Z"
        fill={getIconColor(color, 1, '#000')}
        stroke={getIconColor(color, 2, '#000')}
      />
    </svg>
  );
};
export const IconChakanlishifabu: FunctionComponent<Props> = ({
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
      <path
        d="M11.849 9.882a.57.57 0 0 1 .57.57v1.281h.611a.57.57 0 0 1 0 1.14h-1.18a.57.57 0 0 1-.57-.57v-1.852a.57.57 0 0 1 .57-.57Z"
        fill={getIconColor(color, 0, '#000')}
      />
      <path
        d="M12 8.4a3.6 3.6 0 1 1 0 7.201 3.6 3.6 0 0 1 0-7.2Zm.335 6.916a3.391 3.391 0 0 1-.502.013l.167.005c.113 0 .225-.007.335-.018ZM12 9.54a2.46 2.46 0 1 0 0 4.92 2.46 2.46 0 0 0 0-4.92Z"
        fill={getIconColor(color, 1, '#000')}
      />
      <path
        d="M12.999 1c.736 0 1.334.597 1.334 1.333V7a.667.667 0 0 1-1.334 0V2.333h-10v11.334h4.334a.666.666 0 0 1 0 1.333H2.999a1.333 1.333 0 0 1-1.333-1.333V2.333C1.666 1.597 2.263 1 2.999 1h10Z"
        fill={getIconColor(color, 2, '#000')}
      />
      <path
        d="M8.333 6.667a.666.666 0 0 1 0 1.333H4.999a.667.667 0 0 1 0-1.333h3.334ZM10.999 4a.667.667 0 0 1 0 1.333h-6a.666.666 0 0 1 0-1.333h6Z"
        fill={getIconColor(color, 3, '#000')}
      />
    </svg>
  );
};

export const IconFabujilu: FunctionComponent<Props> = ({
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
      <path
        d="M4 0h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4Z"
        fill={getIconColor(color, 0, '#FAAD14')}
      />
      <g>
        <path
          d="M10 4.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm-.251 1.9a.6.6 0 0 0-.6.6v3.5a.6.6 0 0 0 .6.6h2.5a.6.6 0 0 0 0-1.2h-1.9V7a.6.6 0 0 0-.6-.6Z"
          fill={getIconColor(color, 1, '#fff')}
        />
      </g>
      <defs />
    </svg>
  );
};

export const IconJingshi: FunctionComponent<Props> = ({
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
      <path
        d="M8.04 10.96a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM8 6c.368 0 .667.299.667.667v3a.667.667 0 0 1-1.333 0v-3C7.334 6.298 7.632 6 8 6Z"
        fill={getIconColor(color, 0, '#000')}
      />
      <path
        d="M6.845 3a1.334 1.334 0 0 1 2.31 0l5.774 10c.512.889-.13 2-1.155 2H2.227l-.095-.003a1.334 1.334 0 0 1-1.104-1.913L1.072 13 6.845 3ZM2.227 13.667h11.547L8 3.667l-5.773 10Z"
        fill={getIconColor(color, 1, '#000')}
      />
    </svg>
  );
};

export const IconBuju: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M6.334 9.333c.736 0 1.333.597 1.333 1.334v2c0 .69-.525 1.258-1.197 1.326L6.334 14H3l-.136-.007a1.333 1.333 0 0 1-1.19-1.19l-.007-.136v-2c0-.737.597-1.334 1.333-1.334h3.334ZM3 12.667h3.334v-2H3v2Zm10-6c.737 0 1.334.597 1.334 1.333v4.667l-.008.136a1.333 1.333 0 0 1-1.19 1.19L13 14H9.667l-.136-.007a1.333 1.333 0 0 1-1.19-1.19l-.007-.136V8c0-.736.597-1.333 1.333-1.333H13Zm-3.333 6H13V8H9.667v4.667ZM6.334 2c.736 0 1.333.597 1.333 1.333v4c0 .69-.525 1.258-1.197 1.327l-.136.007H3l-.136-.007a1.333 1.333 0 0 1-1.19-1.19l-.007-.137v-4C1.667 2.597 2.264 2 3 2h3.334ZM3 7.333h3.334v-4H3v4ZM13 2c.737 0 1.334.597 1.334 1.333v1.334c0 .69-.525 1.258-1.198 1.326L13 6H9.667l-.136-.007a1.333 1.333 0 0 1-1.19-1.19l-.007-.136V3.333C8.334 2.597 8.93 2 9.667 2H13ZM9.667 4.667H13V3.333H9.667v1.334Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconArray: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg width={size} height={size} style={style} viewBox="0 0 16 16" fill="none" {...reset}>
      <path
        d="M5.23759 1.00342H2.00391V14.997H5.23759V13.6251H3.35127V2.37534H5.23759V1.00342Z"
        fill="currentColor"
      ></path>
      <path
        d="M10.7624 1.00342H13.9961V14.997H10.7624V13.6251H12.6487V2.37534H10.7624V1.00342Z"
        fill="currentColor"
      ></path>
    </svg>
  );
};

export const IconAIfuzhu: FunctionComponent<Props> = ({
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
      <path
        d="M6.927 4.007c.387 0 .727.256.833.628l3.066 10.78a1.01 1.01 0 0 1-1.942.553l-.612-2.152H3.626l-.612 2.152a1.01 1.01 0 0 1-1.943-.553l3.067-10.78a.866.866 0 0 1 .832-.628h1.957Zm-.84 2.131a.144.144 0 0 0-.277 0L4.2 11.797h3.497l-1.61-5.659Z"
        fill={getIconColor(color, 0, 'url(#IconAIfuzhu-a)')}
      />
      <path
        d="M13.838 9.705c.558 0 1.01.452 1.01 1.01v4.904a1.01 1.01 0 1 1-2.02 0v-4.904c0-.558.453-1.01 1.01-1.01Z"
        fill={getIconColor(color, 1, 'url(#IconAIfuzhu-b)')}
      />
      <path
        d="M13.793 1.643c.414 0 .634.422.718.827a2.447 2.447 0 0 0 1.894 1.894c.405.084.827.304.827.718s-.421.634-.827.718c-.45.094-.88.315-1.229.665-.35.35-.57.778-.664 1.229-.085.405-.304.827-.719.827-.414 0-.634-.421-.718-.827a2.433 2.433 0 0 0-.665-1.23 2.433 2.433 0 0 0-1.229-.664c-.405-.084-.827-.304-.827-.718s.422-.634.827-.718a2.44 2.44 0 0 0 1.894-1.894c.084-.405.304-.827.718-.827Z"
        fill={getIconColor(color, 2, 'url(#IconAIfuzhu-c)')}
      />
      <defs>
        <linearGradient id="IconAIfuzhu-a" x1="4.05" y1="17.1" x2="15.75" y2="2.7" gradientUnits="userSpaceOnUse">
          <stop offset=".112" stopColor="#8359FF" />
          <stop offset=".732" stopColor="#337EFF" />
          <stop offset="1" stopColor="#73E8FF" />
        </linearGradient>
        <linearGradient id="IconAIfuzhu-b" x1="4.05" y1="17.1" x2="15.75" y2="2.7" gradientUnits="userSpaceOnUse">
          <stop offset=".112" stopColor="#8359FF" />
          <stop offset=".732" stopColor="#337EFF" />
          <stop offset="1" stopColor="#73E8FF" />
        </linearGradient>
        <linearGradient id="IconAIfuzhu-c" x1="4.05" y1="17.1" x2="15.75" y2="2.7" gradientUnits="userSpaceOnUse">
          <stop offset=".112" stopColor="#8359FF" />
          <stop offset=".732" stopColor="#337EFF" />
          <stop offset="1" stopColor="#73E8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const IconFasong: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <g>
        <path
          d="m7.02.704-6.355 12c-.443.836.295 1.806 1.218 1.603l4.445-.979a1.11 1.11 0 0 0 .867-.99l.528-6.24c.029-.338.524-.338.553 0l.53 6.241a1.109 1.109 0 0 0 .866.99l4.444.978c.923.203 1.66-.767 1.219-1.602L8.98.704a1.109 1.109 0 0 0-1.96 0Z"
          fill={getIconColor(color, 0, '#000')}
        />
      </g>
      <defs />
    </svg>
  );
};

export const IconAIkongtai: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <g opacity=".5">
        <path
          d="M21.643 8.915c2.103 0 3.22 2.143 3.647 4.202a12.353 12.353 0 0 0 3.373 6.24 12.342 12.342 0 0 0 6.234 3.37c2.06.428 4.202 1.543 4.205 3.647.001 2.105-2.141 3.223-4.203 3.651a12.344 12.344 0 0 0-6.236 3.37 12.34 12.34 0 0 0-3.37 6.237c-.429 2.062-1.545 4.204-3.65 4.205-2.106 0-3.223-2.143-3.652-4.205a12.348 12.348 0 0 0-3.37-6.234 12.356 12.356 0 0 0-6.237-3.373c-2.061-.429-4.205-1.546-4.204-3.651 0-2.105 2.145-3.22 4.207-3.647a12.336 12.336 0 0 0 6.234-3.37 12.352 12.352 0 0 0 3.373-6.24c.428-2.06 1.545-4.202 3.649-4.202Z"
          fill={getIconColor(color, 0, 'url(#IconAIkongtai-a)')}
        />
        <path
          d="M36.924 3.468c1.368.002 1.862 1.576 2.417 2.827a4.507 4.507 0 0 0 2.296 2.29c1.217.535 2.718 1.07 2.665 2.397-.05 1.276-1.5 1.742-2.686 2.217a4.491 4.491 0 0 0-1.507.996c-.445.447-.78.962-.998 1.512-.457 1.15-.958 2.531-2.196 2.53-1.234-.004-1.735-1.38-2.192-2.527a4.482 4.482 0 0 0-.998-1.515 4.495 4.495 0 0 0-1.502-.996c-1.184-.476-2.633-.94-2.684-2.214-.053-1.33 1.45-1.864 2.667-2.4a4.47 4.47 0 0 0 1.362-.936 4.51 4.51 0 0 0 .933-1.354c.556-1.252 1.053-2.828 2.423-2.827Z"
          fill={getIconColor(color, 1, 'url(#IconAIkongtai-b)')}
        />
      </g>
      <defs>
        <linearGradient
          id="IconAIkongtai-a"
          x1="11.655"
          y1="44.904"
          x2="43.436"
          y2="8.766"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".112" stopColor="#8359FF" />
          <stop offset=".732" stopColor="#337EFF" />
          <stop offset="1" stopColor="#73E8FF" />
        </linearGradient>
        <linearGradient
          id="IconAIkongtai-b"
          x1="11.655"
          y1="44.904"
          x2="43.436"
          y2="8.766"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".112" stopColor="#8359FF" />
          <stop offset=".732" stopColor="#337EFF" />
          <stop offset="1" stopColor="#73E8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const IconFuzhi: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 14 14" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M4.084 4.083v-1.75c0-.644.522-1.166 1.166-1.166h6.417c.644 0 1.167.522 1.167 1.166V8.75c0 .644-.523 1.167-1.167 1.167h-1.75v1.75c0 .644-.522 1.166-1.167 1.166H2.334a1.167 1.167 0 0 1-1.167-1.166V5.25c0-.644.522-1.167 1.167-1.167h1.75Zm0 1.167h-1.75v6.417H8.75v-1.75h-3.5A1.167 1.167 0 0 1 4.084 8.75v-3.5ZM5.25 2.333V8.75h6.417V2.333H5.25Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconSearch_line: FunctionComponent<Props> = ({
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
      <path
        d="M7.333 2.04a5.294 5.294 0 0 1 4.158 8.566l2.284 2.285a.626.626 0 0 1-.885.885l-2.286-2.284A5.294 5.294 0 1 1 7.333 2.04Zm0 1.254a4.04 4.04 0 1 0 0 8.08 4.04 4.04 0 0 0 0-8.08Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconShuaxin2: FunctionComponent<Props> = ({
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
        d="M2 12a9 9 0 0 0 9 9 8.967 8.967 0 0 0 3.6-.748 1 1 0 0 1 .8 1.832c-1.348.59-2.837.916-4.4.916-6.075 0-11-4.925-11-11S4.925 1 11 1c5.738 0 10.45 4.394 10.955 10h1.469c.386 0 .632.418.438.751l-2.624 4.498a.51.51 0 0 1-.876 0l-2.624-4.498a.502.502 0 0 1 .438-.751h1.77A9.001 9.001 0 0 0 2 12Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconBianji2: FunctionComponent<Props> = ({
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
        d="M2.626 11.375h8.75V7.868a.58.58 0 0 1 .587-.576c.314 0 .58.253.58.576v3.507c0 .644-.523 1.167-1.167 1.167h-8.75a1.167 1.167 0 0 1-1.167-1.167v-8.75c0-.644.522-1.167 1.167-1.167h4.082c.322 0 .584.266.584.588a.586.586 0 0 1-.584.579H2.626v8.75Zm3.62-2.796a.583.583 0 0 1-.825-.825l5.834-5.833a.583.583 0 0 1 .825.825L6.246 8.579Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconChahao: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 14 14" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M7 13.417A6.417 6.417 0 1 1 7 .583a6.417 6.417 0 0 1 0 12.834Zm-2.663-8.42L6.341 7 4.337 9.003a.467.467 0 0 0 .66.66L7.001 7.66l2.003 2.003a.467.467 0 0 0 .66-.66L7.661 7l2.003-2.003a.467.467 0 0 0-.66-.66L7.001 6.34 4.997 4.337a.467.467 0 1 0-.66.66Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

// 清除颜色按钮
export const IconWubeijing: FunctionComponent<Props> = ({
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
      <path
        d="M0 12V4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4Z"
        fill={getIconColor(color, 0, '#FFF')}
        fillOpacity="1"
      />
      <path
        d="M0 12V4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4Zm1 0c0 .828.293 1.536.879 2.121A2.89 2.89 0 0 0 4 15h8a2.89 2.89 0 0 0 2.121-.879A2.89 2.89 0 0 0 15 12V4a2.89 2.89 0 0 0-.879-2.121A2.89 2.89 0 0 0 12 1H4a2.89 2.89 0 0 0-2.121.879A2.89 2.89 0 0 0 1 4v8Z"
        fill={getIconColor(color, 1, '#000')}
        fillOpacity=".1"
      />
      <path
        d="m14.424 13.576-12-12a.6.6 0 1 0-.848.848l12 12a.6.6 0 0 0 .848-.848Z"
        fill={getIconColor(color, 2, 'red')}
        fillOpacity="1"
      />
    </svg>
  );
};

export const IconJiahao: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 14 14" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M7.001 1.167c.322 0 .583.26.583.583v4.667h4.667a.583.583 0 1 1 0 1.166H7.584v4.667a.583.583 0 1 1-1.166 0V7.583H1.751a.583.583 0 1 1 0-1.166h4.667V1.75c0-.322.26-.583.583-.583Z"
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

export const IconGongzuoliu: FunctionComponent<Props> = ({
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
      <path
        d="M0 3.75A3.75 3.75 0 0 1 3.75 0h10.5A3.75 3.75 0 0 1 18 3.75v10.5A3.75 3.75 0 0 1 14.25 18H3.75A3.75 3.75 0 0 1 0 14.25V3.75Z"
        fill={getIconColor(color, 0, '#4D88FF')}
      />
      <path
        d="M9.203 13.148h4.67v-2.495h-4.67v2.495Zm-5.076-5.8h4.67V4.851h-4.67v2.495ZM14.8 13.35l-.015.146a.726.726 0 0 1-.564.564l-.146.015H9a.725.725 0 0 1-.71-.58l-.015-.145v-2.9c0-.35.248-.643.579-.71L9 9.725h3.336v-2.9c0-.21-.15-.385-.348-.426L11.9 6.39h-.942l-.103-.01a.508.508 0 0 1 0-.995l.103-.01h.942c.801 0 1.45.649 1.45 1.45v2.9h.726c.4 0 .724.325.725.725v2.901Zm-5.074-5.8-.016.147a.725.725 0 0 1-.71.579H5.665v2.9l.009.088c.035.17.168.303.338.338l.088.01h.942a.507.507 0 1 1 0 1.014H6.1a1.45 1.45 0 0 1-1.443-1.301l-.008-.149v-2.9h-.724l-.147-.015a.726.726 0 0 1-.579-.71V4.648c0-.35.249-.643.58-.71l.146-.015H9c.4 0 .725.325.726.725v2.9Z"
        fill={getIconColor(color, 1, '#fff')}
      />
    </svg>
  );
};

export const IconZizhuguihuamoshi: FunctionComponent<Props> = ({
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
      <path
        d="M10 8.5c.546 0 1.023.293 1.285.73.02.065.049.128.088.187l.018.025A1.495 1.495 0 0 1 10 11.5a1.5 1.5 0 0 1-1.388-2.069l.012-.015a.75.75 0 0 0 .083-.174c.26-.444.742-.742 1.293-.742Z"
        fill={getIconColor(color, 0, '#9F80FF')}
      />
      <path
        d="M8.944 1.11a2.112 2.112 0 0 1 2.112 0l6.116 3.531a2.111 2.111 0 0 1 1.055 1.828v7.063c0 .754-.402 1.45-1.055 1.828l-6.116 3.531a2.112 2.112 0 0 1-2.112 0L2.828 15.36a2.112 2.112 0 0 1-1.056-1.828V6.469c0-.754.403-1.45 1.056-1.828L8.944 1.11Zm6.68 5.473a.75.75 0 0 0-1.04-.208l-2.385 1.59a2.988 2.988 0 0 0-4.4 0L5.416 6.376a.75.75 0 1 0-.832 1.248l2.503 1.668a2.998 2.998 0 0 0 2.163 3.61V16a.75.75 0 0 0 1.5 0v-3.1A2.997 2.997 0 0 0 13 10c0-.244-.033-.48-.088-.708l2.504-1.669a.75.75 0 0 0 .208-1.04Z"
        fill={getIconColor(color, 1, '#9F80FF')}
      />
    </svg>
  );
};

export const IconGongzuoliumoshi: FunctionComponent<Props> = ({
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
      <path
        d="M13.255 4.87h1.215c.845 0 1.53.685 1.53 1.53v5.445h1.875c.224 0 .405.181.405.405v4.5a.405.405 0 0 1-.405.405H10a.405.405 0 0 1-.405-.405v-4.5c0-.224.181-.405.405-.405h5.52v-5.01c0-.77-.625-1.395-1.395-1.395h-.87a.286.286 0 0 1 0-.57ZM2.125 2.845H10c.224 0 .405.181.405.405v4.5a.405.405 0 0 1-.405.405H4.48v5.01c0 .77.625 1.395 1.395 1.395h.915a.24.24 0 0 1 0 .48H5.53A1.53 1.53 0 0 1 4 13.51V8.155H2.125a.405.405 0 0 1-.405-.405v-4.5c0-.224.181-.405.405-.405Z"
        fill={getIconColor(color, 0, '#4D88FF')}
        stroke={getIconColor(color, 1, '#4D88FF')}
      />
    </svg>
  );
};

export const IconHuanbang: FunctionComponent<Props> = ({
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
      <path
        d="M13.754 5.27c.294-.17.673-.09.839.207.471.841.74 1.819.74 2.856 0 3.099-2.4 5.667-5.428 5.667H6v1.081a.252.252 0 0 1-.364.226L2.14 13.558a.251.251 0 0 1 0-.45l3.498-1.748a.252.252 0 0 1 .363.225v1.082h3.905c2.232 0 4.095-1.91 4.095-4.334a4.5 4.5 0 0 0-.494-2.065c-.18-.35-.093-.801.248-.998ZM10 1.585c0-.187.197-.308.364-.225l3.497 1.749a.252.252 0 0 1 0 .45l-3.497 1.748A.252.252 0 0 1 10 5.08V4H6.095C3.864 4 2 5.91 2 8.333c0 .835.222 1.609.603 2.264.204.353.126.827-.226 1.03-.282.163-.644.095-.817-.18a5.829 5.829 0 0 1-.893-3.114c0-3.098 2.4-5.666 5.428-5.666H10V1.585Z"
        fill={getIconColor(color, 0, 'currentColor')}
      />
    </svg>
  );
};

export const IconQuanbu: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <g fill={getIconColor(color, 0, '#000')}>
        <path
          d="M11.68 8.578a3.102 3.102 0 1 1-3.102 3.101V9.094a.518.518 0 0 1 .518-.516h2.584Zm-4.713-.06a.518.518 0 0 1 .518.517v2.585a3.103 3.103 0 0 1-5.295 2.193 3.101 3.101 0 0 1 2.193-5.295h2.584ZM4.383 1.281a3.103 3.103 0 0 1 3.102 3.101v2.585a.518.518 0 0 1-.518.518H4.383a3.102 3.102 0 0 1 0-6.204Zm7.237 0a3.101 3.101 0 0 1 0 6.204H9.036a.518.518 0 0 1-.518-.518V4.382a3.102 3.102 0 0 1 3.102-3.1Z"
          fill={getIconColor(color, 1, '#000')}
        />
      </g>
      <defs />
    </svg>
  );
};

export const IconNeizhigongju: FunctionComponent<Props> = ({
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
          d="M8 .75a7.25 7.25 0 1 1 0 14.5A7.25 7.25 0 0 1 8 .75Zm2.842 3.183A2.524 2.524 0 0 0 7.388 7.03L4.417 9.998a1.123 1.123 0 1 0 1.59 1.589l2.97-2.969a2.518 2.518 0 0 0 3.093-3.446c-.138.155-.368.354-.698.655-.349.349-.842.349-1.191 0-.35-.349-.35-.842 0-1.191.321-.322.666-.703.66-.704Z"
          fill={getIconColor(color, 0, '#000')}
        />
      </g>
      <defs />
    </svg>
  );
};

export const IconAPIgongju: FunctionComponent<Props> = ({
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
      <path
        d="M6.355 6.09a.202.202 0 0 1 .254.025l.685.686a.203.203 0 0 1 0 .285h-.001l-.991.982 1.626 1.627.989-.98.032-.027a.202.202 0 0 1 .253.027l.689.681a.202.202 0 0 1 0 .285l-.993.983.773.773a.203.203 0 0 1 0 .285L7.755 13.64a3.8 3.8 0 0 1-2.696 1.118 3.79 3.79 0 0 1-2.102-.632l-.615.617-.001.001a.207.207 0 0 1-.143.057.199.199 0 0 1-.143-.058l-.797-.798a.203.203 0 0 1 0-.285l.615-.618a3.821 3.821 0 0 1 .486-4.8l1.914-1.918h.001a.21.21 0 0 1 .143-.057c.051 0 .103.016.144.057l.772.774.991-.983.031-.025Zm7.43-4.89c.052 0 .103.016.144.057l.797.799a.205.205 0 0 1 0 .286l-.556.572a3.821 3.821 0 0 1-.485 4.802l-1.916 1.918h-.001a.21.21 0 0 1-.142.058.2.2 0 0 1-.144-.058L6.373 4.52a.202.202 0 0 1 0-.285L8.29 2.316A3.799 3.799 0 0 1 10.986 1.2c.733 0 1.466.21 2.1.631l.555-.572.002-.002.066-.042a.204.204 0 0 1 .076-.015Z"
        fill={getIconColor(color, 0, '#000')}
        stroke={getIconColor(color, 1, '#000')}
      />
    </svg>
  );
};

export const IconCanshu: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M14.83 8.038c0 1.46 0 2.608-.12 3.503-.123.918-.38 1.646-.954 2.218-.572.573-1.3.83-2.218.954-.895.12-2.042.12-3.503.12H7.96c-1.46 0-2.608 0-3.503-.12-.918-.123-1.646-.381-2.218-.954-.573-.572-.83-1.3-.954-2.218-.12-.895-.12-2.042-.12-3.503v-.076c0-1.46 0-2.608.12-3.503.123-.918.381-1.646.954-2.218.572-.573 1.3-.83 2.218-.954.895-.12 2.042-.12 3.503-.12h.076c1.46 0 2.608 0 3.503.12.918.123 1.646.382 2.218.954.572.572.83 1.3.954 2.218.12.895.12 2.042.12 3.503v.076Zm-2.833-2.371A.667.667 0 0 0 11.33 5H7.192a1.667 1.667 0 1 0 0 1.333h4.138a.667.667 0 0 0 .667-.666Zm0 4.666a1.667 1.667 0 0 0-3.195-.666H4.664a.667.667 0 1 0 0 1.333h4.138a1.667 1.667 0 0 0 3.195-.667Z"
        fill={getIconColor(color, 0, '#337EFF')}
      />
      <path
        d="M11 1a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4h6Zm-.346 7.701a1.659 1.659 0 0 0-1.862.966H4.667a.662.662 0 0 0-.69.666.67.67 0 0 0 .204.48.667.667 0 0 0 .486.187h4.125a1.658 1.658 0 0 0 2.813.385 1.672 1.672 0 0 0 0-2.104 1.662 1.662 0 0 0-.95-.58ZM6.427 4.186a1.659 1.659 0 0 0-2.052.43 1.672 1.672 0 0 0 0 2.102 1.659 1.659 0 0 0 2.813-.385h4.123a.664.664 0 0 0 .666-.666.669.669 0 0 0-.665-.667H7.188a1.666 1.666 0 0 0-.761-.814Z"
        fill={getIconColor(color, 1, '#000')}
      />
    </svg>
  );
};

export const IconZidingyi: FunctionComponent<Props> = ({
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
      <path
        d="M14.165 7.22h-1V4.556a1.339 1.339 0 0 0-1.333-1.34H9.166v-1a1.667 1.667 0 0 0-3.333 0v1H3.167a1.333 1.333 0 0 0-1.327 1.34V7.09h.992a1.8 1.8 0 1 1 0 3.602h-1v2.536a1.339 1.339 0 0 0 1.334 1.33h2.532v-1a1.802 1.802 0 0 1 3.601 0v1h2.532a1.338 1.338 0 0 0 1.332-1.333v-2.668h1.001a1.668 1.668 0 0 0 0-3.336h.001Z"
        fill={getIconColor(color, 0, '#000')}
        fillOpacity=".85"
      />
    </svg>
  );
};

export const IconGuanbi: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M12.113 2.78a.784.784 0 0 1 1.109 1.108L9.109 8l4.113 4.113a.784.784 0 0 1-1.109 1.108L8.001 9.109 3.889 13.22a.784.784 0 0 1-1.109-1.108L6.893 8 2.78 3.888a.784.784 0 0 1 1.11-1.109L8 6.892l4.112-4.113Z"
        fill={getIconColor(color, 0, '#000')}
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
        fill={getIconColor(color, 0, '#000')}
      />
    </svg>
  );
};

// Skill 技能图标
export const IconSkill: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 22 23" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M21.8836 12.0099L18.5886 7.61973L20.4135 2.4474C20.4531 2.32989 20.4571 2.20337 20.4249 2.08364C20.3927 1.9639 20.3258 1.85627 20.2325 1.77417C20.1392 1.69208 20.0237 1.63916 19.9003 1.62203C19.777 1.6049 19.6514 1.62432 19.5391 1.67786L14.343 3.41879L9.94532 0.126155C9.85118 0.0558697 9.73923 0.0130691 9.62203 0.00254906C9.50482 -0.00797095 9.38699 0.0142052 9.28174 0.0665927C9.17648 0.11898 9.08796 0.199509 9.02609 0.299156C8.96422 0.398803 8.93145 0.513631 8.93145 0.630773L9.00749 6.09326L4.53379 9.24713C4.43476 9.31272 4.35673 9.40524 4.30899 9.51369C4.26126 9.62215 4.24581 9.74197 4.2645 9.8589C4.28319 9.97584 4.33523 10.085 4.41442 10.1733C4.49361 10.2617 4.59663 10.3255 4.71122 10.3573L9.95799 11.9847L11.5422 17.2075C11.5766 17.3212 11.6426 17.4228 11.7325 17.5009C11.8224 17.5789 11.9326 17.6301 12.0504 17.6485C12.1682 17.667 12.2889 17.6519 12.3985 17.6052C12.5081 17.5584 12.6023 17.4818 12.6701 17.3841L15.8258 12.9308L21.3133 13.0192C21.4345 13.0265 21.5553 12.9998 21.6619 12.942C21.7685 12.8842 21.8566 12.7977 21.9161 12.6924C21.9756 12.5871 22.0042 12.4672 21.9984 12.3465C21.9927 12.2258 21.9529 12.1092 21.8836 12.0099Z"
        fill={getIconColor(color, 0, '#fff')}
      />
      <path
        opacity="0.8"
        d="M0.298276 21.47C-0.0994353 21.0741 -0.0993538 20.4302 0.298458 20.0344L7.14971 13.2171C7.54477 12.824 8.1832 12.8239 8.57832 13.217L9.23796 13.8731C9.63592 14.269 9.636 14.913 9.23813 15.309L2.38722 22.1272C1.99206 22.5205 1.35336 22.5204 0.958264 22.1271L0.298276 21.47Z"
        fill={getIconColor(color, 1, '#fff')}
        fillOpacity="0.8"
      />
    </svg>
  );
};

export const IconYichu: FunctionComponent<Props> = ({ size = defaultSize, color, style: _style, title, ...reset }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <g>
        <path
          d="M.667 8a7.333 7.333 0 1 1 14.666 0A7.333 7.333 0 0 1 .667 8ZM14 8A6 6 0 1 0 2 8a6 6 0 0 0 12 0Zm-2.534 0a.8.8 0 0 1-.8.8H5.333a.8.8 0 1 1 0-1.6h5.333a.8.8 0 0 1 .8.8Z"
          fill={getIconColor(color, 0, '#000')}
        />
      </g>
      <defs />
    </svg>
  );
};

export const IconDoubleArrowUpDown: FunctionComponent<Props> = ({
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.527 1.805a.627.627 0 0 1 .943 0L7.999 5.333l3.528-3.528a.627.627 0 1 1 .943.943L8.47 6.748a.627.627 0 0 1-.943 0L3.527 2.748a.627.627 0 0 1 0-.943Z"
        fill={getIconColor(color, 0, '#767580')}
      />
      <path
        d="M4.47 14.195a.627.627 0 0 1-.943-.943l4-4a.627.627 0 0 1 .943 0l4 4a.627.627 0 1 1-.943.943L7.999 10.667l-3.529 3.528Z"
        fill={getIconColor(color, 0, '#767580')}
      />
    </svg>
  );
};

/** 面板边缘折叠触发器箭头（向左单 chevron，6×24，对应 Figma 132778:5848） */
export const IconPanelCollapseArrow: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 6 24" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M5 4 L1.5 12 L5 20"
        stroke={getIconColor(color, 0, '#dfdfe5')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export const IconXingxing: FunctionComponent<Props> = ({
  size = defaultSize,
  color,
  style: _style,
  title,
  ...reset
}) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 27 27" width={size} height={size} style={style} {...reset}>
      {title ? <title>{title}</title> : null}
      <path
        d="M11.642 3.631c1.402 0 2.146 1.429 2.431 2.802a8.235 8.235 0 0 0 2.249 4.16 8.229 8.229 0 0 0 4.156 2.246c1.374.285 2.802 1.029 2.803 2.431.001 1.404-1.427 2.15-2.801 2.435a8.228 8.228 0 0 0-4.158 2.247 8.226 8.226 0 0 0-2.247 4.157c-.285 1.375-1.03 2.803-2.433 2.803-1.404 0-2.148-1.428-2.434-2.803a8.231 8.231 0 0 0-2.247-4.156 8.238 8.238 0 0 0-4.158-2.248C1.43 17.419 0 16.675 0 15.27c0-1.403 1.43-2.146 2.805-2.43a8.225 8.225 0 0 0 4.156-2.248 8.234 8.234 0 0 0 2.248-4.16c.286-1.373 1.03-2.8 2.433-2.8Z"
        fill={getIconColor(color, 0, 'url(#IconXingxing-a)')}
      />
      <path
        d="M21.83 0c.911.001 1.24 1.05 1.61 1.884a3.02 3.02 0 0 0 1.532 1.527c.81.357 1.811.713 1.776 1.598-.033.851-1 1.162-1.79 1.478a2.995 2.995 0 0 0-1.005.665c-.297.297-.52.64-.665 1.007-.305.767-.64 1.688-1.465 1.686-.823-.002-1.156-.92-1.46-1.684a2.99 2.99 0 0 0-.666-1.01 2.999 2.999 0 0 0-1.002-.663c-.789-.318-1.755-.627-1.789-1.477-.035-.886.967-1.242 1.778-1.6a3.003 3.003 0 0 0 1.53-1.527C20.585 1.05 20.916 0 21.83 0Z"
        fill={getIconColor(color, 1, 'url(#IconXingxing-b)')}
      />
      <defs>
        <linearGradient
          id="IconXingxing-a"
          x1="6.711"
          y1="24.188"
          x2="23.711"
          y2="-.312"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#505EFA" />
          <stop offset="1" stopColor="#A666FF" />
        </linearGradient>
        <linearGradient
          id="IconXingxing-b"
          x1="6.711"
          y1="24.188"
          x2="23.711"
          y2="-.312"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#505EFA" />
          <stop offset="1" stopColor="#A666FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};
