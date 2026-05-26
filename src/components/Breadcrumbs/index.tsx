import { useRouter } from '@ysf/ys-router';
import { Breadcrumb } from 'antd';
import React, { useMemo } from 'react';
import './index.less';

const prefix = 'layout-breadcrumb';
interface BreadcrumbsProps {
  extra?: React.ReactNode; // 右侧额外元素
  currentText?: React.ReactNode; // 当前页面面包屑文案
  customText?: Array<{ index: number; text?: string; onClick?: () => void }>; // 自定义某一级面包屑文案或点击事件，从0开始
  tip?: React.ReactNode; // 标题右侧提示
  style?: React.CSSProperties;
}
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ extra, currentText, customText = [], tip, style = {} }) => {
  const { currentRoute, navigate } = useRouter();

  /** 基于当前路由 生成面包屑 */
  const breadcrumbs = useMemo(() => {
    const routes = [];
    let route = currentRoute;
    while (route && !route.meta?.isNavRoot) {
      routes.unshift(route);
      route = route.parent;
    }
    return routes;
  }, [currentRoute]);

  /** routes配置meta.breadcrumb决定是否展示breadcrumb */
  if (currentRoute.meta?.breadcrumb === false) {
    return null;
  }

  return (
    <div className={prefix} style={style}>
      <Breadcrumb style={breadcrumbs.length === 1 ? { fontWeight: 600 } : {}}>
        {breadcrumbs.map((route, index) => {
          const { component } = route;
          const isCurrent = index === breadcrumbs?.length - 1;

          let currentTitle = isCurrent && currentText ? currentText : route.title;
          const customBread = customText?.find((item) => item.index === index);
          if (customBread?.text) {
            currentTitle = customBread.text;
          }

          const breadcrumbItemProps =
            component && !isCurrent
              ? {
                  onClick: customBread?.onClick || (() => navigate(route.path)),
                  className: 'breadcrumb-item__clickable',
                }
              : {};

          return (
            <Breadcrumb.Item {...breadcrumbItemProps} key={index}>
              {currentTitle}
              {tip}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
      {extra}
    </div>
  );
};

export default Breadcrumbs;
