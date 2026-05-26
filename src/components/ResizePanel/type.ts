type direction = 'left' | 'right' | 'top' | 'bottom';

export type MaxFunc = ({ width, height }: { width: number; height: number }) => number;

export interface PanelProps {
  className?: string;
  children?: any;
  direction: direction;
  min: number;
  max: number | MaxFunc;
  value: number;
  storeKey?: string; // 让浏览器记录状态拖拽状态
  setSize?: (size: { width: number; height: number; transition: boolean }) => void;
}
