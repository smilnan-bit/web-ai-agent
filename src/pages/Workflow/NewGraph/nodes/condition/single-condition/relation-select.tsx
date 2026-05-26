import React from 'react';
import EnumSelect from '@/components/EnumSelect';
import { ConditionRelationConfig } from '../const';
import { FormField } from '../../../form-components';

const RelationSelect: React.FC<{ formItemName: string }> = ({ formItemName }) => {
  return (
    <div className="RelationSelect">
      <div className="RelationSelect-top">
        <div className="RelationSelect-top-borderbox" />
      </div>
      <FormField name={formItemName} style={{ marginBottom: 0 }}>
        <EnumSelect optionsConfig={ConditionRelationConfig} hasAll={false} bordered={false} />
      </FormField>
      <div className="RelationSelect-bottom">
        <div className="RelationSelect-bottom-borderbox" />
      </div>
    </div>
  );
};

export default RelationSelect;
