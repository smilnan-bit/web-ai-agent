import { Checkbox, Divider } from 'antd';
import React, { useState } from 'react';
import { FormField, ParamsForm, useWatch, useForm } from '@form';
import {
  type CardConfig,
  DialogDirectOutputParam,
  getDialogOutParamByCotUiCard,
  getDialogOutParamByOrderCard,
  getDialogOutParamByProductCard,
} from './form';
import { IconShezhi } from '@/assets/icons';
import ExtraModal from './extra-modal';
import FormFragment from '../../components/form-fragment';
import TreeDataShower from '@/components/TreeDataShower';
import { CardTypeEnum } from './form';
import { DialogAnswerTypeEnum } from './type';
import { useNodeRenderContext } from '../../hooks';
import { useAvailableVariables, useWatchFormValues, type VariableDeclaration } from '@flowgram.ai/free-layout-editor';
import { ToolParamsTypeEnum } from '@/constants';
import { getRefVariable, getSourceVariable, isValidVarValue } from '../../utils/variables';

export const getDialogStaticOutputParam = ({
  typeValue,
  cardConfig,
  refVarAsOutput,
  availableVariables,
}: {
  typeValue: DialogAnswerTypeEnum;
  cardConfig?: CardConfig;
  refVarAsOutput?: boolean;
  availableVariables: VariableDeclaration[];
}) => {
  const transferCardCustomParams = (customParams: Record<string, any>) => {
    return customParams?.map((item: any) => {
      const sourceVariableSnapshot = getRefVariable(item.value);
      const customParam = {
        name: item.key,
        //effect表单初始化时取不到availableVariables，这里取type和subType从快照中取
        type: isValidVarValue(item.value) ? sourceVariableSnapshot?.type : ToolParamsTypeEnum.string,
        subType: isValidVarValue(item.value) ? sourceVariableSnapshot?.subType : undefined,
        subParams: getSourceVariable(item.value, availableVariables)?.meta.subParams,
      };
      return refVarAsOutput && isValidVarValue(item.value)
        ? {
            ...customParam,
            refVarAsOutput,
            keyPath: [sourceVariableSnapshot?.nodeId, ...(sourceVariableSnapshot?.namePath || [])],
          }
        : customParam;
    });
  };
  if (typeValue !== DialogAnswerTypeEnum.card) {
    return DialogDirectOutputParam;
  }
  if (cardConfig?.cardType === CardTypeEnum.product) {
    return getDialogOutParamByProductCard(transferCardCustomParams(cardConfig?.product?.customParams));
  }
  if (cardConfig?.cardType === CardTypeEnum.order) {
    return getDialogOutParamByOrderCard(transferCardCustomParams(cardConfig?.order?.customParams));
  }
  if (cardConfig?.cardType === CardTypeEnum.cotUi) {
    return getDialogOutParamByCotUiCard(cardConfig?.cotUi?.reportDataKeys ?? []);
  }
  return DialogDirectOutputParam;
};

export const getFullDialogOutputParam = ({
  data,
  refVarAsOutput,
  availableVariables,
}: {
  data: Record<string, any>;
  refVarAsOutput?: boolean; // 是否是引用前序节点的输出变量，是的话需要在创建输出变量时特殊处理
  availableVariables: VariableDeclaration[];
}) => {
  const { type, cardConfig, extraOutput, outputParam } = data || {};
  return data
    ? [
        ...getDialogStaticOutputParam({ typeValue: type, cardConfig, refVarAsOutput, availableVariables }),
        ...(type === DialogAnswerTypeEnum.direct && extraOutput && outputParam?.length ? outputParam : []),
      ]
    : [];
};

const Output = ({ type }: { type: DialogAnswerTypeEnum }) => {
  const nodeRender = useNodeRenderContext();
  const data = useWatchFormValues(nodeRender.node);
  const extraOutput = data?.extraOutput;
  const form = useForm();
  const [extraModalVisible, setExtraModalVisible] = useState(false);
  const availableVariables = useAvailableVariables();

  return (
    <>
      <FormFragment
        title="输出"
        extra={
          type === DialogAnswerTypeEnum.direct ? (
            <FormField name="extraOutput">
              {({ value, onChange }) => (
                <Checkbox
                  checked={!!value}
                  onChange={(e) => {
                    onChange(e.target.checked);
                  }}
                >
                  从用户的回复中提取字段
                </Checkbox>
              )}
            </FormField>
          ) : (
            <span onClick={() => setExtraModalVisible(true)} className="AiAgent-link" data-allow-click-in-readonly>
              <IconShezhi color="currentColor" size={16} />
            </span>
          )
        }
      >
        <div tw="pt-4">
          <TreeDataShower
            treeData={getDialogStaticOutputParam({ typeValue: type, cardConfig: data?.cardConfig, availableVariables })}
          />
          {extraOutput && type === DialogAnswerTypeEnum.direct ? (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontWeight: 500 }}>
                <span>设置需要从用户的回复中提取哪些字段</span>
                <span onClick={() => setExtraModalVisible(true)} className="AiAgent-link" data-allow-click-in-readonly>
                  <IconShezhi color="currentColor" size={16} />
                </span>
              </div>
              <ParamsForm withoutFragment />
            </>
          ) : null}
        </div>
      </FormFragment>
      <ExtraModal open={extraModalVisible} onCancel={() => setExtraModalVisible(false)} outform={form} />
    </>
  );
};

export default Output;
