import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FieldWrapper, FormField, useForm, useWatch, type InputParamsType, type OutputParamsType } from '@form';
import { ParamsFormWithValue, ParamsForm } from '@form/input-output';
import FixedElement from '@/components/FixedElement';
import { SidebarContext } from '../../context/sidebar-context';
import FullEditor from './FullEditor';
import { codeNodeDefaultOutputParam, CodeNodeErrorConfig, CodeNodeErrorEnum } from './const';
import { NodeDebugPanel } from '../../components/node-debug-panel';
import { InputNumber, Select, Typography } from 'antd';
import { IconZhankai } from '@/assets/icons';
import { Editor as MonacoEditor } from '@/components/MonacoEditor';
import JsonEditor from './json-editor';
import { useWatchFormValues } from '@flowgram.ai/free-layout-editor';
import { useNodeRenderContext } from '../../hooks';
import './form.less';
import { useUpdateEffect } from 'ahooks';
import FormFragment from '../../components/form-fragment';
import TreeDataShower from '@/components/TreeDataShower';
import { ToolParamsTypeEnum } from '@/constants';
import type { WorkflowNS } from '@/types/Workflow';
import { WorkflowEventNameEnum, workflowGlobalRegister, workflowGlobalUnregister } from '../../event';
import { executeCodeNode } from '@/api';
import { text2object } from '@/utils';
import { useRecoilValue } from 'recoil';
import { BasicInfoState } from '../../model';

export enum EditorLanguageEnum {
  python3 = 'python3',
  javascript = 'javascript',
}

//Editor编译语言配置，与后端传至不同
export const EditorLanguageConfig = {
  [EditorLanguageEnum.python3]: 'python',
  [EditorLanguageEnum.javascript]: 'javascript',
};

// 基于参数类型生成默认值
const getDefaultValueByType = (
  type: ToolParamsTypeEnum,
  subParams?: Array<{ name: string; type: ToolParamsTypeEnum; subParams?: any[] }>,
) => {
  switch (type) {
    case ToolParamsTypeEnum.string:
      return '';
    case ToolParamsTypeEnum.integer:
    case ToolParamsTypeEnum.number:
      return 0;
    case ToolParamsTypeEnum.boolean:
      return false;
    case ToolParamsTypeEnum.object: {
      const result: Record<string, any> = {};
      subParams?.forEach((sp) => {
        if (!sp?.name) return;
        result[sp.name] = getDefaultValueByType(sp.type as ToolParamsTypeEnum, sp.subParams as any);
      });
      return result;
    }
    case ToolParamsTypeEnum.array:
      // 默认返回空数组；若有需要可扩展返回一个包含默认元素的示例
      return [];
    default:
      return null;
  }
};

// 从参数定义数组生成默认 JSON 对象
export const generateDefaultJsonFromParams = (params: WorkflowNS.WorkflowSimpleParamType[]) => {
  const json: Record<string, any> = {};
  params?.forEach((item) => {
    if (!item?.name || item.type === undefined) return;
    json[item.name] = getDefaultValueByType(item.type, item.subParams as any);
  });
  return json;
};

export type CodeFormData = {
  codeLanguage: EditorLanguageEnum;
  code: string;
  settingOnError: {
    processType: CodeNodeErrorEnum;
    timeoutMs: number;
    retryTimes: number;
    dataOnErr?: string;
  };
  inputParam?: InputParamsType[];
  outputParam?: OutputParamsType[];
};

