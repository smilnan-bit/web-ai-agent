/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

export const Header: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`box-border flex justify-start items-center w-full gap-2 rounded-t-lg cursor-move bg-gradient-to-b from-[#f2f2ff] to-[rgb(251,251,251)] overflow-hidden p-2 ${className}`}
  >
    {children}
  </div>
);

export const Operators: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`flex items-center gap-1 ${className}`}>{children}</div>;
