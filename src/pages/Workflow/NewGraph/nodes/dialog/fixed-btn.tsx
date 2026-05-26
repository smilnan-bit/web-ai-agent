import React from 'react';
import { Feedback, FormField } from '@form';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { FieldArray } from '@flowgram.ai/free-layout-editor';
import { IconTuozhuai } from '../icons';
import { Shanchu } from '@/assets/icons';
import { SortableHandle, SortableElement, SortableContainer } from 'react-sortable-hoc';
import { Other } from './other';
import { nanoid } from 'nanoid';

const MAX_OPTIONS_LENGTH = 20;
// 拖拽手柄组件
const DragHandle = SortableHandle(() => (
  <div tw="h-[32px] flex items-center pr-1 cursor-grab" className="j-group-item-drag-handle">
    <IconTuozhuai />
  </div>
));

// 参数项组件
const ParamItem = ({ disableRemove = false, remove, index, itemName }) => {
  return (
    <div tw="flex gap-2 select-none">
      <DragHandle />
      <div tw="leading-[32px]">选项{index + 1}</div>
      <div tw="flex-1">
        <FormField name={`${itemName}.value`}>
          <Input placeholder="请输入选项内容" maxLength={30} />
        </FormField>
      </div>
      {!disableRemove ? (
        <div onClick={() => remove()} tw="cursor-pointer text-[rgba(0, 0, 0, 0.45)] hover:text-[#ff4d4f] py-[5px]">
          <Shanchu />
        </div>
      ) : (
        <div tw="w-[14px] h-[32px]" />
      )}
    </div>
  );
};

const SortableParamItem = SortableElement<{
  disableRemove?: boolean;
  idx: number;
  itemName: string;
  remove: () => void;
}>(({ disableRemove = false, remove, idx, itemName }) => {
  return <ParamItem disableRemove={disableRemove} remove={remove} index={idx} itemName={itemName} />;
});

const SortableParamList = SortableContainer<{
  children: React.ReactNode;
}>(({ children }) => {
  return <div tw="flex flex-col gap-3">{children}</div>;
});

//兼容之前代码
const prefix = 'dialog-options-';

export const genOptionItem = (key?: string | number) => {
  return {
    id: `${prefix}${key ?? nanoid(8)}`,
    value: '',
  };
};

const FormList = () => {
  return (
    <div>
      <FieldArray<{ id: string; value: string }> name="options">
        {({ field: childField, fieldState }) => {
          const { value = [], append: add, remove, move } = childField;
          return (
            <>
              <SortableParamList
                lockAxis="y"
                helperClass="sortable-helper"
                helperContainer={() => document.getElementById('j-form-container-sidebar') as HTMLElement}
                distance={10}
                onSortEnd={({ oldIndex, newIndex }) => {
                  if (oldIndex !== newIndex) {
                    move(oldIndex, newIndex);
                  }
                  // 强制删除 helper 元素,有些鼠标不灵敏,需要手动删除helper元素
                  setTimeout(() => {
                    const helpers = document.querySelectorAll('.sortable-helper');
                    helpers?.forEach((el) => el.parentNode && el.parentNode.removeChild(el));
                  }, 0);
                }}
              >
                {childField.map((child, index: number) => {
                  return (
                    <SortableParamItem
                      disableRemove={value.length === 1}
                      remove={() => {
                        remove(index);
                      }}
                      index={index}
                      key={child.key}
                      itemName={child.name}
                      idx={index}
                    />
                  );
                })}
              </SortableParamList>
              {value.length < MAX_OPTIONS_LENGTH && (
                <div tw="mt-3">
                  <Button type="link" block onClick={() => add(genOptionItem())} className="add-button">
                    <PlusOutlined />
                    新增
                  </Button>
                </div>
              )}
              <Feedback
                errors={fieldState?.errors?.filter((item) => item.name === 'options')}
                style={{ marginTop: '8px' }}
              />
            </>
          );
        }}
      </FieldArray>
    </div>
  );
};

const FixedButtonSetting = () => {
  return (
    <>
      <FormList />
      <Other />
    </>
  );
};

export default FixedButtonSetting;
