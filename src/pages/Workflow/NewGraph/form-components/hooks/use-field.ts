import type { FieldInstance } from '../type';
import { useFieldContext } from '../contexts/field-context';

export function useField<T = unknown>() {
  const field = useFieldContext() as FieldInstance<T>;

  return field;
}
