import React, { useContext } from 'react';
import { IsSidebarContext } from '../../context/sidebar-context';
import { FormHeader } from '../form-header';
import { FormContent } from '../form-content';

export const FormContain = ({ node, sideNode, nodeContentStyle = {} }) => {
  const isSidebar = useContext(IsSidebarContext);
  if (isSidebar) {
    return (
      <>
        <FormHeader />
        <div tw="flex-1 overflow-y-auto p-4 pb-8 bg-white" id="j-form-container-sidebar">
          <div tw="flex flex-col gap-2">{sideNode}</div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <FormHeader />
        <FormContent style={nodeContentStyle}>{node}</FormContent>
      </>
    );
  }
};
