import React, { createContext, useContext } from 'react';

type NamePath = string | number | (string | number)[];
export type CustomSetFieldValue = (name: NamePath, value: unknown) => void;
export type CustomSetFieldsValue = (data: Record<string, unknown>) => void;

export type ContentWrapperContextValue = {
  customSetField: CustomSetFieldValue; //antd的setFieldValue不会触发onValuesChange,自定义一个
  customSetFields: CustomSetFieldsValue;
};

export const ContentWrapperCtx = createContext<ContentWrapperContextValue | undefined>(undefined);

export const ContentWrapperProvider: React.FC<{ value: ContentWrapperContextValue; children: React.ReactNode }> = ({
  value,
  children,
}) => {
  return <ContentWrapperCtx.Provider value={value}>{children}</ContentWrapperCtx.Provider>;
};
