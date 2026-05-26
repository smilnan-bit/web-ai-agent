import { getNodeForm } from '@flowgram.ai/free-layout-editor';

const getOtherNodeTitles = (context) => {
  const allNodes = context.node.document.getAllNodes();
  const currentNodeId = context.node.id;
  return allNodes
    .filter((node) => node.id !== currentNodeId)
    .map((node) => getNodeForm(node)?.getValueIn('title'))
    .filter((title) => title && title.trim());
};

export const checkNodeTitle = (value, context) => {
  const otherNodeTitles = getOtherNodeTitles(context);
  return otherNodeTitles.includes(value.trim());
};

const titleValidate = ({ value, context }) => {
  if (!value) return '请输入节点名称';

  // 检查title是否与其他节点重复
  if (context?.node?.document) {
    // 获取所有其他节点的title
    if (checkNodeTitle(value, context)) {
      return '节点名称重复';
    }
  }

  return undefined;
};

export { titleValidate };
