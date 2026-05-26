/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { useCallback } from 'react';
import { Typography } from '@douyinfe/semi-ui';
import type { ValidateError } from '../../services';

type BaseItemWrapProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const BaseItemWrap: React.FC<React.PropsWithChildren<BaseItemWrapProps>> = ({ className, ...props }) => (
  <div
    tw="border border-[rgba(82,100,154,0.13)] rounded-lg shadow-[0px_2px_6px_0px_rgba(0,0,0,0.04),0px_4px_12px_0px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-[rgba(77,77,77,0.05)] active:bg-[rgba(77,77,77,0.15)]"
    className={className}
    {...props}
  ></div>
);

interface BaseItemProps {
  problem: ValidateError;
  title: string;
  icon: React.ReactNode;
  popover?: React.ReactNode;
  onClick: (p: ValidateError) => void;
}

const { Text } = Typography;

export const BaseItem: React.FC<BaseItemProps> = ({ problem, title, icon, popover, onClick }) => {
  const { errorInfo, errorLevel } = problem;
  const handleClick = useCallback(() => {
    onClick(problem);
  }, [problem, onClick]);

  return (
    <div tw="flex gap-2 hover:bg-[#F7F8FA] rounded-[2px] p-2 cursor-pointer" onClick={handleClick}>
      <div tw="text-[18px]">{icon}</div>
      <div tw="flex-1">
        <div tw="flex gap-[2px] flex-col text-[14px] leading-[20px] font-normal">
          <div tw="font-medium">{title}</div>
          <div tw="text-[rgba(229,50,65,1)]">{errorInfo}</div>
        </div>
      </div>
    </div>
  );
};

export const TextItem: React.FC<{
  problem: ValidateError;
  onClick: (p: ValidateError) => void;
}> = ({ problem, onClick }) => {
  const { errorInfo, errorLevel } = problem;

  const handleClick = useCallback(() => {
    onClick(problem);
  }, [problem, onClick]);

  return (
    <BaseItemWrap tw="flex p-2 py-2 px-2.5" onClick={handleClick}>
      <Text size="small" style={{ color: errorLevel === 'error' ? 'rgba(229,50,65,1)' : 'rgba(255,115,0,1)' }}>
        {errorInfo}
      </Text>
    </BaseItemWrap>
  );
};
