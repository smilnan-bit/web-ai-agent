import React, { useState, useEffect } from 'react';
import { useField } from '@form/hooks';
import { Select, Input, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const baseOptions = [
  { label: '换行(\\n)', value: '\n', isCustom: false },
  { label: '制表符(\\t)', value: '\t', isCustom: false },
  { label: '句号(。)', value: '。', isCustom: false },
  { label: '逗号(，)', value: '，', isCustom: false },
  { label: '分号(；)', value: '；', isCustom: false },
  { label: '空格( )', value: ' ', isCustom: false },
];

export const DelimiterSelector = () => {
  const { value, onChange, status } = useField();
  const [customOptions, setCustomOptions] = useState<Array<{ label: string; value: string; isCustom: boolean }>>([]);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // 根据当前value自动识别自定义选项
  useEffect(() => {
    if (value && Array.isArray(value)) {
      const baseValues = baseOptions.map((option) => option.value);
      const customValues = value.filter((val) => !baseValues.includes(val));

      const newCustomOptions = customValues.map((val) => ({
        label: val,
        value: val,
        isCustom: true,
      }));

      setCustomOptions(newCustomOptions);
    } else {
      setCustomOptions([]);
    }
  }, [value]);

  const allOptions = [...baseOptions, ...customOptions];

  const handleAddCustomOption = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && customOptions.length < 3) {
      // 检查是否与基础选项重复
      const isDuplicateInBase = baseOptions.some((option) => option.value === trimmedValue);
      // 检查是否与当前选中的值重复
      const isDuplicateInValue = value && Array.isArray(value) && value.includes(trimmedValue);

      if (isDuplicateInBase) {
        message.warning('该分隔符已存在于基础选项中，请选择其他分隔符');
        return;
      }

      if (isDuplicateInValue) {
        message.warning('该分隔符已添加过，请选择其他分隔符');
        return;
      }

      // 直接更新value，自定义选项会自动从value中识别
      const newValue = [...(Array.isArray(value) ? value : []), trimmedValue];
      onChange(newValue);
      setInputValue('');
      setShowInput(false);
      message.success('自定义分隔符添加成功');
    } else if (trimmedValue && customOptions.length >= 3) {
      message.warning('超出最大数量限制');
    } else if (!trimmedValue) {
      message.warning('请输入有效的分隔符');
    }
  };

  const handleRemoveCustomOption = (optionValue: string) => {
    // 从value中移除该选项
    const newValue = (Array.isArray(value) ? value : []).filter((val) => val !== optionValue);
    onChange(newValue);
  };

  const dropdownRender = (menu: React.ReactElement) => (
    <div>
      {menu}
      <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
        {customOptions.length < 3 && (
          <>
            {!showInput ? (
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => setShowInput(true)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  color: '#337EFF',
                  padding: '4px 0',
                  justifyContent: 'flex-start',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#1D5BFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#337EFF';
                }}
              >
                添加自定义分隔符
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="输入自定义分隔符"
                  onPressEnter={handleAddCustomOption}
                  onKeyDown={(e) => {
                    // 阻止delete和backspace键事件冒泡到Select组件
                    e.stopPropagation();
                  }}
                  maxLength={20}
                  autoFocus
                />
                <Button type="primary" onClick={handleAddCustomOption}>
                  添加
                </Button>
                <Button
                  onClick={() => {
                    setShowInput(false);
                    setInputValue('');
                  }}
                >
                  取消
                </Button>
              </div>
            )}
          </>
        )}
        {customOptions.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              自定义分隔符 ({customOptions.length}/3):
            </div>
            {customOptions.map((option) => (
              <div
                key={option.value}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 8px',
                  background: '#f5f5f5',
                  borderRadius: '4px',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontSize: '12px' }}>{option.label}</span>
                <Button
                  type="text"
                  size="small"
                  onClick={() => handleRemoveCustomOption(option.value)}
                  style={{ padding: '0 4px', minWidth: 'auto' }}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const formatOptions = allOptions.map((option) => ({
    ...option,
    label: option.label,
  }));

  return (
    <Select
      status={status}
      onChange={onChange}
      options={formatOptions}
      value={value}
      mode="multiple"
      tw="w-full"
      placeholder="请选择分隔符"
      dropdownRender={dropdownRender}
    />
  );
};
