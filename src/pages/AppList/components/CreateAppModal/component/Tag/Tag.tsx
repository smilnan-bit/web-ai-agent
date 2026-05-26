import { PlusOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import type { InputRef } from 'antd';
import { Input, Tag, Tooltip, type FormItemProps } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconBianji2, IconChahao } from '@/assets/icons';
import './tag.less';
import { MAX_TAG_LENGTH, MAX_TAG_NUMBER } from '@/pages/AppList/components/CreateAppModal/constanst';

const TemplateTag: React.FC<FormItemProps> = (props) => {
  const [tags, setTags] = useControllableValue<string[]>(props, {
    defaultValue: [],
  });

  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);
  const isComposing = useRef(false);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [inputValue]);

  const handleClose = (removedTag: string) => {
    const newTags = (tags || []).filter((tag) => tag !== removedTag);
    console.log(newTags);
    setTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    // 如果正在使用输入法，不执行设置值的操作
    if (isComposing.current) {
      return;
    }
    if (inputValue && (tags || []).indexOf(inputValue) === -1) {
      setTags([...(tags || []), inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  };

  const handleEditInputConfirm = () => {
    // 如果正在使用输入法，不执行设置值的操作
    if (isComposing.current) {
      return;
    }
    const newTags = [...(tags || [])];
    newTags[editInputIndex] = editInputValue;
    setTags(newTags);
    setEditInputIndex(-1);
    setInputValue('');
  };

  const handleRemoveTag = (e, index) => {
    e.stopPropagation();
    const newTags = [...(tags || [])];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const SHOW_ADD_BUTTON = useMemo(() => {
    return (tags || []).length < MAX_TAG_NUMBER;
  }, [tags]);

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = () => {
    isComposing.current = false;
  };

  return (
    <>
      {(tags || [])?.map((tag, index) => {
        if (editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={`${tag}-${index}-input`}
              tw={'w-[87px] mb-[8px] mr-[8px]'}
              value={editInputValue}
              maxLength={MAX_TAG_LENGTH}
              onChange={handleEditInputChange}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
            />
          );
        }

        const isLongTag = tag.length > 20;

        const tagElem = (
          <Tag
            className={'template-tag-item'}
            tw={
              'text-[14px] leading-[22px] p-[4px 12px] text-[#000000D9] mb-[8px] select-none bg-[#FAFAFA] inline-flex items-center'
            }
            key={`${tag}-${index}-tag`}
            onClose={() => handleClose(tag)}
          >
            <span>{isLongTag ? `${tag.slice(0, 20)}...` : tag}</span>
            <IconBianji2
              size={14}
              color={'#00000073'}
              className={'template-tag-edit-icon'}
              tw={'ml-[8px]'}
              onClick={(e) => {
                e.preventDefault();
                setEditInputIndex(index);
                setEditInputValue(tag);
                Promise.resolve().then(() => {
                  editInputRef?.current?.focus();
                });
              }}
            />
            <IconChahao
              className={'template-tag-close'}
              color={'#8C8C8C'}
              size={12}
              onClick={(e) => handleRemoveTag(e, index)}
            />
          </Tag>
        );
        return isLongTag ? (
          <Tooltip title={tag} key={tag}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        );
      })}
      {inputVisible && (
        <Input
          ref={inputRef}
          type="text"
          tw={'w-[87px] mb-[8px]'}
          value={inputValue}
          maxLength={MAX_TAG_LENGTH}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />
      )}
      {!inputVisible && SHOW_ADD_BUTTON ? (
        <Tag
          tw={
            'text-[14px] leading-[22px] p-[4px 12px] border-dashed bg-[#FFFFFF] text-[#000000D9] mb-[8px] bg-[#FAFAFA] border-[#D9D9D9]'
          }
          onClick={showInput}
        >
          <PlusOutlined /> 添加
        </Tag>
      ) : null}
    </>
  );
};

export default TemplateTag;
