import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { genNodeFormConfig } from '../utils';
import { SubWorkflowNodeErrorEnum, type SubWorkflowNodeData } from './types';
import { EdgeType, INPUT_PARAM_FILTER_DEFAULT, SimpleParamTypeEnum } from '../../constants';
import { IconGongzuoliu } from '@/assets/icons';

export const SubWorkflowNodeRegistry = genNodeFormConfig<Partial<SubWorkflowNodeData>>({
  type: WorkflowNodeType.SubWorkflow,
  config: {
    info: {
      title: '工作流',
      icon: IconGongzuoliu,
      bgColor: 'rgba(123, 97, 255, 0.04)',
    },
    meta: {
      type: WorkflowNodeType.SubWorkflow,
      defaultPorts: [{ type: 'input' }],
      useDynamicPort: true,
      expandable: false,
      size: {
        width: 360,
        height: 144,
      },
      addModal: true,
      get maxNum() {
        // 从 window 全局变量获取，避免在模块顶层直接访问 Recoil
        return window.__GLOBAL_CONFIG__?.subWorkflowNodeMaxCount || 10;
      },
      getBackendEdgeData: ({ edge, sourceNode }) => {
        const edgeId = edge.edgeId;
        return {
          edgeId,
          edgeName: edgeId,
          startNode: sourceNode.id,
          endNode: edge.targetNodeID,
          edgeType: edge.sourcePortID === 'subflow-output-error' ? EdgeType.error : EdgeType.normal,
          index: edge.sourcePortID === 'subflow-output-error' ? 1 : 0,
        };
      },
      // 根据 getBackendEdgeData 生成的服务端 edgeData 获取 portId
      getPortIdFromEdgeData: (edgeData) => {
        const { edgeType, index } = edgeData || {};
        // 如果 edgeType 是 error 或者 index 是 1，则返回错误输出端口
        if (edgeType === EdgeType.error || index === 1) {
          return 'subflow-output-error';
        }
        // 否则返回正常输出端口
        return 'subflow-output';
      },
      fieldsToNodeData(fields: Record<string, any>) {
        const { inputParam = [], ...otherFields } = fields || {};
        const defaultInputParam = INPUT_PARAM_FILTER_DEFAULT.map((item) => ({
          name: item.name,
          type: item.type,
          valueType: SimpleParamTypeEnum.input,
          value: '',
        }));
        return {
          ...otherFields,
          inputParam: [...defaultInputParam, ...inputParam],
        };
      },
    },
  },
  formMeta,
  formData: {
    refWorkflowId: undefined,
    workflowName: undefined,
    workflowDesc: 'desc',
    inputParam: [],
    outputParam: [],
    settingOnError: {
      processType: SubWorkflowNodeErrorEnum.break,
    },
  },
});

export { SubWorkflowContent } from './node-content';
