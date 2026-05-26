import React, { useMemo } from 'react';
import YsHeader from '@ysf/ys-header';
import { DownloadCenter } from '@ysf/download-center';
import type { FC } from 'react';
import { useSetRecoilState } from 'recoil';
import { APP_GUID, BRAND_LOGO_URL } from '@/constants/config';
import { isDevelopment, isOnline } from '@/constants';
import { getDownloadList, getUnDownloadNum, postFileDownloadNum } from '@/api/common';
import { GlobalConfigState } from '@/model';

const Header: FC = () => {
  const setGlobalState = useSetRecoilState(GlobalConfigState);
  const customDisplayBlock = useMemo(() => {
    return (
      <DownloadCenter
        getNotifyFunc={(notifyFunc) => setGlobalState((pre) => ({ ...pre, ...{ notifyDownloadCenter: notifyFunc } }))}
        getDownloadList={getDownloadList}
        getUnDownloadNum={getUnDownloadNum}
        addFileDownloadNum={postFileDownloadNum}
        className="m-download-center-voc"
      />
    );
  }, [setGlobalState]);

  return (
    <YsHeader
      customDisplayBlock={customDisplayBlock}
      brandLogo={BRAND_LOGO_URL}
      logoClick={() => {
        window.location.href = isDevelopment ? '/' : '/ai-agent/';
      }}
      userInfo={{
        avatarBgColor: 'linear-gradient(180deg, #5996FF 0%, #2575FF 100%)',
      }}
      links={[]}
      isOnline={isOnline}
      highlight={[] as any}
      apps={{
        showMore: true,
        appGuid: APP_GUID[isOnline ? 'online' : 'test'],
        isYS: true,
      }}
      onChangeEntOk={(v) => console.log(v)}
    />
  );
};

export default Header;
