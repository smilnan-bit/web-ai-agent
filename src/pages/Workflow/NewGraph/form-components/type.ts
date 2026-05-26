import type { FieldError, FieldState, FieldWarning, IField } from '@flowgram.ai/free-layout-editor';
export type {
  FieldError,
  FieldName,
} from '@flowgram.ai/free-layout-editor';
export type BaseFieldInstance<T = unknown> = IField<T>;
export type BaseFieldState = FieldState;
export interface FieldInstance<FieldValue = unknown> extends Omit<BaseFieldInstance<FieldValue>, 'onChange'> {
  /**
   * 字段的错误信息数组。
   */
  errors?: FieldError[];
  warnings?: FieldWarning[];

  /**
   * 字段状态，用于UI组件显示错误状态
   */
  status?: 'error' | undefined;

  /**
   * 设置字段的值。
   * @param value 字段的值。
   */
  onChange: (value?: FieldValue) => void;
}

// 基础字段包装器Props
export interface BaseFieldWrapperProps<T = string> {
  /** 字段名称 */
  name: string;
  /** 字段标题 */
  title: string;
  /** 字段描述 */
  desc?: string;
  /** 是否为必填字段 */
  required?: boolean;
  /** 子组件渲染函数 */
  children?: ((field: FieldInstance<T>) => React.ReactNode) | React.ReactNode;
  /** 自定义样式类名 */
  className?: string;
  /** 内容区域样式类名 */
  contentClassName?: string;
}
