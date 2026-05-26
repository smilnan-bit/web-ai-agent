import React, { useEffect, type FC } from 'react';
import { createRoot } from 'react-dom/client';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import MainLayout from './MainLayout';
import { GlobalConfigState } from './model';
import { getGlobalConfig } from './api';
import './App.less';

const App: FC = () => {
  const setGlobalConfig = useSetRecoilState(GlobalConfigState);
  useEffect(() => {
    getGlobalConfig()
      .then(({ data }) => {
        const dataWithDefault = {
          paramLimit: data?.paramLimit || 100,
          subParamLimit: data?.subParamLimit || 30,
          ...(data || {}),
        };
        setGlobalConfig((pre) => {
          const newConfig = { ...pre, ...dataWithDefault };
          window.__GLOBAL_CONFIG__ = newConfig;
          return newConfig;
        });
      })
      .catch(() => {
        // 未登录或接口失败时使用默认配置，保证所有页面可正常访问
        const fallback = { paramLimit: 100, subParamLimit: 30 };
        setGlobalConfig(fallback as any);
        window.__GLOBAL_CONFIG__ = fallback;
      });
  });
  return (
    <div className="AiAgent">
      <MainLayout />
    </div>
  );
};

const container = document.getElementById('root') as Element;
const root = createRoot(container);
root.render(
  <RecoilRoot>
    <App />
  </RecoilRoot>,
);
