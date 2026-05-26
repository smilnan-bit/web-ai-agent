import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { IconHuifu } from '../icons';
import { genNodeFormConfig } from '../utils';
import { FormReplyTypeEnum } from './form';
import type { ReplyFormData } from './form';
import { CardTypeEnum } from '@/pages/AppList/components/EditContent/BindCard/constants';
import { getSourceVariable, isValidVarValue } from '../../utils/variables';

export const ReplyNodeRegistry = genNodeFormConfig<ReplyFormData>({
  type: WorkflowNodeType.Reply,
  config: {
    info: {
      title: '回复',
      icon: IconHuifu,
      bgColor: 'rgba(125, 125, 250, 0.04)',
    },
    meta: {
      size: {
        width: 360,
        height: 114,
      },
      checkVariable: ({ data, availableVariables }) => {
        let cardConfigAllDefined = true;
        if (data.type === FormReplyTypeEnum.card) {
          const cardType = data.cardConfig?.cardType;
          const targetConfig = cardType && cardType !== CardTypeEnum.notUse ? data.cardConfig?.[cardType] : undefined;
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
        return cardConfigAllDefined;
      },
    },
  },
  formMeta,
  formData: {
    type: FormReplyTypeEnum.text,
    cardOutputStyle: 0, // 默认样式一
    content: '',
  },
});
