import React, { useCallback } from 'react';
import { useControllableValue, useMemoizedFn } from 'ahooks';
import { IconBianji2, IconJiahao } from '@/assets/icons';
import './index.less';
import Uploader from '@ysf/uploader';

import { fetchUploadNosToken } from '@/api/common';
import { nosConfig } from '@/constants';
import { Modal } from 'antd';
import { DEAULT_LOGO_URL_LIST } from '@/pages/AppList/components/CreateAppModal/constanst';

interface PicUploadProps {
  value?: string; // 接收表单值
  onChange?: (value: string) => void; // 值变更回调
}

const PicUpload: React.FC<PicUploadProps> = (props) => {
  const [url, setUrl] = useControllableValue(props);
  const [modalUrl, setModalUrl] = React.useState<string>('');
  const [openModal, setOpenModal] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  const handleEditPic = useCallback((e) => {
    e.stopPropagation();
    setOpenModal(true);
  }, []);

  const handleUploadClick = useCallback((e) => {
    e.stopPropagation();
    const input = document.querySelector('.agent-template-up-wrapper input[type="file"]') as HTMLInputElement | null;
    input?.click();
  }, []);

  const handleCancel = useCallback(() => {
    setOpenModal(false);
    setModalUrl('');
    setActiveItem(null);
  }, []);

  const handleOk = useMemoizedFn(() => {
    setUrl(activeItem || '');
    setOpenModal(false);
    setModalUrl('');
    setActiveItem(null);
  });
  return (
    <div>
      <div tw={'w-[56px] h-[56px] rounded-[9px] relative'} className={'agent-template-up-wrap'}>
        <img src={url} tw={'w-full h-full rounded-[9px]'} />
        <div
          tw={'absolute  right-[0] bottom-[0] p-[4px] bg-[#00000066] hidden cursor-pointer rounded-[2px 0px 9px 2px]'}
          className={'agent-template-up-edit'}
        >
          <IconBianji2 size={12} color={'#FFFFFF'} onClick={(e) => handleEditPic(e)} />
        </div>
      </div>
      <span tw={'text-[12px] text-[#00000073] leading-[20px] mt-[4px] inline-block'}>
        仅支持JPG、JPEG、PNG、GIF、BMP格式，文件小于1M（方形图）
      </span>

      <Modal open={openModal} width={444} title={'头像选择'} onCancel={handleCancel} onOk={handleOk}>
        <div tw={'flex flex-wrap gap-[10px]'}>
          <div
            tw={'w-[56px] h-[56px] rounded-[9px]  cursor-pointer bg-[#F2F3F5] flex items-center justify-center'}
            onClick={(e) => handleUploadClick(e)}
            className={`agent-template-up-btn_default ${activeItem === modalUrl ? 'agent-template-up-btn_select' : ''}`}
          >
            {modalUrl ? (
              <img src={modalUrl} tw={'w-full h-full rounded-[9px]'} />
            ) : (
              <IconJiahao size={16} color={'#00000073'} />
            )}
          </div>
          {DEAULT_LOGO_URL_LIST.map((item) => (
            <div
              key={item}
              className={`agent-template-up-btn_default ${activeItem === item ? 'agent-template-up-btn_select' : ''}`}
              tw={'w-[56px] h-[56px] rounded-[9px]  cursor-pointer p-[2px]'}
              onClick={() => {
                setActiveItem(item);
              }}
            >
              <img src={item} tw={'w-full h-full rounded-[9px]'} />
            </div>
          ))}
        </div>
        <Uploader
          type="img"
          tip={''}
          className={'agent-template-up-wrapper'}
          accept={'.jpg,.jpeg,.png,.gif,.bmp'}
          maxSize={1}
          multiple={false}
          tokenRequest={fetchUploadNosToken}
          showUploadList={false}
          totalControl={true}
          fileList={[]}
          onChange={(fileList) => {
            if (fileList.length) {
              setModalUrl(fileList[0].url);
              setActiveItem(fileList[0].url);
            } else {
              setModalUrl('');
            }
          }}
          {...nosConfig}
        ></Uploader>
      </Modal>
    </div>
  );
};

export default PicUpload;
