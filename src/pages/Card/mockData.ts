import type { CardItem } from '@/api/card';

function makeCard(id: string, specName: string, specDesc: string, bg: string, textColor: string, date: string): CardItem {
  const uiJson = JSON.stringify({
    version: '0.2.0',
    theme: { primary: '#337eff', bg, text: textColor, textMinor: '#8f959e' },
    root: {
      type: 'card',
      id: 'root',
      style: { width: '100%', padding: '20px', background: bg, radius: '8px' },
      children: [
        {
          type: 'text',
          id: 'title',
          text: specName,
          as: 'h2',
          style: { fontSize: '15px', fontWeight: '600', color: textColor },
        },
        {
          type: 'text',
          id: 'desc',
          text: specDesc,
          as: 'p',
          style: { fontSize: '13px', color: '#8f959e', marginTop: '6px', lineHeight: '1.6' },
        },
      ],
    },
  });
  return { id, specName, specDesc, uiJson, dbCreateTime: date, dbUpdateTime: date };
}

export const mockCardList: CardItem[] = [
  makeCard('mock-card-001', '退款进度通知卡', '向用户展示退款申请当前状态、预计到账时间及退款渠道信息', '#f0f6ff', '#162033', '2025-05-01 09:00:00'),
  makeCard('mock-card-002', '物流轨迹卡', '多时间节点的物流轨迹展示，支持快递状态高亮与异常标记', '#f6fff0', '#162033', '2025-05-02 10:00:00'),
  makeCard('mock-card-003', '商品推荐卡', '展示商品图片、名称、价格与评分，带有"立即购买"和"收藏"操作按钮', '#fff9f0', '#162033', '2025-05-03 11:00:00'),
  makeCard('mock-card-004', '订单详情卡', '汇总订单基本信息、商品列表、费用明细与收货地址', '#f8f0ff', '#162033', '2025-05-04 09:30:00'),
  makeCard('mock-card-005', '优惠券列表卡', '展示用户持有的可用优惠券，支持按类型筛选与一键领取', '#fff0f6', '#162033', '2025-05-05 14:00:00'),
  makeCard('mock-card-006', '会员权益卡', '展示当前会员等级、积分余额、专属权益及升级所需积分', '#f0fbff', '#162033', '2025-05-06 15:00:00'),
  makeCard('mock-card-007', '价保申请卡', '引导用户填写价保申请，展示差价金额与补偿方式选项', '#fffff0', '#162033', '2025-05-07 10:30:00'),
  makeCard('mock-card-008', '换货申请进度卡', '展示换货申请各阶段节点状态，含审核、发货、签收进度', '#f0f0ff', '#162033', '2025-05-08 09:00:00'),
  makeCard('mock-card-009', '售后评价卡', '引导用户对售后服务进行5星评分与文字评价提交', '#fff5f0', '#162033', '2025-05-09 16:00:00'),
  makeCard('mock-card-010', '地址选择卡', '展示用户收货地址列表，支持新增和切换默认地址', '#f0fff5', '#162033', '2025-05-10 11:00:00'),
  makeCard('mock-card-011', '发票申请卡', '发票类型选择（增值税/普通）及抬头信息填写表单', '#faf0ff', '#162033', '2025-05-11 09:00:00'),
  makeCard('mock-card-012', '预约安装卡', '家电安装预约时间选择，展示可选时间段并确认上门信息', '#f0faff', '#162033', '2025-05-12 10:00:00'),
  makeCard('mock-card-013', '质量投诉上报卡', '引导用户描述质量问题、上传凭证图片，并选择期望解决方案', '#fff0f0', '#162033', '2025-05-13 14:30:00'),
  makeCard('mock-card-014', '积分兑换确认卡', '展示兑换商品信息、积分消耗量及兑换后余额，需用户二次确认', '#f0fff8', '#162033', '2025-05-14 09:00:00'),
  makeCard('mock-card-015', '礼品卡余额卡', '展示礼品卡面值、已用金额、剩余余额及有效期', '#fffaf0', '#162033', '2025-05-15 11:00:00'),
  makeCard('mock-card-016', '大客户专属服务卡', '大客户专属通道入口，展示专属客服、优先响应及定制权益', '#f0f0ff', '#162033', '2025-05-16 09:00:00'),
  makeCard('mock-card-017', '消费账单卡', '展示本月消费总额、订单数量及按类型分类的消费分布', '#f5fff0', '#162033', '2025-05-17 15:00:00'),
  makeCard('mock-card-018', '维修进度卡', '展示商品报修状态：受理中/检测中/维修中/已完工，含预计完工时间', '#fff0fa', '#162033', '2025-05-18 10:00:00'),
  makeCard('mock-card-019', '海外订单清关卡', '展示跨境订单清关状态、关税金额及清关注意事项', '#f0f8ff', '#162033', '2025-05-19 09:00:00'),
  makeCard('mock-card-020', '工单处理结果卡', '展示客服工单最终处理结果、处理时长及解决方案摘要', '#fff8f0', '#162033', '2025-05-20 14:00:00'),
  makeCard('mock-card-021', '安全验证卡', '账号安全验证步骤引导，支持短信/邮箱/备用码多种验证方式', '#f8f8f0', '#162033', '2025-05-21 10:00:00'),
  makeCard('mock-card-022', '增值服务推荐卡', '基于购买记录的延保服务推荐，展示服务内容、价格与选购按钮', '#f0fff0', '#162033', '2025-05-22 09:00:00'),
];
