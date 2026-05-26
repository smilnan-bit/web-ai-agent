import { SubCanvasRender } from '@flowgram.ai/free-container-plugin';
import React from 'react';
import { Inputs, Outputs } from '../../components/node-render/variable-list';
import { PrivateScopeProvider } from '@flowgram.ai/free-layout-editor';
import { ToolParamsTypeEnum } from '@/constants';

const VariableContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div tw="flex flex-row gap-4 ml-6">{children}</div>
);

export const BatchContent = () => {
  const formHeight = 115;
  return (
    <>
      <VariableContainer>
        <PrivateScopeProvider>
          <Inputs includeType={[ToolParamsTypeEnum.array]} />
        </PrivateScopeProvider>
      </VariableContainer>
      <SubCanvasRender offsetY={-formHeight} />
      <VariableContainer>
        <Outputs showAsArray={true} />
      </VariableContainer>
    </>
  );
};
