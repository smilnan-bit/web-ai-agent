import React from 'react';

interface BaseGroupWrapProps {
  title?: React.ReactNode;
}

export const BaseGroupWrap: React.FC<React.PropsWithChildren<BaseGroupWrapProps>> = ({ title, children }) => (
  <div tw="flex flex-col gap-1">
    {title ? <div tw="flex items-center">{title}</div> : null}
    {children}
  </div>
);