const FormContent = () => {
  const { showLeftPanel, setShowLeftPanel } = useContext(SidebarContext);
  const code = useWatch<CodeFormData['code']>('code');
  const codeLanguage = useWatch<CodeFormData['codeLanguage']>('codeLanguage');
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);
  const errorType = useWatch<CodeFormData['settingOnError']['processType']>('settingOnError.processType');
  const timeoutMs = useWatch<CodeFormData['settingOnError']>('settingOnError')?.timeoutMs;
  const inputParam = useWatch<CodeFormData['inputParam']>('inputParam') || [];
  const { node } = useNodeRenderContext();
  const { outputParam } = useWatchFormValues(node);
  const form = useForm();
  const basicInfo = useRecoilValue(BasicInfoState);
  const { workflowId } = basicInfo || {};

  // 监听卡片 icon 点击事件
  useEffect(() => {
    const handleDebugPanelOpen = (nodeId: string) => {
      if (nodeId === node?.id) {
        setDebugPanelVisible(true);
      }
    };
    workflowGlobalRegister(WorkflowEventNameEnum.NODE_DEBUG_PANEL_OPEN, handleDebugPanelOpen);
    return () => {
      workflowGlobalUnregister(WorkflowEventNameEnum.NODE_DEBUG_PANEL_OPEN, handleDebugPanelOpen);
    };
  }, [node?.id]);

  useUpdateEffect(() => {
    if (errorType === CodeNodeErrorEnum.returnContent) {
      const json = generateDefaultJsonFromParams(outputParam || []);
      form.setValueIn('settingOnError.dataOnErr', JSON.stringify(json, null, 2));
    }
  }, [outputParam, errorType]);

  // 代码节点执行回调
  const handleExecute = useCallback(
    async (params: Record<string, any>) => {
      if (!workflowId) return;
      const result = await executeCodeNode({
        workflowId,
        code,
        codeLanguage,
        timeoutMs: timeoutMs || 3000,
        param: params,
      });
      const jsonRes = text2object(result.data);
      // 代码节点返回的 data 字段也需要解析
      if (jsonRes.data) {
        jsonRes.data = text2object(jsonRes.data);
      }
      return jsonRes;
    },
    [workflowId, code, codeLanguage, timeoutMs],
  );

  return (
    <>
      <ParamsFormWithValue desc="回复内容中可引用的变量" />
      <FormFragment
        title="代码"
        extra={
          <span
            style={{ color: '#337EFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => {
              setShowLeftPanel?.(true);
            }}
          >
            <IconZhankai color="currentColor" style={{ marginRight: 4 }} />
            在IDE中编写
          </span>
        }
      >
        <MonacoEditor
          tw="pt-4"
          className="formcode-codeeditor"
          height="250px"
          width={'100%'}
          theme="vs-dark"
          language={EditorLanguageConfig[codeLanguage]}
          value={code || ''}
          options={{
            fontSize: 14,
            padding: {
              top: 4,
              bottom: 4,
            },
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            contextmenu: false,
          }}
        />
        {!code?.trim() && (
          <Typography.Text type="danger" tw="mt-2">
            请输入代码
          </Typography.Text>
        )}
      </FormFragment>
      {showLeftPanel && (
        //  32是drawer的padding *
        <FixedElement
          className="fulleditor-container"
          style={{
            width: '100%',
            height: '100%',
          }}
          container={document.getElementById('leftPanelRoot') || document.body}
        >
          <FullEditor setDebugPanelVisible={setDebugPanelVisible} />
        </FixedElement>
      )}
      <ParamsForm
        afterContent={
          [CodeNodeErrorEnum.returnContent, CodeNodeErrorEnum.error].includes(errorType) && (
            <TreeDataShower treeData={codeNodeDefaultOutputParam} style={{ paddingTop: 1 }} />
          )
        }
      />
      <FormFragment title="异常处理">
        <div tw="flex gap-2 mt-[16px] [&>div]:flex-1">
          <FieldWrapper name={'settingOnError.timeoutMs'} title="超时时间" tableRow>
            <InputNumber precision={0} style={{ width: '100%' }} step={1} addonAfter="ms" min={100} max={5000} />
          </FieldWrapper>
          <FieldWrapper name={'settingOnError.retryTimes'} title="重试次数" tableRow>
            <Select style={{ width: '100%' }}>
              <Select.Option value={0}>不重试</Select.Option>
              {Array.from({ length: 3 }).map((_, index) => (
                <Select.Option value={index + 1} key={index + 1}>
                  重试{index + 1}次
                </Select.Option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper name={'settingOnError.processType'} title="异常处理方式" tableRow>
            <Select style={{ width: '100%' }}>
              {Object.entries(CodeNodeErrorConfig).map(([value, label]) => (
                <Select.Option value={Number(value)} key={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </FieldWrapper>
        </div>
        {errorType === CodeNodeErrorEnum.returnContent && (
          <FormField name={'settingOnError.dataOnErr'} style={{ display: 'block' }}>
            <JsonEditor className="formcode-codeeditor" />
          </FormField>
        )}
      </FormFragment>
      {debugPanelVisible && (
        <NodeDebugPanel
          inputParam={inputParam}
          onExecute={handleExecute}
          onClose={() => setDebugPanelVisible(false)}
          disabled={!code}
        />
      )}
    </>
  );
};

export default FormContent;
