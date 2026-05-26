import {
  FreeLayoutEditorProvider,
  PlaygroundReactRenderer,
  type FreeLayoutPluginContext,
} from '@flowgram.ai/free-layout-editor';
import React, { useEffect, useRef, useState } from 'react';
import '@flowgram.ai/free-layout-editor/index.css';

import { nodeRegistries } from './nodes';
import { initialData } from './initial-data';
import { useScheduleEditorProps } from './hooks';
import { EditorHeader } from './components/EditorHeader';
import FloatLayout from '@/pages/Workflow/NewGraph/components/float-layout';
import { GraphTools } from '@/pages/Workflow/NewGraph/components/tools';
import { SidebarProvider, SidebarRenderer } from '@/pages/Workflow/NewGraph/components/sidebar';
import { useQueryLocationSearch } from '@/utils';
import { getSchedulingDetail } from '@/api/scheduling';
import { loadCanvasData } from '@/pages/Workflow/NewGraph/utils/load-canvas-data';

// 内部组件，需要在 FreeLayoutEditorProvider 内部访问 context
const EditorContent = ({
  strategyName,
  editorRef,
  strategyId,
  onNameChange,
}: {
  strategyName: string;
  editorRef: React.RefObject<FreeLayoutPluginContext | undefined>;
  strategyId: string;
  onNameChange: (name: string) => void;
}) => {
  return (
    <>
      <PlaygroundReactRenderer />
      <FloatLayout
        headerComp={
          <EditorHeader
            strategyName={strategyName}
            editorRef={editorRef as React.RefObject<any>}
            strategyId={strategyId}
            onNameChange={onNameChange}
          />
        }
        rightComp={<SidebarRenderer />}
      >
        <GraphTools />
      </FloatLayout>
    </>
  );
};

const SchedulingEditor = () => {
  const ref = useRef<FreeLayoutPluginContext | undefined>();
  const editorProps = useScheduleEditorProps(initialData, nodeRegistries as any[]);
  const { id } = useQueryLocationSearch();
  const [strategyName, setStrategyName] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        const { data } = await getSchedulingDetail({ id });
        if (!data) {
          throw new Error('获取调度策略详情失败');
        }
        setStrategyName(data.name || '');
        if (data.diagramInfo && ref.current) {
          loadCanvasData(ref.current.document, data.diagramInfo);
          setTimeout(() => {
            ref.current?.tools.fitView();
          }, 100);
        }
      } catch (error) {
        console.log('getSchedulingDetail error===', error);
      }
    };
    fetchDetail();
  }, [id]);

  return (
    <FreeLayoutEditorProvider {...editorProps} ref={ref as React.RefObject<FreeLayoutPluginContext>}>
      <SidebarProvider>
        <EditorContent
          strategyName={strategyName}
          editorRef={ref}
          strategyId={id || ''}
          onNameChange={setStrategyName}
        />
      </SidebarProvider>
    </FreeLayoutEditorProvider>
  );
};

export default SchedulingEditor;
