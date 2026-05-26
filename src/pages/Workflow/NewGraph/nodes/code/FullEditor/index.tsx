import React, { useContext, useEffect } from 'react';
import { Select } from 'antd';
import { FormField, useForm } from '@form';
import { PlayCircleOutlined } from '@ant-design/icons';
import { IconDaima, IconShouqi } from '@/assets/icons';
import { Editor as MonacoEditor } from '@/components/MonacoEditor';
import './index.less';
import { SidebarContext } from '@/pages/Workflow/NewGraph/context';
import tw from 'twin.macro';
import { useWatch } from '@flowgram.ai/free-layout-editor';
import { EditorLanguageConfig, EditorLanguageEnum, type CodeFormData } from '../form';
import { defaultJSCode, defaultPythonCode } from '../const';

const FullEditor = ({ setDebugPanelVisible }: { setDebugPanelVisible: (visible: boolean) => void }) => {
  const codeLanguage = useWatch<CodeFormData['codeLanguage']>('codeLanguage');
  const { setShowLeftPanel, isNewGraph } = useContext(SidebarContext);
  const form = useForm();

  return (
    <div className="fulleditor" css={isNewGraph && tw`shadow-[0 2px_6px_0_rgba(0,0,0,0.12)] `}>
      <div className="fulleditor-header" css={isNewGraph && tw`rounded-[4px_4px_0_0]`}>
        <span>
          <span className="fulleditor-header-titleicon">
            <IconDaima color="#fff" />
          </span>
          <span className="fulleditor-header-titletext">代码</span>
          <FormField name="codeLanguage" style={{ display: 'inline-block' }}>
            {({ value, onChange }) => (
              <Select
                style={{ marginLeft: 16, width: 140 }}
                value={value}
                onChange={(_value) => {
                  onChange(_value);
                  form.setValueIn('code', _value === EditorLanguageEnum.javascript ? defaultJSCode : defaultPythonCode);
                }}
              >
                <Select.Option value={EditorLanguageEnum.javascript}>语言JavaScript</Select.Option>
                <Select.Option value={EditorLanguageEnum.python3}>语言Python3</Select.Option>
              </Select>
            )}
          </FormField>
        </span>
        <div className="fulleditor-header-ope">
          {isNewGraph && (
            <span style={{ marginRight: 16 }} onClick={() => setDebugPanelVisible(true)}>
              <PlayCircleOutlined />
              测试代码
            </span>
          )}
          <span
            onClick={() => {
              setShowLeftPanel?.(false);
            }}
          >
            <IconShouqi color="currentColor" />
            收起
          </span>
        </div>
      </div>
      <FormField name="code" style={{ height: '100%' }}>
        <MonacoEditor
          className="fulleditor-codeeditor"
          theme="vs-dark"
          language={EditorLanguageConfig[codeLanguage]}
          height="calc(100% - 65px)"
          options={{
            fontSize: 14,
            padding: {
              top: 4,
              bottom: 4,
            },
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            contextmenu: false,
          }}
        />
      </FormField>
    </div>
  );
};

export default FullEditor;
