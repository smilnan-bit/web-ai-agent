import { useRef, useEffect } from 'react';

import { Field, type FieldRenderProps } from '@flowgram.ai/free-layout-editor';
import { Typography, Input, Tooltip } from '@douyinfe/semi-ui';

import { Feedback } from '../feedback';
import React from 'react';
import { Bianji, IconBianji } from '@/assets/icons';
const { Text } = Typography;

export function TitleInput(props: {
  readonly: boolean;
  titleEdit: boolean;
  updateTitleEdit: (setEdit: boolean) => void;
  showEdit?: boolean;
}): JSX.Element {
  const { readonly, titleEdit, updateTitleEdit, showEdit } = props;
  const ref = useRef<any>();
  const titleEditing = titleEdit && !readonly;
  useEffect(() => {
    if (titleEditing) {
      ref.current?.focus();
    }
  }, [titleEditing]);

  return (
    <div tw="flex-1 w-0 text-[20px] h-full flex-col flex justify-center">
      <Field name="title">
        {({ field: { value, onChange }, fieldState }: FieldRenderProps<string>) => (
          <>
            {titleEditing ? (
              <Input value={value} onChange={onChange} maxLength={50} ref={ref} onBlur={() => updateTitleEdit(false)} />
            ) : (
              <div tw="flex gap-[4px] items-center w-full">
                <Tooltip
                  content={<span tw="text-[rgba(15,21,40, 0.82)] text-[14px]">{value}</span>}
                  style={{ backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
                >
                  <div tw="truncate text-[16px] font-medium">
                    <span tw="cursor-pointer">{value}</span>
                  </div>
                </Tooltip>
                {showEdit && !titleEditing ? (
                  <Bianji
                    onClick={() => updateTitleEdit(true)}
                    color="#337eff"
                    tw="text-[14px] cursor-pointer flex-shrink-0"
                  />
                ) : null}
              </div>
            )}
            <Feedback errors={fieldState?.errors} />
          </>
        )}
      </Field>
    </div>
  );
}
