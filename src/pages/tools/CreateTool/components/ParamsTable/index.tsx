import React from 'react';
import type { FormListTableProps, FormListTableRefType } from './FormListTable';
import FormListTable from './FormListTable';

const ParamsTable: React.ForwardRefRenderFunction<FormListTableRefType, FormListTableProps> = (props, ref) => {
  return <FormListTable {...props} ref={ref} />;
};

export default React.forwardRef(ParamsTable);
