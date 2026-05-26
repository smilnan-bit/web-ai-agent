import { Button, Form, type FormInstance } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useWatch } from '@form';
import './index.less';
import RenderInput from '@/components/RenderInput';
import { executeCodeNode } from '@/api';
import JsonTreeView from '@/components/JsonTreeView';
import { cleanObject, text2object } from '@/utils';
import { SimpleParamTypeEnum } from '../../../constants';
import type { CodeFormData } from '../form';
import { BasicInfoState } from '../../../model';
import { useRecoilValue } from 'recoil';

export const DebugPanel = ({
  setDebugPanelVisible,
}: {
  setDebugPanelVisible: (visible: boolean) => void;
}) => {
  const [form] = Form.useForm();
  const code = useWatch<CodeFormData['code']>('code');
  const codeLanguage = useWatch<CodeFormData['codeLanguage']>('codeLanguage');
  const timeoutMs = useWatch<CodeFormData['settingOnError']>('settingOnError').timeoutMs;
  const inputParam = useWatch<CodeFormData['inputParam']>('inputParam') || [];
  const { workflowId } = useRecoilValue(BasicInfoState);

  const initialValues = useMemo(() => {
    const obj = {};
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
    await form.validateFields();
    const result = await executeCodeNode({
      code,
      codeLanguage,
      timeoutMs: timeoutMs,
      param: debugInput,
      workflowId,
    });
    const jsonres = text2object(result.data);
    if (jsonres.data) {
      jsonres.data = text2object(jsonres.data);
    }
    setDebugOutput(jsonres);
  };

  // 当 inputParam 变化时重置
  useEffect(() => {
    setDebugInput(initialValues);
  }, [initialValues]);

  return (
    <div className="DebugPanel">
      <div className="DebugPanel-header">
        <span className="DebugPanel-title">试运行</span>
        <Button type="text" size="small" onClick={() => setDebugPanelVisible(false)} className="DebugPanel-close">
          ✕
        </Button>
      </div>
      <div className="DebugPanel-body">
        <div className="DebugPanel-content">
          <div className="DebugPanel-content-title">试运行输入</div>
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
        <div className="DebugPanel-content">
          <div className="DebugPanel-content-title">运行结果</div>
          <div tw="mb-2">输入</div>
          {debugInput && (
            <div className="DebugPanel-jsonviewer">
              <JsonTreeView src={debugInput} />
            </div>
          )}
          <div tw="mt-4 mb-2">输出</div>
          {debugOutput && (
            <div className="DebugPanel-jsonviewer">
              <JsonTreeView src={debugOutput} />
            </div>
          )}
        </div>
      </div>
      <div className="DebugPanel-bottom">
        <Button type="primary" style={{ width: '100%' }} onClick={() => onValidateAndRun()} disabled={!code}>
          <CaretRightOutlined /> 运行
        </Button>
      </div>
    </div>
  );
};
