import React from 'react';
import { ParamsForm } from '@form/input-output';
const FormContent = () => {
  return (
    <>
      <ParamsForm name="inputParam" disabledIndexs={[0, 1]} defaultItem={{ required: true }} title="输入" />
    </>
  );
};

export default FormContent;
