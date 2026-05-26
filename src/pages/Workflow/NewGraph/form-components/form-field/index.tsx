import React from 'react';
import { Field, type FieldRenderProps } from '@flowgram.ai/free-layout-editor';
import { baseFieldToField } from '../utils/base-field-to-field';
import { FieldProvider } from '../contexts/field-context';
import { Feedback } from '../feedback';
import type { FieldInstance } from '../type';

export const FormField = <T = unknown>({
  name,
  deps,
  children,
  style,
}: {
  name: string;
  deps?: string[];
  children: React.ReactNode | ((field: FieldInstance<T>) => React.ReactNode);
  style?: React.CSSProperties;
}) => {
  return (
    <Field name={name} deps={deps}>
      {({ field: baseField, fieldState }: FieldRenderProps<T>) => {
        const field = baseFieldToField(baseField, fieldState);
        if (!children) {
          return <></>;
        }

        // 为field注入status属性
        const enhancedField = {
          ...field,
          status: field.errors?.[0] ? ('error' as const) : undefined,
        };

        // 处理onChange合并逻辑
        const getMergedOnChange = (originalOnChange?: (value?: T) => void) => {
          if (!originalOnChange) {
            return enhancedField.onChange;
          }

          return (value?: T) => {
            //调用原来的onChange
            originalOnChange(value);
            // 再调用field的onChange
            // enhancedField.onChange(value);
          };
        };

        return (
          <FieldProvider value={enhancedField as FieldInstance<unknown>}>
            <div tw="flex flex-col gap-1" style={style}>
              {typeof children === 'function'
                ? children(enhancedField)
                : React.cloneElement(children as React.ReactElement, {
                    value: enhancedField.value,
                    onChange: getMergedOnChange((children as React.ReactElement).props?.onChange),
                    status: enhancedField.status,
                  })}
              {/* 错误和警告信息 */}
              {(field.errors && field.errors.length > 0) || (field.warnings && field.warnings.length > 0) ? (
                <Feedback errors={field.errors} warnings={field.warnings} />
              ) : null}
            </div>
          </FieldProvider>
        );
      }}
    </Field>
  );
};
