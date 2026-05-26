export enum TamplaceTabsEnum {
  ALL = 'all',
  // 商品导购
  SHOPPING = 'shopping',
  // 政策咨询
  POLICY = 'policy',
  // 订单售后
  ORDER = 'order',
  // 业务排障
  TROUBLESHOOTING = 'troubleshooting',
  // 地理位置
  GEOLOCATION = 'geolocation',
  // 员工服务
  EMPLOYEE = 'employee',
  // 通用
  GENERAL = 'general',
  // 客户案例
  CUSTOMER_CASE = 'customer_case',
  // 游戏思域
  GAME = 'game',
}

export const TabList = [
  { categoryName: '全部', categoryId: TamplaceTabsEnum.ALL },
  { categoryName: '商品导购', categoryId: TamplaceTabsEnum.SHOPPING },
  { categoryName: '政策咨询', categoryId: TamplaceTabsEnum.POLICY },
  { categoryName: '订单售后', categoryId: TamplaceTabsEnum.ORDER },
  { categoryName: '业务排障', categoryId: TamplaceTabsEnum.TROUBLESHOOTING },
  { categoryName: '地理位置', categoryId: TamplaceTabsEnum.GEOLOCATION },
  { categoryName: '员工服务', categoryId: TamplaceTabsEnum.EMPLOYEE },
  { categoryName: '通用', categoryId: TamplaceTabsEnum.GENERAL },
  { categoryName: '客户案例', categoryId: TamplaceTabsEnum.CUSTOMER_CASE },
  { categoryName: '游戏世界', categoryId: TamplaceTabsEnum.GAME },
];
