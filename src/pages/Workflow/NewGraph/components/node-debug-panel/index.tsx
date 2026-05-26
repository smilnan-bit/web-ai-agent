import { Button, Form } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import './index.less';
import RenderInput from '@/components/RenderInput';
import JsonTreeView from '@/components/JsonTreeView';
import { cleanObject, text2object } from '@/utils';
import type { InputParamsType } from '../../form-components';
import { SimpleParamTypeEnum } from '../../constants';

export interface NodeDebugPanelProps {
  inputParam?: InputParamsType[];
  onExecute: (params: Record<string, any>) => Promise<any>;
  onClose: () => void;
  disabled?: boolean;
  /** 流式消息输出（用于 SSE） */
  streamingOutput?: string;
  /** 是否正在流式输出 */
  isStreaming?: boolean;
}

export const NodeDebugPanel: React.FC<NodeDebugPanelProps> = ({
  inputParam = [],
  onExecute,
  onClose,
  disabled = false,
  streamingOutput,
  isStreaming = false,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const initialValues = useMemo(() => {
    const obj: Record<string, any> = {};
    inputParam?.forEach((param) => {
      if (param.valueType === SimpleParamTypeEnum.input) {
        obj[param.name] = param.value;
      }
    });
    return obj;
  }, [inputParam]);

  const [debugInput, setDebugInput] = useState<Record<string, any>>(initialValues);
  const [debugOutput, setDebugOutput] = useState<Record<string, any>>();

  const onValidateAndRun = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      // 清空之前的输出
      setDebugOutput(undefined);
      const result = await onExecute(debugInput);
      // 如果不是流式输出，设置结果
      if (result !== undefined) {
        setDebugOutput(result);
      }
    } catch (error) {
      console.error('执行节点测试失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 当 inputParam 变化时重置
  useEffect(() => {
    setDebugInput(initialValues);
  }, [initialValues]);

  return (
    <div className="NodeDebugPanel">
      <div className="NodeDebugPanel-header">
        <span className="NodeDebugPanel-title">试运行</span>
        <Button type="text" size="small" onClick={onClose} className="NodeDebugPanel-close">
          ✕
        </Button>
      </div>
      <div className="NodeDebugPanel-body">
        {inputParam?.length > 0 && (
          <div className="NodeDebugPanel-content">
            <div className="NodeDebugPanel-content-title">试运行输入</div>
            <RenderInput
              inputParam={inputParam}
              form={form}
              initialValues={initialValues}
              onValuesChange={(changedValues, allValues) => {
                const cleanValues = cleanObject(allValues);
                setDebugInput(cleanValues);
              }}
            />
          </div>
        )}
        <div className="NodeDebugPanel-content">
          <div className="NodeDebugPanel-content-title">运行结果</div>
          <div tw="mb-2">输入</div>
          {debugInput && Object.keys(debugInput).length > 0 ? (
            <div className="NodeDebugPanel-jsonviewer">
              <JsonTreeView src={debugInput} />
            </div>
          ) : (
            <div className="NodeDebugPanel-empty">暂无数据</div>
          )}
          <div tw="mt-4 mb-2">输出</div>
          {streamingOutput && (isStreaming || !text2object(streamingOutput)) ? (
            // 流式输出：显示纯文本
            <div className="NodeDebugPanel-streaming">
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{streamingOutput}</pre>
              {isStreaming && <span className="NodeDebugPanel-streaming-cursor">▋</span>}
            </div>
          ) : debugOutput || streamingOutput ? (
            // 非流式输出：显示 JSON 树
            <div className="NodeDebugPanel-jsonviewer">
              <JsonTreeView src={debugOutput || text2object(streamingOutput)} />
            </div>
          ) : (
            <div className="NodeDebugPanel-empty">暂无数据</div>
          )}
        </div>
      </div>
      <div className="NodeDebugPanel-bottom">
        <Button
          type="primary"
          style={{ width: '100%' }}
          onClick={onValidateAndRun}
          disabled={disabled}
          loading={loading || isStreaming}
        >
          <CaretRightOutlined /> 运行
        </Button>
      </div>
    </div>
  );
};

export default NodeDebugPanel;
