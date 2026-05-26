import React, { useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import Ellipsis from '@ysf/ellipsis';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import KnowledgeModal from '@/components/KnowlegeModal';
import { FormFragmentFieldWrapper } from '../../form-components';
import type { KnowledgeFormData } from './form';
import type { AppsNS } from '@/types/Apps';
import { BasicInfoState } from '@/pages/Workflow/NewGraph/model';
import { Empty } from '../../form-components/empty';

type KnowledgeItemType = AppsNS.KnowledgeType;

const Knowledge: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const basicInfo = useRecoilValue(BasicInfoState);
  const requestParams = useMemo(() => ({ appId: -1, workflowId: basicInfo.workflowId }), [basicInfo.workflowId]);

  return (
    <FormFragmentFieldWrapper<KnowledgeFormData['knowledge']>
      name="knowledge"
      title="知识库"
      required
      extra={
        <span className="AiAgent-link">
          <PlusOutlined onClick={() => setVisible(true)} color="currentColor" />
        </span>
      }
    >
      {({ value = [], onChange }) => {
        const onDeleteItem = (deleteItem: KnowledgeItemType) =>
          onChange(value.filter((item) => item.spaceId !== deleteItem.spaceId));

        return (
          <>
            {value?.length === 0 ? (
              <Empty text="请添加知识库到此节点" />
            ) : (
              <div tw="flex flex-col gap-3">
                {value?.map((item) => (
                  <div key={item.spaceId} tw="flex justify-between gap-2">
                    <div>
                      <Ellipsis lines={1}>{item.spaceName}</Ellipsis>
                    </div>
                    <MinusCircleOutlined
                      onClick={() => onDeleteItem(item)}
                      tw="text-[16px] text-[rgba(0, 0, 0, 0.45)] hover:text-[#337eff] active:text-[#215ed9]"
                    />
                  </div>
                ))}
              </div>
            )}
            <KnowledgeModal
              open={visible}
              onAdd={(item) => onChange([...(value || []), item])}
              onDelete={onDeleteItem}
              hasAddedList={value}
              requestParams={requestParams}
              onCancel={() => setVisible(false)}
              onOk={() => setVisible(false)}
            />
          </>
        );
      }}
    </FormFragmentFieldWrapper>
  );
};

export default Knowledge;
