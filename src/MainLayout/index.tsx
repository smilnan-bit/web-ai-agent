import type { CSSProperties } from 'react';
import React, { useMemo } from 'react';
import ErrorBoundary from '@ysf/error-boundary';
import { YSRouter } from '@ysf/ys-router';
import 'antd/dist/antd.less';
import zhCN from 'antd/es/locale/zh_CN';
import { Avatar, ConfigProvider, Layout, Menu, Popover, Spin } from 'antd';
import {
  AppstoreOutlined,
  AuditOutlined,
  BlockOutlined,
  CodeOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
  IdcardOutlined,
  LogoutOutlined,
  NodeIndexOutlined,
  RobotOutlined,
  SettingOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import classnames from 'classnames';
import { useRecoilValue } from 'recoil';
import { GlobalConfigState } from '@/model';
import { BRAND_LOGO_URL } from '@/constants/config';
import routes from '../routes/index';
import useMenu from './hooks/useMenu';
import './index.less';
import { PermissionCodeMap } from '@/routes/constanst';

const { Content, Sider } = Layout;

const SIDER_WIDTH = 240;

// 图标颜色由 CSS 统一控制，这里只设 fontSize
const MENU_ICON_MAP: Record<string, React.ReactNode> = {
  '/apps': <AppstoreOutlined style={{ fontSize: 16 }} />,
  '/toolboxs': <SettingOutlined style={{ fontSize: 16 }} />,
  '/workflow': <NodeIndexOutlined style={{ fontSize: 16 }} />,
  '/var': <CodeOutlined style={{ fontSize: 16 }} />,
  '/memory': <CustomerServiceOutlined style={{ fontSize: 16 }} />,
  '/skills': <ThunderboltOutlined style={{ fontSize: 16 }} />,
  '/card': <IdcardOutlined style={{ fontSize: 16 }} />,
  '/template': <BlockOutlined style={{ fontSize: 16 }} />,
  '/test': <AuditOutlined style={{ fontSize: 16 }} />,
  '/scheduling': <SwapOutlined style={{ fontSize: 16 }} />,
  '/ai-build': <RobotOutlined style={{ fontSize: 16 }} />,
};

const spaceStyle: CSSProperties = {
  width: SIDER_WIDTH,
  overflow: 'hidden',
  flex: `0 0 ${SIDER_WIDTH}px`,
  maxWidth: SIDER_WIDTH,
  minWidth: SIDER_WIDTH,
  transition: 'all 0.2s ease 0s',
};

const App: React.FC<{ children }> = ({ children }) => {
  const { openKeys, selectedKeys, menuItems, fullscreen, setOpenKeys, navigate, noPadding } = useMenu();
  const globalConfig = useRecoilValue(GlobalConfigState);

  const iconMenuItems = useMemo(
    () =>
      menuItems?.map((item) => ({
        ...item,
        icon: MENU_ICON_MAP[item.key as string] ?? null,
      })),
    [menuItems],
  );

  const userPopoverContent = (
    <div className="sider-user-popup">
      <div className="sider-user-popup-item sider-user-popup-nickname">
        <UserOutlined />
        <span>昵称显示</span>
      </div>
      <div className="sider-user-popup-divider" />
      <div className="sider-user-popup-item">
        <SwapOutlined />
        <span>切换企业</span>
      </div>
      <div className="sider-user-popup-item sider-user-popup-logout">
        <LogoutOutlined />
        <span>退出登录</span>
      </div>
    </div>
  );

  return (
    <ConfigProvider locale={zhCN}>
      <Layout className="main-layout">
        <div className="layout-background" />
        <Layout className="main-layout-inner">
          {!fullscreen && (
            <>
              <div style={spaceStyle} />
              <Sider width={SIDER_WIDTH} className="sider">
                {/* Logo 区域 */}
                <div className="sider-logo">
                  <img src={BRAND_LOGO_URL} alt="logo" className="sider-logo-img" />
                </div>

                {/* 导航菜单 */}
                <div className="sider-menu-wrap">
                  <Menu
                    className="layout-menu"
                    selectedKeys={selectedKeys}
                    openKeys={openKeys}
                    mode="inline"
                    items={iconMenuItems}
                    onSelect={({ key }) => navigate(key)}
                    onOpenChange={(keys) => setOpenKeys(keys as string[])}
                  />
                </div>

                {/* 底部用户区 */}
                <div className="sider-bottom">
                  <Popover
                    placement="rightBottom"
                    trigger="click"
                    content={userPopoverContent}
                    overlayClassName="sider-user-popover"
                  >
                    <div className="sider-user">
                      <Avatar
                        size={28}
                        style={{
                          background: 'linear-gradient(180deg, #5996FF 0%, #2575FF 100%)',
                          flexShrink: 0,
                          fontSize: 12,
                        }}
                      >
                        用
                      </Avatar>
                      <span className="sider-user-name">用户名称显示</span>
                    </div>
                  </Popover>
                  <span className="sider-download-btn">
                    <DownloadOutlined />
                  </span>
                </div>
              </Sider>
            </>
          )}
          <ErrorBoundary fallback={<div style={{ zIndex: 999 }}>数据异常，请刷新重试</div>}>
            <Layout className={classnames({ content: true, fullscreen, noPadding })}>
              {globalConfig ? <Content>{children}</Content> : <Spin />}
            </Layout>
          </ErrorBoundary>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

const MainLayout: React.FC = () => {
  const computePermissionList = useMemo(() => Object.values(PermissionCodeMap), []);

  return (
    <ConfigProvider locale={zhCN}>
      <YSRouter routerConfig={routes} wrapComponent={App} permissionList={computePermissionList as string[]} />
    </ConfigProvider>
  );
};

export default MainLayout;
