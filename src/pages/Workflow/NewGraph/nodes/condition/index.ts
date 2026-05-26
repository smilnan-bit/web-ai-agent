import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';
import { EdgeType } from '../../constants';
import { SimpleParamTypeEnum } from '../../constants';
import { genNodeFormConfig } from '../utils';
import type { ConditionFormData } from './form';
import { IconTiaojianpanduan } from '../icons';

export const ConditionNodeRegistry = genNodeFormConfig<ConditionFormData>({
  type: WorkflowNodeType.Condition,
  config: {
    info: {
      title: '条件判断',
      icon: IconTiaojianpanduan,
      bgColor: 'rgba(77, 136, 255, 0.04)',
    },
    meta: {
      defaultPorts: [{ type: 'input' }],
      // Condition Outputs use dynamic port
      useDynamicPort: true,
      expandable: false, // disable expanded
      size: {
        width: 360,
        height: 130,
      },
      getBackendEdgeData: ({ edge, sourceNode }) => {
        const id = edge.sourcePortID;
        const { conditions, lastPortTitle } = sourceNode.data;
        const portIndex = conditions.findIndex((condition) => condition.id === id);
        const getRelationShip = (portIdx: number) => {
          const { portTitle, id, ...relationValue } = conditions[portIdx];
          return JSON.stringify(relationValue);
        };
        const isElseBranch = portIndex === -1;
        return {
          index: isElseBranch ? 1000 : portIndex,
          edgeId: edge.edgeId,
          edgeName: isElseBranch ? lastPortTitle || `优先级${conditions.length + 1}` : conditions[portIndex].portTitle,
          startNode: sourceNode.id,
          endNode: edge.targetNodeID,
          edgeType: EdgeType.condition,
          // 不是最后一个分支都传 relationship
          relationship: isElseBranch ? '' : getRelationShip(portIndex),
        };
      },
      // 根据 getBackendEdgeData 生成的服务端 edgeData 反推 portId
      // edgeData 是后端存储的一条边数据
      // sourceNode 是当前条件节点（包含 conditions、lastPortTitle 等信息）
      getPortIdFromEdgeData: (edgeData, sourceNode) => {
        const { data } = sourceNode || {};
        const conditions = data?.conditions || [];

        // 兜底：如果没有条件配置，无法映射，直接返回 else 分支 portId
        if (!Array.isArray(conditions) || conditions.length === 0) {
          return 'condition-else';
        }

        const { index, relationship } = edgeData || {};

        // 1. 根据 relationship 判断：没有 relationship 的就是「否则」分支
        if (!relationship || relationship === '') {
          return 'condition-else';
        }

        // 2. 优先按 index 从 conditions 中取对应的分支 id（与 getBackendEdgeData 对称）
        if (typeof index === 'number' && index >= 0 && index < conditions.length) {
          return conditions[index].id;
        }

        // 3. 如果 index 异常，尝试通过 relationship 做精确匹配
        try {
          const targetRel = JSON.parse(relationship);
          const match = conditions.find((condition) => {
            const { portTitle, id, ...rest } = condition;
            return JSON.stringify(rest) === JSON.stringify(targetRel);
          });
          if (match) {
            return match.id;
          }
        } catch {
          // ignore JSON parse error，走兜底逻辑
        }

        // 4. 兜底：找不到匹配条件时，当作「否则」分支处理
        return 'condition-else';
      },
      sortEdges: (a, b) => {
        if (a.index === undefined || b.index === undefined) return 0;
        // index=-1 的放在最后
        if (a.index === -1) return 1;
        if (b.index === -1) return -1;
        // 其他按 index 从小到大排序
        return a.index - b.index;
      },
    },
  },
  formMeta,
  formData: {
    conditions: [
      {
        portTitle: '优先级1',
        params: [{ valueType: SimpleParamTypeEnum.quote }],
        relation: 0,
        id: nanoid(),
      },
    ],
    lastPortTitle: '优先级2',
  },
});

export { ConditionContent } from './node-content';
