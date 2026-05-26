import React, { useCallback, useState } from 'react';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { usePlayground } from '@flowgram.ai/free-layout-editor';
import Tip from '@/components/Tip';
import './index.less';

const FormFragment: React.FC<
  React.PropsWithChildren<{
    title?: React.ReactNode;
    extra?: React.ReactNode;
    required?: boolean;
    desc?: string;
    disableWhenReadonly?: boolean;
  }>
> = ({ title, children, required = false, extra = '', desc = '', disableWhenReadonly = true }) => {
  const [expand, setExpand] = useState(true);
  const playground = usePlayground();
  const readonly = playground?.config?.readonly ?? false;

  // 检查目标元素是否允许点击
  const isClickAllowed = useCallback((target: HTMLElement): boolean => {
    // 使用 closest 查找包含 data-allow-click-in-readonly 属性的元素（包括自身和父元素）
    // 这样可以处理点击子元素（如 IconShezhi）但属性在父元素上的情况
    const allowedElement = target.closest('[data-allow-click-in-readonly]');
    return !!allowedElement;
  }, []);

  // 统一拦截鼠标点击类事件（但不影响 hover / 滚轮）
  const handleBlockMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!readonly || !disableWhenReadonly) return;
      // 检查点击的目标元素是否允许点击
      const target = e.target as HTMLElement;
      if (isClickAllowed(target)) {
        return; // 允许点击，不阻止事件
      }
      e.preventDefault();
      e.stopPropagation();
    },
    [readonly, disableWhenReadonly, isClickAllowed],
  );

  // 统一拦截键盘输入
  const handleBlockKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!readonly || !disableWhenReadonly) return;
      e.preventDefault();
      e.stopPropagation();
    },
    [readonly, disableWhenReadonly],
  );

  return (
    <div
      className="FormFragment"
      onClickCapture={handleBlockMouse}
      onMouseDownCapture={handleBlockMouse}
      onKeyDownCapture={handleBlockKey}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          {expand ? (
            <DownOutlined onClick={() => setExpand(false)} style={{ color: 'rgba(0, 0, 0, 0.45)', marginRight: 8 }} />
          ) : (
            <RightOutlined onClick={() => setExpand(true)} style={{ color: 'rgba(0, 0, 0, 0.45)', marginRight: 8 }} />
          )}
          <span style={{ fontWeight: 500, fontSize: 16 }} key="title">
            {title}
            {desc ? <Tip title={desc} iconStyle={{ fontSize: 14 }} /> : null}
            {required && <span style={{ color: '#FF4D4F', marginLeft: 4 }}>*</span>}
          </span>
        </div>
        {extra}
      </div>
      <div className="FormFragment-content" style={{ display: expand ? 'block' : 'none', position: 'relative' }}>
        {children}
      </div>
      {readonly && disableWhenReadonly && <div className="FormFragment-overlay" />}
    </div>
  );
};

export default FormFragment;
