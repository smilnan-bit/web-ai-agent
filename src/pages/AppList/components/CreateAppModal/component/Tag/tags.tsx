import DynamicTag from './Tag';

import { Button, InputNumber } from 'antd';
import { isNumber } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  MAX_TEMPLATE_TAG_INPUT_NUMBER,
  MIN_TEMPLATE_TAG_INPUT_NUMBER,
  TemplateTagType,
} from '@/pages/AppList/components/CreateAppModal/constanst';
import { checkArrayNotEmpty } from '@/pages/AppList/components/CreateAppModal/utils';
import { IconBianji, IconShuaxin2 } from '@/assets/icons';
import './tag.less';

interface RejectRecognitionProps {
  value: {
    llmBufferSize: number;
    notMatchKeywords: string[];
    defaultNotMatchKeywords: string[];
  };
  onChange: (type: TemplateTagType, value: number | string[]) => void;
}
const RejectRecognition: React.FC<RejectRecognitionProps> = ({ value, onChange }) => {
  const {
    llmBufferSize: initRejectNumber,
    notMatchKeywords: initNotMatchKeywords,
    defaultNotMatchKeywords,
  } = value || { llmBufferSize: 5, notMatchKeywords: [], defaultNotMatchKeywords: [] };
  const [rejectNumber, setRejectNumber] = useState(initRejectNumber);
  const [notMatchKeywordsValue, setNotMatchKeywordsValue] = useState(initNotMatchKeywords);
  const [isEdit, setIsEdit] = useState(false);
  const [dynamicTagSaveError, setDynamicTagSaveError] = useState(false);
  const inputRef = useRef(null);

  const handleChangeEdit = useCallback(() => {
    if (isEdit) return false;
    setIsEdit(!isEdit);
  }, [isEdit]);

  const handleChangeRejectNumber = useCallback((value: number) => {
    setRejectNumber(value);
  }, []);

  const handleRejectNumberBlur = (e) => {
    const inputValue = Number(inputRef.current?.value);
    if (!inputValue || isNaN(inputValue)) return false;
    let onChangeValue = 1;
    if (
      isNumber(inputValue) &&
      inputValue >= MIN_TEMPLATE_TAG_INPUT_NUMBER &&
      inputValue <= MAX_TEMPLATE_TAG_INPUT_NUMBER
    ) {
      onChangeValue = rejectNumber;
    } else if (inputValue < MIN_TEMPLATE_TAG_INPUT_NUMBER) {
      onChangeValue = MIN_TEMPLATE_TAG_INPUT_NUMBER;
    } else if (inputValue > MAX_TEMPLATE_TAG_INPUT_NUMBER) {
      onChangeValue = MAX_TEMPLATE_TAG_INPUT_NUMBER;
    }

    onChange && onChange(TemplateTagType.Number, onChangeValue);
  };

  useEffect(() => {
    setRejectNumber(initRejectNumber);
  }, [initRejectNumber]);

  const handleCancelEdit = useCallback(() => {
    setNotMatchKeywordsValue(initNotMatchKeywords);
    setIsEdit(false);
  }, [initNotMatchKeywords]);

  const handleDynamicTagChange = useCallback((value) => {
    setNotMatchKeywordsValue(value);
  }, []);

  const handleDynamicTagSave = useCallback(() => {
    if (dynamicTagSaveError) return false;

    onChange && onChange(TemplateTagType.Keyword, notMatchKeywordsValue);
    setIsEdit(false);
  }, [notMatchKeywordsValue, dynamicTagSaveError]);

  const handleResetDynamicTag = useCallback(() => {
    setNotMatchKeywordsValue(defaultNotMatchKeywords);
  }, [defaultNotMatchKeywords]);

  useEffect(() => {
    setNotMatchKeywordsValue(initNotMatchKeywords);
  }, [initNotMatchKeywords]);

  useEffect(() => {
    if (!checkArrayNotEmpty(notMatchKeywordsValue)) {
      setDynamicTagSaveError(true);
    } else {
      setDynamicTagSaveError(false);
    }
  }, [notMatchKeywordsValue]);

  return (
    <div tw={'mt-[40px] flex'} className={'reject-rt'}>
      <div className="ai-setting-label">拒识策略</div>
      <div tw={'max-w-[600px]'}>
        <div tw={'leading-[24px] select-none'}>
          若AI输出内容的前
          <InputNumber
            ref={inputRef}
            tw={'ml-[4px] mr-[4px] w-[64px]'}
            max={MAX_TEMPLATE_TAG_INPUT_NUMBER}
            min={MIN_TEMPLATE_TAG_INPUT_NUMBER}
            step={1}
            value={rejectNumber}
            onBlur={handleRejectNumberBlur}
            onChange={handleChangeRejectNumber}
          />
          个字中包含如下关键词，则系统会判定AI无能力回答当前问题，并判定当前问题为未知问题
        </div>
        <div tw={'mt-[8px]'}>
          <div tw={'flex items-center'}>
            <div
              tw={'flex-1 p-[8px 8px 0 8px]'}
              className={`
              ${dynamicTagSaveError ? 'reject-rt-border-error' : 'reject-rt-border'}
              ${isEdit ? 'reject-rt-edit' : 'reject-rt-disable'}
              reject-disable-area${!isEdit ? ' disabled' : ''}`}
            >
              <DynamicTag isEdit={isEdit} value={notMatchKeywordsValue} onChange={handleDynamicTagChange} />
            </div>
            <IconBianji
              color={isEdit ? '#00000073' : '#337EFF'}
              tw={'flex-[0 0 12px] ml-[8px] cursor-pointer'}
              onClick={handleChangeEdit}
            />
          </div>
          {dynamicTagSaveError ? <p tw={'text-[#FF4D4F] mt-[8px] mb-[8px]'}>请输入拒识关键词</p> : null}
          {isEdit ? (
            <div tw={'flex items-center mt-[8px] justify-between mr-[20px]'}>
              <div>
                <Button type={'primary'} onClick={handleDynamicTagSave}>
                  保存
                </Button>
                <Button tw={'ml-[8px]'} onClick={handleCancelEdit}>
                  取消
                </Button>
              </div>
              <div tw={'flex items-center cursor-pointer'}>
                <IconShuaxin2 tw={'mr-[4px]'} color={'#00000073'} />
                <span tw={'text-[#00000073]'} onClick={handleResetDynamicTag}>
                  恢复默认设置
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default RejectRecognition;
