import { useWatch as useBaseWatch } from '@flowgram.ai/free-layout-editor';

import type { FieldName } from '@flowgram.ai/free-layout-editor';

/**
 * 监视指定字段的值。
 *
 * @param name 字段名。
 * @returns 字段的值。
 */
export function useWatch<Value = unknown>(name: FieldName | { name: FieldName }) {
  const value = useBaseWatch(typeof name === 'string' ? name : name.name) as Value;

  return value;
}
