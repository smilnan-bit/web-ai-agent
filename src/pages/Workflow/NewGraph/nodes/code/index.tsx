import { WorkflowNodeType } from '../constants';
import { formMeta } from './form-meta';
import { codeNodeDefaultOutputParam, CodeNodeErrorEnum, defaultPythonCode } from './const';
import { IconDaima } from '../icons';
import { v4 as uuidv4 } from 'uuid';
import { EdgeType } from '../../constants';
import { genNodeFormConfig } from '../utils';
import { EditorLanguageEnum, type CodeFormData } from './form';

export const CodeNodeRegistry = genNodeFormConfig<CodeFormData>({
  type: WorkflowNodeType.Code,
  config: {
    info: {
      title: '代码',
      icon: IconDaima,
      description: '支持代码执行任务',
      bgColor: 'rgba(31, 194, 209, 0.04)',
    },
    meta: {
      type: WorkflowNodeType.Code,
      defaultPorts: [{ type: 'input' }],
      useDynamicPort: true,
      expandable: false,
      size: {
        width: 360,
        height: 144,
      },
      maxNum: 50,
      checkData(data) {
        if (!data?.code?.trim() || !data.outputParam?.length) return false;
        return true;
      },
      getBackendEdgeData: ({ edge, sourceNode }) => {
        const edgeId = edge.edgeId;
        return {
          edgeId,
          edgeName: edgeId,
          startNode: sourceNode.id,
          endNode: edge.targetNodeID,
          edgeType: edge.sourcePortID === 'code-output-error' ? EdgeType.error : EdgeType.normal,
          index: edge.sourcePortID === 'code-output-error' ? 1 : 0,
        };
      },
      // 根据 getBackendEdgeData 生成的服务端 edgeData 获取 portId
      getPortIdFromEdgeData: (edgeData) => {
        const { edgeType, index } = edgeData || {};
        // 如果 edgeType 是 error 或者 index 是 1，则返回错误输出端口
        if (edgeType === EdgeType.error || index === 1) {
          return 'code-output-error';
        }
        // 否则返回正常输出端口
        return 'code-output';
      },
      sortEdges: (a, b) => {
        if (a.edgeType === EdgeType.error) return 1;
        if (b.edgeType === EdgeType.error) return -1;
        return 0;
      },
      fieldsToNodeData(fields: Record<string, any>) {
        const { outputParam, settingOnError } = fields || {};
        return {
          ...fields,
          outputParam: [
            ...(outputParam || []),
            ...([CodeNodeErrorEnum.returnContent, CodeNodeErrorEnum.error].includes(settingOnError?.processType)
              ? codeNodeDefaultOutputParam
              : []),
          ],
        };
      },
    },
  },
  formMeta: formMeta,
  formData: {
    code: defaultPythonCode,
    codeLanguage: EditorLanguageEnum.python3,
    settingOnError: {
      processType: CodeNodeErrorEnum.break,
      timeoutMs: 500,
      retryTimes: 0,
    },
  },
});

export { CodeContent } from './node-content';
