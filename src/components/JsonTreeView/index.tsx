import React from 'react';
import ReactJson from 'react-json-view';
import type { ReactJsonViewProps } from 'react-json-view';

const JsonTreeView: React.FC<ReactJsonViewProps> = ({
  src,
  collapsed = 2,
  theme = 'rjv-default',
  enableClipboard = false,
  ...props
}) => {
  return (
    <ReactJson
      src={src}
      theme={theme}
      collapsed={collapsed}
      displayObjectSize={false}
      displayDataTypes={false}
      enableClipboard={enableClipboard}
      shouldCollapse={() => false}
      indentWidth={2}
      iconStyle="triangle"
      quotesOnKeys={false}
      name={false} // 不显示根节点名称，这样就不会显示最外层括号
      {...props}
    />
  );
};

export default JsonTreeView;
