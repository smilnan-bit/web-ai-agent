import React, { createContext, useContext, useMemo } from 'react';

export interface VariableSelectorContextValue {
  skipVariable?: (variable: Record<string, unknown>) => boolean;
}

const VariableSelectorContext = createContext<VariableSelectorContextValue>({});

export const useVariableSelectorContext = () => useContext(VariableSelectorContext);

export const VariableSelectorProvider: React.FC<VariableSelectorContextValue & { children: React.ReactNode }> = ({
  skipVariable,
  children,
}) => {
  const value = useMemo(() => ({ skipVariable }), [skipVariable]);
  return <VariableSelectorContext.Provider value={value}>{children}</VariableSelectorContext.Provider>;
};
