import React from 'react';
import type { BaseFieldWrapperProps } from './type';
import { FormField } from './form-field';
import tw from 'twin.macro';
import { Tooltip } from 'antd';
import { IconXinxi } from '@/assets/icons';
import FormFragment from '../components/form-fragment';

export interface FieldWrapperProps<T = string> extends BaseFieldWrapperProps<T> {
  /** 标签样式类名 */
  labelClassName?: string;
  /** 标签布局方式：'inline' 同行展示，'block' 换行展示 */
  labelLayout?: 'inline' | 'block';
  /** 是否显示冒号 */
  colon?: boolean;
  /** 是否是表格行 */
  tableRow?: boolean;
  /** 描述 */
  desc?: string;
  /** 标签样式 */
  labelStyle?: React.CSSProperties;
  /** 组件包裹器样式 */
  wrapperStyle?: React.CSSProperties;
}

export interface FormFragmentFieldWrapperProps<T = string> extends BaseFieldWrapperProps<T> {
  /** FormFragment的额外内容 */
  extra?: React.ReactNode;
}

export const FieldWrapper = <T = string>({
  name,
  title,
  required = false,
  children,
  className = '',
  labelClassName = '',
  contentClassName = '',
  labelLayout = 'block',
  desc,
  colon = false,
  tableRow = false,
  labelStyle = {},
  wrapperStyle = {},
}: FieldWrapperProps<T>) => {
  // 样式组件
  const StyleComponent = () => (
    <style>{`
      .field-label-with-colon::after {
        content: ':';
        position: relative;
        top: -0.5px;
        margin: 0 8px 0 2px;
      }
    `}</style>
  );

  // 标签渲染逻辑
  const renderLabel = () => (
    <div
      className={`field-label ${labelClassName}`}
      style={
        labelLayout === 'inline'
          ? {
              maxWidth: 100,
              flexShrink: 0,
              textAlign: 'right',
              ...labelStyle,
            }
          : wrapperStyle
      }
    >
      <label
        css={[tw`text-[14px] text-[rgba(0,0,0,0.85)] flex items-center gap-1`, !tableRow && tw`leading-[32px]`]}
        style={!tableRow && labelLayout === 'block' ? { fontWeight: 500 } : {}}
        className="field-label-with-colon"
      >
        {title}
        {desc ? (
          <Tooltip placement="top" title={desc} tw="cursor-pointer">
            <IconXinxi color={'#00000073'} />
          </Tooltip>
        ) : null}
        {required && <span tw="text-[#FF4D4F]">*</span>}
      </label>
    </div>
  );

  return (
    <>
      {colon && <StyleComponent />}
      <div className={`field-wrapper ${className}`}>
        {labelLayout === 'inline' ? (
          <div tw="flex items-start gap-3">
            {/* 标签区域 */}
            {renderLabel()}

            {/* 内容区域 */}
            <div className={`field-content ${contentClassName}`} tw="flex-1" style={wrapperStyle}>
              <FormField name={name}>{children}</FormField>
            </div>
          </div>
        ) : (
          <>
            {/* 标签行 */}
            {renderLabel()}

            {/* 内容区域 */}
            <div
              className={`field-content ${contentClassName}`}
              style={labelLayout === 'block' ? { marginTop: '8px', ...wrapperStyle } : wrapperStyle}
            >
              <FormField name={name}>{children}</FormField>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export const FormFragmentFieldWrapper = <T = string>({
  name,
  title,
  children,
  className = '',
  contentClassName = '',
  desc = '',
  extra,
  required = false,
}: FormFragmentFieldWrapperProps<T>) => {
  return (
    <FormFragment title={title} extra={extra} required={required} desc={desc}>
      <div className={`field-wrapper ${className}`} tw="pt-4">
        {/* 内容区域 */}
        <div className={`field-content ${contentClassName}`}>
          <FormField name={name}>{children}</FormField>
        </div>
      </div>
    </FormFragment>
  );
};
