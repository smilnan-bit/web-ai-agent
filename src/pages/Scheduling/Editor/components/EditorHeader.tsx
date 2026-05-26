import React, { useState } from 'react';
import { Button, message, Input } from 'antd';
import { ArrowLeftOutlined, EditOutlined, PictureOutlined } from '@ant-design/icons';
import { useRouter } from '@ysf/ys-router';
import { saveSchedulingCanvas, publishScheduling, updateScheduling } from '@/api/scheduling';

interface EditorHeaderProps {
  strategyName: string;
  editorRef: React.RefObject<any>;
  strategyId: string;
  onNameChange?: (name: string) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ strategyName, editorRef, strategyId, onNameChange }) => {
  const { navigate, routesMap } = useRouter();
  const [publishLoading, setPublishLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const handleBack = () => {
    navigate(routesMap.scheduling.path);
  };

  const handleStartEdit = () => {
    setNameInput(strategyName);
    setEditingName(true);
  };

  const handleNameSave = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setEditingName(false);
      return;
    }
    try {
      await updateScheduling({ id: strategyId, name: trimmed });
      onNameChange?.(trimmed);
    } catch {
      message.error('名称保存失败');
    }
    setEditingName(false);
  };

  const handlePublish = async () => {
    if (!editorRef.current) {
      message.warning('编辑器未就绪，请稍后重试');
      return;
    }
    setPublishLoading(true);
    try {
      const json = editorRef.current.document.toJSON();
      await saveSchedulingCanvas({ id: strategyId, diagramInfo: JSON.stringify(json) });
      await publishScheduling({ id: strategyId });
      message.success('调度策略发布成功');
    } catch {
      message.error('发布失败');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleScreenshot = () => {
    message.info('截图功能开发中');
  };

  return (
    <div
      style={{
        height: 56,
        background: '#fff',
        paddingLeft: 16,
        paddingRight: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        zIndex: 10,
      }}
    >
      {/* 左侧：返回 + 策略名称 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ padding: '0 4px', color: 'rgba(0,0,0,0.65)', fontSize: 14 }}
        >
          返回
        </Button>
        <div
          style={{
            width: 1,
            height: 16,
            background: '#d9d9d9',
            margin: '0 4px',
          }}
        />
        {editingName ? (
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleNameSave}
            onPressEnter={handleNameSave}
            autoFocus
            size="small"
            style={{ width: 200, fontSize: 15, fontWeight: 600 }}
            maxLength={100}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>
              {strategyName || '调度策略编辑'}
            </span>
            <EditOutlined style={{ fontSize: 14, color: '#337EFF', cursor: 'pointer' }} onClick={handleStartEdit} />
          </div>
        )}
      </div>

      {/* 右侧：截图 + 试运行 + 发布 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button icon={<PictureOutlined />} onClick={handleScreenshot} title="截图" />
        <Button onClick={() => message.info('试运行功能开发中')}>试运行</Button>
        <Button type="primary" onClick={handlePublish} loading={publishLoading}>
          发布
        </Button>
      </div>
    </div>
  );
};

export default EditorHeader;
