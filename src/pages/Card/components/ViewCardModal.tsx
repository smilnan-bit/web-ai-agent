import React, { useCallback, useState } from 'react';
import { Button, Input, Modal, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { useRouter } from '@ysf/ys-router';
import ReactJson from 'react-json-view';
import { getCardDetail } from '@/api/card';
import SpecPreview from '@/pages/CardEditor/components/SpecPreview';
import { emptySpec } from '@/pages/CardEditor/constants';
import {
  defaultRuntimeData,
  cloneRuntimeData,
  collectBindings,
  getRuntimeValue,
  setRuntimeValue,
} from '@/pages/CardEditor/utils/runtime-data';
import type { RuntimeData } from '@/pages/CardEditor/types';
import { text2object } from '@/utils';
import './ViewCardModal.less';
import { IconJiantoukaozuo } from '@/pages/Workflow/NewGraph/nodes/icons';

const ModuleName = 'ViewCardModal';

interface ViewCardModalProps {
  visible: boolean;
  cardId: string | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const ViewCardModal: React.FC<ViewCardModalProps> = ({ visible, cardId, onClose, onDelete }) => {
  const { navigate, routesMap } = useRouter();
  const [runtimeData, setRuntimeData] = useState<RuntimeData>(() => cloneRuntimeData(defaultRuntimeData));
  const [isBindPanelCollapsed, setIsBindPanelCollapsed] = useState(false);
  const [isJsonPanelCollapsed, setIsJsonPanelCollapsed] = useState(false);

  const { data, loading } = useRequest(() => getCardDetail({ id: cardId! }), {
    ready: visible && Boolean(cardId),
    refreshDeps: [cardId],
    onSuccess: () => {
      // 每次切换卡片时重置动态数据
      setRuntimeData(cloneRuntimeData(defaultRuntimeData));
    },
  });

  const cardData = data?.data;
  const spec = (text2object(cardData?.uiJson) ?? emptySpec) as any;

  // 复用编辑页的 collectBindings，提取 spec 中所有动态绑定字段
  const bindings = React.useMemo(() => collectBindings(spec), [spec]);

  const handleEdit = useCallback(() => {
    onClose();
    navigate(routesMap.cardEditor.path, { query: { id: cardId } });
  }, [cardId, navigate, onClose]);

  const handleDelete = useCallback(() => {
    if (!cardId) return;
    onClose();
    onDelete(cardId);
  }, [cardId, onClose, onDelete]);

  const handleBindingChange = useCallback((path: string, value: string) => {
    setRuntimeData((prev) => setRuntimeValue(prev, path, value));
  }, []);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
      closable={false}
      title={null}
      bodyStyle={{ padding: 0 }}
      destroyOnClose
    >
      {/* 自定义标题栏：左侧查看卡片区 | 右侧组件区 + 关闭 */}
      <div className={`${ModuleName}-header`}>
        <div className={`${ModuleName}-header-left`}>
          <span className={`${ModuleName}-header-text`}>查看卡片</span>
          <Button size="small" danger onClick={handleDelete}>
            删除
          </Button>
          <Button size="small" type="primary" onClick={handleEdit}>
            编辑
          </Button>
        </div>
        <div className={`${ModuleName}-header-right`}>
          <span className={`${ModuleName}-header-text`}>组件</span>
          <span className={`${ModuleName}-header-close`} onClick={onClose}>
            ×
          </span>
        </div>
      </div>
      <Spin spinning={loading}>
        <div className={`${ModuleName}-body`}>
          {/* 左栏：卡片预览 */}
          <div className={`${ModuleName}-left`}>
            <SpecPreview spec={spec} runtimeData={runtimeData} />
          </div>

          {/* 右栏：实时 JSON + 动态数据 */}
          <div className={`${ModuleName}-right`}>
            {/* 实时 JSON */}
            <div className={`${ModuleName}-section`} style={isJsonPanelCollapsed ? { flex: '0 0 auto' } : undefined}>
              <div className={`${ModuleName}-section-header`}>
                <IconJiantoukaozuo
                  size={14}
                  style={{
                    color: '#1a1a1a',
                    transform: isJsonPanelCollapsed ? 'rotate(90deg)' : 'rotate(270deg)',
                    transformOrigin: '30% 50%',
                  }}
                  onClick={() => setIsJsonPanelCollapsed((prev) => !prev)}
                />
                <span className={`${ModuleName}-section-title`}>实时 JSON</span>
              </div>
              {!isJsonPanelCollapsed && (
                <div className={`${ModuleName}-section-body`}>
                  <ReactJson
                    src={spec as object}
                    name={null}
                    collapsed={2}
                    displayDataTypes={false}
                    enableClipboard={false}
                    style={{ fontSize: 12 }}
                  />
                </div>
              )}
            </div>

            {/* 动态数据绑定 */}
            <div className={`${ModuleName}-section ${ModuleName}-section--binding`} style={isBindPanelCollapsed ? { flex: '0 0 auto' } : undefined}>
              <div className={`${ModuleName}-section-header`}>
                <IconJiantoukaozuo
                  size={14}
                  style={{
                    color: '#1a1a1a',
                    transform: isBindPanelCollapsed ? 'rotate(90deg)' : 'rotate(270deg)',
                    transformOrigin: '30% 50%',
                  }}
                  onClick={() => setIsBindPanelCollapsed((prev) => !prev)}
                />
                <span className={`${ModuleName}-section-title`}>动态数据</span>
              </div>
              {!isBindPanelCollapsed && (
                <div className={`${ModuleName}-section-body`}>
                  {bindings.length === 0 ? (
                    <span className={`${ModuleName}-binding-empty`}>卡片中没有动态绑定字段</span>
                  ) : (
                    bindings.map(({ path, fallback }) => (
                      <div key={path} className={`${ModuleName}-binding-row`}>
                        <label className={`${ModuleName}-binding-label`}>{path}</label>
                        <Input
                          placeholder={fallback || `请输入 ${path}`}
                          value={getRuntimeValue(runtimeData, path)}
                          onChange={(e) => handleBindingChange(path, e.target.value)}
                          size="small"
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default ViewCardModal;
