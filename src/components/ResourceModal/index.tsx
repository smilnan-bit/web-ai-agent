import React, { useRef, useState } from 'react';
import type { ModalProps } from 'antd';
import { Modal } from 'antd';
import { useRequest } from 'ahooks';
import { IconGuanbi } from '@/assets/icons';
import CategorySidebar from './CategorySidebar';
import type { CategoryItem } from './CategorySidebar';
import CenterContent from './CenterContent';
import type { CenterContentProps, GroupBase, ItemBase } from './CenterContent';
import AnchorMenu from './AnchorMenu';
import type { AnchorItem } from './AnchorMenu';
import './index.less';

export type { CategoryItem };
export type { GroupBase, ItemBase };

interface ResourceModalProps<CT, G extends GroupBase, I extends ItemBase = G> extends Omit<ModalProps, 'title'> {
  /** 弹窗标题（显示在左侧分类栏顶部） */
  title: string;
  /** 左侧分类列表 */
  categories: CategoryItem<CT>[];
  /** 当前选中分类（受控） */
  currentType: CT;
  /** 分类切换回调 */
  onTypeChange: (type: CT) => void;
  /** 左侧分类栏的操作插槽（如"创建工具"按钮） */
  actionSlot?: React.ReactNode;
  /**
   * 获取分组列表的函数，接受 { currentType, searchName } 参数
   * 切换分类或搜索时会重新调用
   */
  fetchGroups: (params: { currentType: CT; searchName: string }) => Promise<{ data?: { list?: G[] } }>;
  /**
   * 将分组数据转换为右侧锚点菜单条目（可选，默认取 group.id / group.name）
   */
  groupToAnchor?: (group: G) => AnchorItem;
  /** 透传给 CenterContent 的其余 props */
  centerContentProps: Omit<CenterContentProps<G, I>, 'groupList' | 'onSearchChange' | 'scrollContainerRef'>;
}

function ResourceModal<CT, G extends GroupBase, I extends ItemBase = G>({
  title,
  categories,
  currentType,
  onTypeChange,
  actionSlot,
  fetchGroups,
  groupToAnchor,
  centerContentProps,
  ...modalProps
}: ResourceModalProps<CT, G, I>) {
  const [searchName, setSearchName] = useState('');
  const [groupList, setGroupList] = useState<G[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { groupIdKey = 'id' } = centerContentProps;

  useRequest(() => fetchGroups({ currentType, searchName }), {
    refreshDeps: [currentType, searchName],
    onSuccess: (res) => {
      setGroupList(res?.data?.list ?? []);
    },
  });

  // 构建锚点菜单数据
  const anchorItems: AnchorItem[] = groupList.map((group) =>
    groupToAnchor
      ? groupToAnchor(group)
      : { id: group[groupIdKey as string] as string | number, name: group.name as string },
  );

  return (
    <Modal
      title={null}
      footer={null}
      className="ResourceModal"
      width={1200}
      bodyStyle={{ padding: 0, height: '740px', overflow: 'hidden' }}
      closeIcon={<IconGuanbi />}
      {...modalProps}
    >
      <div className="ResourceModal-container">
        <CategorySidebar
          title={title}
          categories={categories}
          currentType={currentType}
          onTypeChange={onTypeChange}
          actionSlot={actionSlot}
        />
        <CenterContent<G, I>
          {...centerContentProps}
          groupList={groupList}
          onSearchChange={setSearchName}
          scrollContainerRef={scrollContainerRef}
        />
        <AnchorMenu items={anchorItems} scrollContainerRef={scrollContainerRef} />
      </div>
    </Modal>
  );
}

export default ResourceModal;
