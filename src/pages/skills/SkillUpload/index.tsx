import React, { useCallback, useEffect, useState } from 'react';
import Uploader from '@ysf/uploader';
import { message, Modal, type ModalProps } from 'antd';
import { nosConfig } from '@/constants';
import { fetchUploadNosToken } from '@/api/common';
import { uploadSkill } from '@/api';
import './index.less';

const maxSize = 100;
const SkillUpload: React.FC<ModalProps> = (modalProps) => {
  const { open, onCancel, onOk } = modalProps;
  const [fileList, setFileList] = useState<{ url: string }[]>([]);

  const onUpload = useCallback(
    (e) => {
      if (!fileList[0]?.url) {
        message.error('请上传文件包');
        return;
      }
      const start = fileList[0]?.url.lastIndexOf('/');
      const nosKey = fileList[0]?.url.slice(start + 1);
      uploadSkill({ nosKey }).then(() => {
        onOk?.(e);
      });
    },
    [fileList, onOk],
  );

  useEffect(() => {
    if (open) {
      setFileList([]);
    }
  }, [open]);

  return (
    <Modal title="上传Skill" open={open} onCancel={onCancel} okText="上传" onOk={onUpload}>
      <div tw="mb-1">
        <span tw="text-red-500">*</span>上传文件
      </div>
      <Uploader
        type="other"
        accept=".zip"
        maxSize={maxSize}
        tip={''}
        tokenRequest={fetchUploadNosToken}
        suffixValidate
        onChange={(fileList) => {
          setFileList(fileList?.length ? fileList : []);
        }}
        fileList={fileList}
        className={`SkillUpload ${fileList?.length ? 'hidden' : ''}`}
        dragUpload={true}
        {...nosConfig}
      >
        <div>
          <div>请将文件拖拽此处，或点击上传</div>
          <div>只能上传Skill文件包，格式为.zip</div>
        </div>
      </Uploader>
    </Modal>
  );
};
export default SkillUpload;
