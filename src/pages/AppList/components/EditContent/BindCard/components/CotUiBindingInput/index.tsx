import React from 'react';
import { Input } from 'antd';
import EnumSelect from '@/components/EnumSelect';
import ParamSelect from '@/pages/Workflow/NewGraph/form-components/input-output/param-select';
import { SimpleParamTypeConfig, SimpleParamTypeEnum } from '@/pages/Workflow/NewGraph/constants';

export interface CotUiBindingValue {
  /** 0=input（文本输入）, 1=quote（引用工作流变量） */
  valueType?: SimpleParamTypeEnum;
  /** input 模式为用户输入的字符串；quote 模式为变量引用序列化字符串 */
  value?: string;
}

interface Props {
  value?: CotUiBindingValue;
  onChange?: (value: CotUiBindingValue) => void;
  disabled?: boolean;
}

/**
 * a2ui 卡片 binding 值输入组件（输入/引用可切换），antd Form 控制模式。
 * 与 flowgram 版的 ParamsFormWithValueItem 行为一致，但不依赖 flowgram 的 useField，
 * 因此可以在 antd Form 里使用（BindCard 弹窗）。
 */
const CotUiBindingInput: React.FC<Props> = ({ value, onChange, disabled }) => {
  const valueType = value?.valueType ?? SimpleParamTypeEnum.quote;
  const innerValue = value?.value;

  const handleTypeChange = (nextType: SimpleParamTypeEnum) => {
    // 切换类型时清空值，避免类型不匹配
    onChange?.({ valueType: nextType, value: undefined });
  };

  const handleValueChange = (nextVal: string | undefined) => {
    onChange?.({ valueType, value: nextVal });
  };

  return (
    <div tw="flex gap-2 items-start">
      <div style={{ width: 80, flex: 'none' }}>
        <EnumSelect
          optionsConfig={SimpleParamTypeConfig}
          hasAll={false}
          value={valueType}
          onChange={handleTypeChange}
          hasSortValue
          disabled={disabled}
        />
      </div>
      <div tw="flex-1 min-w-0">
        {valueType === SimpleParamTypeEnum.input ? (
          <Input
            value={innerValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="请输入"
            disabled={disabled}
            maxLength={200}
          />
        ) : (
          <ParamSelect value={innerValue} onChange={handleValueChange} placeholder="请选择变量" disabled={disabled} />
        )}
      </div>
    </div>
  );
};

export default CotUiBindingInput;
