/**
 * Dialog 节点 a2ui 卡片分支 port id 约定。
 * port id 形如 `dialog-cotui-${actionName}`，其中 actionName 来自 spec 的 button.action.name。
 * 单独抽出来是为了避免 dialog/index.ts 和 dialog/node-content.tsx 出现魔法字符串。
 */

export const COTUI_PORT_PREFIX = 'cotui';
const FULL_PREFIX = `dialog-${COTUI_PORT_PREFIX}-`;

export function buildCotUiPortId(actionName: string): string {
  return `${FULL_PREFIX}${actionName}`;
}

export function parseCotUiPortId(portId?: string): string | null {
  if (!portId || !portId.startsWith(FULL_PREFIX)) return null;
  return portId.slice(FULL_PREFIX.length);
}
