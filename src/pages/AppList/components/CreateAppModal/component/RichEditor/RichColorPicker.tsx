import ColorPicker, { Color, ColorBlock } from '@rc-component/color-picker';
import { useMemoizedFn } from 'ahooks';
import { Input, type InputRef } from 'antd';
// 用于富文本里的颜色选择器
import React, { useEffect, useState, useRef } from 'react';
import './ColorPicker.less';
import { IconWubeijing } from '@/assets/icons';

// 快捷颜色
export const ENTRY_COLOR_INDEX = [
  '#FFFFFF',
  '#666666',
  '#F08787',
  '#FEB270',
  '#FED670',
  '#A2D272',
  '#70BCFE',
  '#7A90FF',
  '#D479F9',
];

const defaultValue = '#ffffffff';

type Props = {
  disabledAlpha?: boolean;
  value?: string;
  onChangeComplete?: (val: string | null) => void;
};

export const toHexFormat = (value?: string) => value?.replace(/[^0-9a-fA-F]/g, '').slice(0, 6) || '';

// 用于富文本里的颜色选择器
const RichColorPicker = (props: Props) => {
  const { value = defaultValue, onChangeComplete } = props;

  const [innerValue, setInnerValue] = useState(new Color(value));
  const [hex6, setHex6] = useState(''); // 颜色
  const [alpha, setAlpha] = useState(100); // 透明度
  const [isClick, setIsClick] = useState(false); // 是否点击
  const [isManualInput, setIsManualInput] = useState(false); // 是否手动输入透明度
  const inputRef = useRef<InputRef | null>(null);

  // 取色器改变
  const handleColorChange = useMemoizedFn((data) => {
    setHex6(data.toHexString().slice(1));
    setAlpha(Math.round(data.getAlpha() * 100));
    setInnerValue(data);
    !isClick && setIsClick(true);
    // onChangeComplete?.(data.toHexString());
  });

  // 同步hex6
  const handleHex6Change = useMemoizedFn((e) => {
    const originValue = e.target.value;

    const nextHex6 = toHexFormat(originValue);
    setHex6(nextHex6);

    if (nextHex6.length < 6) {
      return;
    }
    const nextColor = new Color(`#${nextHex6}`);
    (nextColor as any).setAlpha(alpha / 100);
    setInnerValue(nextColor);
  });

  // 同步alpha
  const handleAlphaChange = useMemoizedFn((e) => {
    const originValue = e.target.value;
    const nextAplha = Number(originValue);
    const clampedAlpha = Math.max(0, Math.min(nextAplha, 100));
    setAlpha(clampedAlpha);
    setIsManualInput(true);

    if (hex6.length < 6) {
      return;
    }

    const nextColor = new Color(`#${hex6}`);
    (nextColor as any).setAlpha(nextAplha / 100);
    setInnerValue(nextColor);
  });

  // 清除颜色
  const handleClearColor = () => {
    // setHex6('');
    // setAlpha(100);
    onChangeComplete?.(null);
  };

  // 同步外部颜色
  useEffect(() => {
    if (!innerValue) {
      return;
    }

    const nextValue = props.disabledAlpha ? innerValue?.toHexString() : (innerValue as any)?.toHex8String();

    // 如果内部颜色和外部颜色一致，不做处理
    if (props.value === nextValue) {
      return;
    }

    // 刚进来时未点击，不改变颜色
    if (value !== defaultValue || isClick) {
      props.onChangeComplete?.(nextValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerValue]);

  // 同步内部颜色
  useEffect(() => {
    const outColor = new Color(value);

    // 如果外部颜色和内部颜色一致，不做处理
    if (innerValue && (outColor as any).toHex8String() === (innerValue as any).toHex8String()) {
      return;
    }
    if (value !== defaultValue) {
      handleColorChange(outColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (isManualInput && inputRef.current) {
      inputRef.current.focus();
      setIsManualInput(false);
    }
  }, [alpha]);

  const prefixCls = 'rc-color-picker';

  return (
    <ColorPicker
      disabledAlpha={props.disabledAlpha}
      panelRender={(panel) => (
        <>
          {panel}

          <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Input prefix="#" value={hex6} onChange={handleHex6Change} />
            {props.disabledAlpha ? null : (
              <Input
                ref={inputRef}
                style={{ width: '100px', flex: 'none' }}
                suffix="%"
                type="number"
                max={100}
                min={0}
                value={alpha}
                onChange={handleAlphaChange}
              />
            )}
          </div>
          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconWubeijing onClick={handleClearColor} style={{ marginTop: 10, cursor: 'pointer' }} />
            {ENTRY_COLOR_INDEX.map((v, index) => {
              return (
                <ColorBlock
                  key={v}
                  style={{ marginTop: '10px', height: '15px', width: '15px', cursor: 'pointer' }}
                  color={v}
                  prefixCls={prefixCls}
                  onClick={() => {
                    onChangeComplete?.(v);
                  }}
                />
              );
            })}
          </div>
        </>
      )}
      value={innerValue}
      onChange={handleColorChange}
    />
  );
};

export default RichColorPicker;
