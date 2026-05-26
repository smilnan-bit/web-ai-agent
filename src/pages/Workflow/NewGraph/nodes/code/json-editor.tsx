import React from 'react';
import { IconSaoba } from '@/assets/icons';
import { Editor as MonacoEditor } from '@/components/MonacoEditor';
import type { EditorProps } from '@monaco-editor/react';

const JsonEditor: React.FC<{ value?: string; onChange?: (value: string) => void } & EditorProps> = ({
  value,
  onChange,
  ...editorProps
}) => {
  return (
    <div className="jsoneditor-wrapper">
      <div className="jsoneditor-wrapper-header">
        自定义返回内容 <IconSaoba onClick={() => onChange?.('')} />
      </div>
      <MonacoEditor
        height="250px"
        width={'100%'}
        theme="vs-dark"
        language="json"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          contextmenu: false,
        }}
        {...editorProps}
      />
    </div>
  );
};

export default JsonEditor;
