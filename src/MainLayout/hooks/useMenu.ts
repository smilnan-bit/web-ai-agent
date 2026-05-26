import type { RouteTypeExtendsI } from '@ysf/ys-router';
import { useRouter } from '@ysf/ys-router';
import { useEffect, useMemo, useState } from 'react';

export default function useMenu() {
  const { currentRoute, navigate } = useRouter();

  /** 动态渲染左侧导航条使用 */
  const navParent = useMemo(() => {
    /** 通过currentRoute.parent获取顶级路由 */
    let parentRoute = currentRoute;
    while (parentRoute?.parent && !parentRoute?.meta?.isNavRoot) {
      parentRoute = parentRoute.parent;
    }
    return parentRoute;
  }, [currentRoute]);

  /** 设置打开的菜单项 */
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  useEffect(() => {
    const keys = [];
    let parentRoute = currentRoute;
    while (parentRoute?.parent) {
      keys.unshift(parentRoute.path);
      parentRoute = parentRoute.parent;
    }
    setOpenKeys(keys);
  }, [currentRoute]);

  /** 设置选中菜单项 */
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  useEffect(() => {
    let route = currentRoute;
    while (route?.hidden) {
      route = route.parent;
    }

    setSelectedKeys([route?.path || '']);
  }, [currentRoute]);

  /** 左侧Menu数据 */
  const menuItems = useMemo(() => {
    const getMenuItems = (children: RouteTypeExtendsI[]) => {
      return children
        ?.filter(({ _isHasAuth, hidden }) => {
          return _isHasAuth && !hidden; // ys-router内置，判断是否有权限
        })
        .map((route) => {
          const menu: any = {
            key: route.path,
            label: route.title,
            path: route.path,
          };
          if (route.items?.length) {
            children = getMenuItems(route.items);
            menu.children = children.length > 0 ? children : undefined;
          }
          return menu;
        });
    };

    return getMenuItems(navParent?.items || []);
  }, [navParent?.items]);

  /** 当前路由是否全屏展示 */
  const fullscreen = useMemo(() => {
    return !!currentRoute?.fullscreen;
  }, [currentRoute?.fullscreen]);

  // 当前路由是否无padding
  const noPadding = useMemo(() => {
    return !!currentRoute?.nopadding;
  }, [currentRoute?.nopadding]);

  return {
    openKeys,
    setOpenKeys,
    selectedKeys,
    menuItems,
    fullscreen,
    navigate,
    noPadding,
  };
}
