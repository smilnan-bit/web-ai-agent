import React from 'react';
import { useWatch } from '@form';
import { Shanchu } from '@/assets/icons';
import VarTable from './var-table';
import RelationSelect from './relation-select';
import PortEdit from './port-edit';
import './index.less';
import type { ConditionFormData } from '../form';
import FormFragment from '../../../components/form-fragment';
const SingleCondition: React.FC<{
  index: number;
  name: string;
  removeCondition: (index: number | number[]) => void;
  canDelete?: boolean;
}> = ({ index, canDelete = true, name, removeCondition }) => {
  const title = index === 0 ? '如果' : '否则如果';
  const varTableData = useWatch<ConditionFormData['conditions'][number]['params']>(`${name}.params`);

  return (
    <FormFragment
      title={
        <>
          {title}
          <PortEdit name={`${name}.portTitle`} />
        </>
      }
      extra={
        canDelete && (
          <Shanchu
            className="delete-condition"
            onClick={() => {
              removeCondition(index);
            }}
            color={'currentColor'}
            size={16}
          />
        )
      }
    >
      <div className="SingleCondition">
        {varTableData?.length > 1 && <RelationSelect formItemName={`${name}.relation`} />}
        <VarTable formListName={`${name}.params`} />
      </div>
    </FormFragment>
  );
};

export default SingleCondition;
