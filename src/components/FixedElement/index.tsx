import React from 'react';
import ReactDOM from 'react-dom';

const FixedElement = ({ children, container = document.body, ...props }) => {
  return ReactDOM.createPortal(<div {...props}>{children}</div>, container);
};

export default FixedElement;
