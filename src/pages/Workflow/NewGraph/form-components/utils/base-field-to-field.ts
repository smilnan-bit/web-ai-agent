import type { FieldInstance, BaseFieldInstance, BaseFieldState } from '../type';

export function baseFieldToField<T = unknown>(
  baseField: BaseFieldInstance<T>,
  baseFieldState?: BaseFieldState,
  readonly = false,
): FieldInstance<T> {
  const cntFieldErrors = baseFieldState?.errors?.filter((item) => item.name === baseField.name);
  const cntFieldWarnings = baseFieldState?.warnings?.filter((item) => item.name === baseField.name);
  const field: FieldInstance<T> = {
    key: baseField.key,
    value: baseField.value,
    name: baseField.name,
    onBlur: () => baseField.onBlur?.(),
    onFocus: () => baseField.onFocus?.(),
    errors: cntFieldErrors,
    warnings: cntFieldWarnings,
    onChange: (value?: T) => {
      if (readonly) {
        return;
      }

      baseField?.onChange(value as T);
    },
  };

  return field;
}
