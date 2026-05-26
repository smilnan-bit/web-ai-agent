import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { IconDuihua } from '../icons';
import { v4 as uuidv4 } from 'uuid';
import { EdgeType } from '../../constants';
import { CardTypeEnum } from '@/pages/AppList/components/EditContent/BindCard/constants';
import { text2object } from '@/utils';
import { genNodeFormConfig } from '../utils';
import { getSourceVariable, isValidVarValue } from '../../utils/variables';
import { ToolParamsTypeEnum } from '@/constants';
import type { DialogFormData } from './form';
import { DialogAnswerTypeEnum } from './type';
import { genOptionItem } from './fixed-btn';
import type { VariableDeclaration } from '@flowgram.ai/free-layout-editor';
import { getFullDialogOutputParam } from './output';

export const DialogNodeRegistry = genNodeFormConfig<DialogFormData>({
  type: WorkflowNodeType.Dialog,
  config: {
    info: {
      title: '对话',
      icon: IconDuihua,
      bgColor: 'rgba(245, 153, 61, 0.04)',
    },
    meta: {
      type: WorkflowNodeType.Dialog,
      defaultPorts: [{ type: 'input' }],
      useDynamicPort: true,
      expandable: false, // disable expanded
      size: {
        width: 360,
        height: 174,
      },
      getBackendEdgeData: ({ edge, sourceNode }) => {
        const { optionParamName, cardConfig, type, options } = sourceNode.data;
        const getDirectValueByType = () => {
          switch (type) {
            case DialogAnswerTypeEnum.direct:
              return 'otherwise';
            case DialogAnswerTypeEnum.dynamic:
              return optionParamName;
            case DialogAnswerTypeEnum.card:
              if (cardConfig?.cardType === CardTypeEnum.product) return cardConfig?.product?.title;
              if (cardConfig?.cardType === CardTypeEnum.order) return cardConfig?.order?.orderId;
              // a2ui 卡片走单一 direct 端口，optionValue 用 specId 作标识
              if (cardConfig?.cardType === CardTypeEnum.cotUi) return cardConfig?.cotUi?.specId ?? '';
              return '';
            default:
              return '';
          }
        };
        const getRelationShipValue = () => {
          const portIDArray = `${edge.sourcePortID}`.split('-');
          switch (portIDArray[1]) {
            //固定选项
            case 'options':
              return options.find(({ id }) => id === edge.sourcePortID)?.value;
            //直接输出
            case 'direct':
              return getDirectValueByType();
            //其他
            case 'otherwise':
              return 'otherwise';
            default:
              return '';
          }
        };

        const relationShipValue = getRelationShipValue();
        const edgeId = edge.edgeId;
        return {
          edgeId,
          edgeName: edgeId,
          startNode: sourceNode.id,
          endNode: edge.targetNodeID,
          edgeType: EdgeType.dialogOptions,
          // otherWise 的分支排在后面
          index: relationShipValue === 'otherwise' ? 1 : 0,
          relationship: JSON.stringify({
            optionValue: relationShipValue,
            otherWise: relationShipValue === 'otherwise',
            type: type,
          }),
        };
      },
      // 根据 getBackendEdgeData 生成的服务端 edgeData 反推 portId
      // edgeData.relationship 结构：
      // { optionValue: string, otherWise: boolean, type: DialogAnswerTypeEnum }
      // 端口规则：
      // - 固定按钮：options[i].id 作为 portId，relationship.optionValue 为 options[i].value
      // - 直接 / 动态 / 卡片主输出（含 a2ui）：portId 为 `dialog-direct-${type}`
      // - 其他分支：portId 为 'dialog-otherwise'
      getPortIdFromEdgeData: (edgeData, sourceNode) => {
        const relationship = edgeData?.relationship;
        if (!relationship) {
          return 'dialog-otherwise';
        }

        let parsed: { optionValue?: string; otherWise?: boolean; type?: number } = {};
        try {
          parsed = text2object(relationship);
        } catch {
          // 解析失败时兜底为 otherwise
          return 'dialog-otherwise';
        }

        const { optionValue, otherWise, type } = parsed;
        const { options } = sourceNode?.data || {};

        // 0. 直接输出：端口 id 规则为 dialog-direct-0
        if (type === DialogAnswerTypeEnum.direct) {
          return `dialog-direct-${type}`;
        }

        // 1. otherWise = true -> 「其他」分支
        if (otherWise) {
          return 'dialog-otherwise';
        }

        // 2. 固定按钮：从 options 中通过 value 反查 id
        if (type === DialogAnswerTypeEnum.fixed && Array.isArray(options)) {
          const target = options.find((opt: any) => opt?.value === optionValue);
          if (target?.id) {
            return target.id;
          }
        }

        // 3. 直接 / 动态 / 卡片主输出（包括 a2ui 卡片）：端口 id 规则为 dialog-direct-{type}
        if (type === DialogAnswerTypeEnum.dynamic || type === DialogAnswerTypeEnum.card) {
          return `dialog-direct-${type}`;
        }

        // 4. 兜底：当作「其他」分支处理
        return 'dialog-otherwise';
      },
      sortEdges: (a, b) => {
        const aisOtherwise = text2object(a.relationship).otherWise;
        const bisOtherwise = text2object(b.relationship).otherWise;
        // 是otherWise 的放在最后
        if (aisOtherwise) return 1;
        if (bisOtherwise) return -1;
        // 其他按 index 从小到大排序
        return 0;
      },
      fieldsToNodeData(data: Record<string, any>, availableVariables: VariableDeclaration[]) {
        const { type, extraOutput, cardOutputStyle, askUserLimit, options } = data || {};
        const newdata = {
          ...data,
          options: (options || []).map(({ value }) => value),
          askUserLimit: type !== DialogAnswerTypeEnum.direct || extraOutput ? askUserLimit : undefined,
          outputParam: getFullDialogOutputParam({ data, availableVariables }), // 默认值拼接用户设置的输出参数
          cardOutputStyle: cardOutputStyle, // 卡片输出样式
        };
        return newdata;
      },
      checkVariable: ({ data, availableVariables }) => {
        let isOptionParamDefined = true;
        if (data.type === DialogAnswerTypeEnum.dynamic && data.optionParamName) {
          const sourceVariable = getSourceVariable(data.optionParamName, availableVariables);
          if (!sourceVariable || sourceVariable.meta.type !== ToolParamsTypeEnum.array) {
            isOptionParamDefined = false;
          }
        }
        let cardConfigAllDefined = true;
        if (data.type === DialogAnswerTypeEnum.card) {
          const cardType = data.cardConfig?.cardType;
          if (cardType === CardTypeEnum.cotUi) {
            // cotUi：对引用类型的 binding 检查变量是否存在；输入类型的不用检查
            const bindings = data.cardConfig?.cotUi?.bindings || {};
            for (const binding of Object.values(bindings)) {
              const { valueType, value } = (binding as { valueType?: number; value?: string }) || {};
              // 0=input 文本输入，1=quote 引用变量
              if (valueType !== 1) continue;
              if (!isValidVarValue(value)) continue;
              const sourceVariable = getSourceVariable(value as string, availableVariables);
              if (!sourceVariable) {
                cardConfigAllDefined = false;
                break;
              }
            }
          } else if (cardType && cardType !== CardTypeEnum.notUse) {
            const targetConfig = data.cardConfig?.[cardType];
            if (targetConfig) {
              for (const item of Object.values(targetConfig)) {
                if (!isValidVarValue(item)) continue;
                const sourceVariable = getSourceVariable(item, availableVariables);
                if (!sourceVariable) {
                  cardConfigAllDefined = false;
                  break;
                }
              }
            }
          }
        }
        return isOptionParamDefined && cardConfigAllDefined;
      },
    },
  },
  formMeta,
  formData: {
    content: '',
    type: DialogAnswerTypeEnum.direct, // 默认直接回答
    cardOutputStyle: 0, // 默认样式一
    options: [{ ...genOptionItem() }],
  },
});

export { DialogContent } from './node-content';
