import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useClientContext,
  getNodeForm,
  WorkflowNodeLinesData,
  WorkflowNodePortsData,
  getNodeScope,
} from '@flowgram.ai/free-layout-editor';
import type { FlowNodeEntity, FlowDocumentJSON } from '@flowgram.ai/free-layout-editor';
import type { ValidateError } from '../services';
import { WorkflowNodeType } from '../nodes';
import { ValidateErrorLevelEnum, ValidateErrorTypeEnum } from '../services/validation-service';

export interface WorkflowValidationResult {
  hasError: boolean;
  hasWarning: boolean;
  errorCount: number;
  warningCount: number;
  nodeErrors: Record<string, ValidateError[]>;
  allErrors: ValidateError[];
}

export const useWorkflowCheck = () => {
  const clientContext = useClientContext();

  const getAllNodes = useCallback(() => {
    return clientContext.document.getAllNodes();
  }, [clientContext]);

  const getDocument = useCallback((): FlowDocumentJSON => {
    return clientContext.document.toJSON();
  }, [clientContext]);

  // 节点校验规则
  const nodeValidationRules = useMemo(
    () => [
      // 表单校验
      {
        name: 'form-validation',
        validate: async (node: FlowNodeEntity) => {
          if (node.getNodeMeta().skipCheck) {
            return null;
          }
          const form = getNodeForm(node);
          const meta = node.getNodeMeta();
          // TODO 看看以后能不能都干掉 dialog bindCard在antdform
          const { checkVariable } = meta; //用新的也得校验
          if (checkVariable) {
            const availableVariables = getNodeScope(node).available.variables;
            if (!checkVariable({ data: form?.values, availableVariables })) {
              return {
                nodeId: node.id,
                errorInfo: '节点变量未定义',
                errorLevel: ValidateErrorLevelEnum.Error,
                errorType: ValidateErrorTypeEnum.Node,
              };
            }
          }
          const result = await form?.validate();
          // 引用变量未定义 需要根据form的validate结果来判断inputParam.*.value是否存在错误
          return result
            ? null
            : {
                nodeId: node.id,
                errorInfo: '节点表单配置有误',
                errorLevel: ValidateErrorLevelEnum.Error,
                errorType: ValidateErrorTypeEnum.Node,
              };
        },
      },
      // 孤立节点校验
      {
        name: 'isolated-node',
        validate: (node: FlowNodeEntity) => {
          // 开始节点不需要入边
          if (
            [WorkflowNodeType.Start, WorkflowNodeType.BlockStart].includes(node.getNodeMeta().type) ||
            node.getNodeMeta().skipCheck
          ) {
            return null;
          }

          // 尝试获取节点的输入连线
          try {
            const linesData = node.getData(WorkflowNodeLinesData);
            if (linesData && typeof linesData === 'object') {
              const inputLines = (linesData as any).inputLines;
              if (!inputLines || inputLines.length === 0) {
                return {
                  nodeId: node.id,
                  errorInfo: '节点缺少入边连接',
                  errorLevel: ValidateErrorLevelEnum.Error,
                  errorType: ValidateErrorTypeEnum.Line,
                };
              }
            }
          } catch (error) {
            console.error(error);
            // 如果获取数据失败，返回警告
            return {
              nodeId: node.id,
              errorInfo: '无法获取节点连接信息',
              errorLevel: ValidateErrorLevelEnum.Error,
              errorType: ValidateErrorTypeEnum.Line,
            };
          }
          return null;
        },
      },
      // 叶子节点校验
      {
        name: 'leaf-node',
        validate: (node: FlowNodeEntity) => {
          // 结束节点不需要出边
          if (
            [WorkflowNodeType.End, WorkflowNodeType.BlockEnd].includes(node.getNodeMeta().type) ||
            node.getNodeMeta().skipCheck
          ) {
            return null;
          }

          // 尝试获取节点的输出连线
          try {
            const ports = node.getData(WorkflowNodePortsData);
            const outputPorts = ports?.outputPorts || [];
            const linesData = node.getData(WorkflowNodeLinesData);
            if (linesData && typeof linesData === 'object') {
              const outputLines = (linesData as any).outputLines;
              if (!outputLines || outputLines.length === 0 || outputPorts.length !== outputLines.length) {
                return {
                  nodeId: node.id,
                  errorInfo: '节点缺少出边连接',
                  errorLevel: ValidateErrorLevelEnum.Error,
                  errorType: ValidateErrorTypeEnum.Line,
                };
              }
            }
          } catch (error) {
            console.error(error);
            // 如果获取数据失败，返回警告
            return {
              nodeId: node.id,
              errorInfo: '无法获取节点连接信息',
              errorLevel: ValidateErrorLevelEnum.Error,
              errorType: ValidateErrorTypeEnum.Line,
            };
          }
          return null;
        },
      },
    ],
    [],
  );

  const validateNode = useCallback(
    async (node: FlowNodeEntity): Promise<ValidateError[]> => {
      const errors: ValidateError[] = [];

      // 执行所有校验规则
      for (const rule of nodeValidationRules) {
        const result = await rule.validate(node);
        if (result) {
          errors.push({
            errorInfo: result.errorInfo,
            errorLevel: result.errorLevel,
            errorType: result.errorType,
            nodeId: node.id,
          });
        }
      }

      return errors;
    },
    [nodeValidationRules],
  );

  const validateWorkflow = useCallback(async (): Promise<WorkflowValidationResult> => {
    const allNodes = getAllNodes();

    const nodeErrors: Record<string, ValidateError[]> = {};
    let errorCount = 0;
    let warningCount = 0;

    for (const node of allNodes) {
      const nodeValidationErrors = await validateNode(node);

      if (nodeValidationErrors.length > 0) {
        nodeErrors[node.id] = nodeValidationErrors;

        for (const error of nodeValidationErrors) {
          if (error.errorLevel === ValidateErrorLevelEnum.Error) {
            errorCount++;
          } else if (error.errorLevel === ValidateErrorLevelEnum.Warning) {
            warningCount++;
          }
        }
      }
    }

    const allErrors: ValidateError[] = Object.values(nodeErrors).flat();

    return {
      hasError: errorCount > 0,
      hasWarning: warningCount > 0,
      errorCount,
      warningCount,
      nodeErrors,
      allErrors,
    };
  }, [getAllNodes, validateNode]);

  const validateSpecificNode = useCallback(
    async (nodeId: string): Promise<ValidateError[]> => {
      const node = getAllNodes().find((n) => n.id === nodeId);
      if (!node) {
        return [];
      }
      return await validateNode(node);
    },
    [getAllNodes, validateNode],
  );

  const hasNodeError = useCallback(
    async (nodeId: string): Promise<boolean> => {
      const errors = await validateSpecificNode(nodeId);
      return errors.some((error) => error.errorLevel === ValidateErrorLevelEnum.Error);
    },
    [validateSpecificNode],
  );

  const hasNodeWarning = useCallback(
    async (nodeId: string): Promise<boolean> => {
      const errors = await validateSpecificNode(nodeId);
      return errors.some((error) => error.errorLevel === ValidateErrorLevelEnum.Warning);
    },
    [validateSpecificNode],
  );

  const getNodeErrors = useCallback(
    async (nodeId: string): Promise<string[]> => {
      const errors = await validateSpecificNode(nodeId);
      return errors.map((error) => error.errorInfo);
    },
    [validateSpecificNode],
  );

  const getNodeWarnings = useCallback(
    async (nodeId: string): Promise<string[]> => {
      const errors = await validateSpecificNode(nodeId);
      return errors
        .filter((error) => error.errorLevel === ValidateErrorLevelEnum.Warning)
        .map((error) => error.errorInfo);
    },
    [validateSpecificNode],
  );

  return {
    getAllNodes,
    getDocument,
    validateNode,
    validateWorkflow,
    validateSpecificNode,
    hasNodeError,
    hasNodeWarning,
    getNodeErrors,
    getNodeWarnings,
  };
};
