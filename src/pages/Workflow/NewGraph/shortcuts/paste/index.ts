import {
  delay,
  EntityManager,
  FlowNodeTransformData,
  type FreeLayoutPluginContext,
  type IPoint,
  type PlaygroundConfigEntity,
  Rectangle,
  type ShortcutsHandler,
  WorkflowDocument,
  WorkflowDragService,
  WorkflowHoverService,
  type WorkflowJSON,
  WorkflowNodeEntity,
  type WorkflowNodeMeta,
  WorkflowSelectService,
  type Playground,
  type WorkflowNodeJSON,
  getNodeForm,
} from '@flowgram.ai/free-layout-editor';
import { generateUniqueTitle } from '../../utils';

import type { WorkflowClipboardData, WorkflowClipboardRect } from '../type';
import { FlowCommandId, WorkflowClipboardDataID } from '../constants';
import { generateUniqueWorkflow } from './unique-workflow';
import { message } from 'antd';
import { WorkflowNodeType } from '../../nodes/constants';

export class PasteShortcut implements ShortcutsHandler {
  public commandId = FlowCommandId.PASTE;

  public shortcuts = ['meta v', 'ctrl v'];

  private playgroundConfig: PlaygroundConfigEntity;

  private document: WorkflowDocument;

  private selectService: WorkflowSelectService;

  private entityManager: EntityManager;

  private hoverService: WorkflowHoverService;

  private dragService: WorkflowDragService;

  private playground: Playground;

  /**
   * initialize paste shortcut handler - 初始化粘贴快捷键处理器
   */
  constructor(context: FreeLayoutPluginContext) {
    this.playgroundConfig = context.playground.config;
    this.document = context.get(WorkflowDocument);
    this.selectService = context.get(WorkflowSelectService);
    this.entityManager = context.get(EntityManager);
    this.hoverService = context.get(WorkflowHoverService);
    this.dragService = context.get(WorkflowDragService);
    this.playground = context.playground;
    this.execute = this.execute.bind(this);
  }

  /**
   * 检查节点数量是否超过最大限制 - Check if node count exceeds max limit
   * @returns 返回检查结果和相关信息 - Returns check result and related info
   */
  private checkMaxNum(
    nodeJSON: WorkflowNodeJSON,
    jsonTypeNodesNum: number,
  ): {
    valid: boolean;
    maxNum?: number;
    title?: string;
  } {
    const nodeRegistry = this.document.getNodeRegistry(nodeJSON.type);
    const maxNum = nodeRegistry?.meta?.maxNum;
    if (!maxNum) {
      return { valid: true };
    }
    const sameTypeNodes = this.document.getAllNodes().filter((item) => item.getNodeMeta().type === nodeJSON.type);
    if (sameTypeNodes.length + jsonTypeNodesNum > maxNum) {
      return {
        valid: false,
        maxNum,
        title: nodeRegistry?.info?.title,
      };
    }
    return { valid: true };
  }

  /**
   * 递归收集所有节点并统计类型数量（包括group内部的子节点）- Recursively collect all nodes and count by type (including children in group)
   * @returns 返回节点类型数量映射和所有节点列表 - Returns node type count map and all nodes list
   */
  private collectAllNodesAndCount(nodes: WorkflowNodeJSON[]): {
    nodeTypeCountMap: Map<string | number, number>;
    allNodes: WorkflowNodeJSON[];
  } {
    const allNodes: WorkflowNodeJSON[] = [];
    const nodeTypeCountMap = new Map<string | number, number>();
    const collect = (nodeList: WorkflowNodeJSON[]) => {
      for (const node of nodeList) {
        allNodes.push(node);
        // 统计节点类型数量 - Count node type
        const count = nodeTypeCountMap.get(node.type) || 0;
        nodeTypeCountMap.set(node.type, count + 1);
        // 如果是group节点，递归收集其子节点 - If it's a group node, recursively collect its children
        if (node.type === WorkflowNodeType.Group && node.blocks?.length) {
          collect(node.blocks);
        }
      }
    };
    collect(nodes);
    return { nodeTypeCountMap, allNodes };
  }

  /**
   * execute paste action - 执行粘贴操作
   */
  public async execute(): Promise<WorkflowNodeEntity[] | undefined> {
    if (this.readonly) {
      return;
    }
    const data = await this.tryReadClipboard();
    if (!data) {
      return;
    }
    if (!this.isValidData(data)) {
      return;
    }
    const nodes = this.apply(data);
    if (nodes.length > 0) {
      message.success({
        content: '复制成功',
      });
      // wait for nodes to render - 等待节点渲染
      await this.nextTick();
      // scroll to visible area - 滚动到可视区域
      this.scrollNodesToView(nodes);
    }
    return nodes;
  }

  /** apply clipboard data - 应用剪切板数据 */
  public apply(data: WorkflowClipboardData): WorkflowNodeEntity[] {
    // extract raw json from clipboard data - 从剪贴板数据中提取原始JSON
    const { json: rawJSON } = data;
    const json = generateUniqueWorkflow({
      json: rawJSON,
      isUniqueId: (id: string) => !this.entityManager.getEntityById(id),
    });

    const offset = this.calcPasteOffset(data.bounds);
    const parent = this.getSelectedContainer(json.nodes);
    this.applyOffset({ json, offset, parent });
    // 处理节点标题数字递增 - Process node title number increment
    this.processNodeTitles(json);

    const { nodes } = this.document.batchAddFromJSON(json, {
      parent,
    });
    this.selectNodes(nodes);
    // 这里需要 focus 画布才能继续使用快捷键
    // The focus canvas is needed here to continue using the shortcuts
    this.playground.node.focus();
    return nodes;
  }

  /**
   * readonly - 是否只读
   */
  private get readonly(): boolean {
    return this.playgroundConfig.readonly;
  }

  private isValidData(data?: WorkflowClipboardData): boolean {
    if (data?.type !== WorkflowClipboardDataID) {
      message.error({
        content: '无效的剪贴板数据',
      });
      return false;
    }
    // Cross-domain means different environments, different plugins, cannot be copied - 跨域名表示不同环境，上架插件不同，不能复制
    if (data.source.host !== window.location.host) {
      message.error({
        content: '不能从不同域名粘贴节点',
      });
      return false;
    }
    // Check container - 检查容器
    const parent = this.getSelectedContainer(data.json.nodes);

    // 递归收集所有节点并统计类型数量（包括group内部的子节点）- Recursively collect all nodes and count by type (including children in group)
    const { nodeTypeCountMap, allNodes } = this.collectAllNodesAndCount(data.json.nodes);
    // 使用Set记录已检查的节点类型，避免重复检查 - Use Set to track checked node types to avoid duplicate checks
    const checkedTypes = new Set<string | number>();
    // 先检查所有节点的最大数量限制（包括group类型及其子节点）- Check max number limit for all nodes (including group type and its children)
    for (const nodeJSON of allNodes) {
      // 如果该类型已经检查过，跳过 - Skip if this type has already been checked
      if (checkedTypes.has(nodeJSON.type)) {
        continue;
      }
      checkedTypes.add(nodeJSON.type);
      const sameTypeNodesCount = nodeTypeCountMap.get(nodeJSON.type) || 0;
      const checkResult = this.checkMaxNum(nodeJSON, sameTypeNodesCount);
      if (!checkResult.valid) {
        // 在isValidData中统一处理message提示 - Handle message prompt in isValidData
        message.warning(`最多只能添加${checkResult.maxNum}个${checkResult.title}节点`);
        return false;
      }
    }
    // 再检查容器限制 - Then check container restrictions
    for (const nodeJSON of data.json.nodes) {
      const res = this.dragService.canDropToNode({
        dragNodeType: nodeJSON.type,
        dropNodeType: parent?.flowNodeType,
        dropNode: parent,
      });
      if (!res.allowDrop) {
        message.error({
          content: res.message ?? '不能粘贴到无效的容器',
        });
        return false;
      }
    }
    return true;
  }

  /** try to read clipboard - 尝试读取剪贴板 */
  private async tryReadClipboard(): Promise<WorkflowClipboardData | undefined> {
    try {
      // need user permission to access clipboard, may throw NotAllowedError - 需要用户授予网页剪贴板读取权限, 如果用户没有授予权限, 代码可能会抛出异常 NotAllowedError
      const text: string = (await navigator.clipboard.readText()) || '';
      const clipboardData: WorkflowClipboardData = JSON.parse(text);
      return clipboardData;
    } catch {
      // clipboard data is not fixed, no need to show error - 这里本身剪贴板里的数据就不固定，所以没必要报错
      return;
    }
  }

  /** calculate paste offset - 计算粘贴偏移 */
  private calcPasteOffset(boundsData: WorkflowClipboardRect): IPoint {
    // extract bounds data - 提取边界数据
    const { x, y, width, height } = boundsData;
    const rect = new Rectangle(x, y, width, height);
    const { center } = rect;
    const mousePos = this.hoverService.hoveredPos;
    return {
      x: mousePos.x - center.x,
      y: mousePos.y - center.y,
    };
  }

  /**
   * apply offset to node positions - 应用偏移到节点位置
   */
  private applyOffset(params: { json: WorkflowJSON; offset: IPoint; parent?: WorkflowNodeEntity }): void {
    const { json, offset, parent } = params;
    json.nodes.forEach((nodeJSON) => {
      if (!nodeJSON.meta?.position) {
        return;
      }
      // calculate new position - 计算新位置
      let position = {
        x: nodeJSON.meta.position.x + offset.x,
        y: nodeJSON.meta.position.y + offset.y,
      };
      if (parent) {
        position = this.dragService.adjustSubNodePosition(nodeJSON.type as string, parent, position);
      }
      nodeJSON.meta.position = position;
    });
  }

  /** get selected container node - 获取鼠标选中的容器 */
  private getSelectedContainer(nodes: WorkflowNodeJSON[]): WorkflowNodeEntity | undefined {
    const { activatedNode } = this.selectService;
    const activeNodeMeta = activatedNode?.getNodeMeta<WorkflowNodeMeta>();
    if (activeNodeMeta?.isContainer) {
      // 同类型的节点快捷键复制粘贴时，默认是粘贴到外层画布上（防止类似批处理节点粘贴到自己内部）
      if (nodes.find((node) => node.type === activeNodeMeta?.type)) return undefined;
    }
    return activeNodeMeta?.isContainer ? activatedNode : undefined;
  }

  /** select nodes - 选中节点 */
  private selectNodes(nodes: WorkflowNodeEntity[]): void {
    this.selectService.selection = nodes;
  }

  /** scroll to nodes - 滚动到节点 */
  private async scrollNodesToView(nodes: WorkflowNodeEntity[]): Promise<void> {
    const nodeBounds = nodes.map((node) => node.getData(FlowNodeTransformData).bounds);
    await this.document.playgroundConfig.scrollToView({
      bounds: Rectangle.enlarge(nodeBounds),
    });
  }

  /** wait for next frame - 等待下一帧 */
  private async nextTick(): Promise<void> {
    // 16ms is one render frame - 16ms 为一个渲染帧
    const frameTime = 16;
    await delay(frameTime);
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  /**
   * process node titles with number increment - 处理节点标题数字递增
   */
  private processNodeTitles(json: WorkflowJSON): void {
    const allTitles = this.entityManager
      .getEntities<WorkflowNodeEntity>(WorkflowNodeEntity)
      .filter((n) => n.id !== 'root')
      .map((node) => {
        const form = getNodeForm(node);
        const title = form?.getValueIn('title');
        return title;
      });
    const allTitlesSet = new Set(allTitles);

    // 递归处理节点及其子节点 - Recursively process nodes and their children
    const processNode = (nodeJSON: WorkflowNodeJSON): void => {
      // 处理子节点 - Even without title, if it's a group node, still need to process its children
      if (nodeJSON.blocks?.length) {
        nodeJSON.blocks.forEach(processNode);
      }

      if (!nodeJSON.data?.title || !nodeJSON.type) {
        return;
      }
      const newTitle = generateUniqueTitle(nodeJSON.data.title, allTitlesSet);
      allTitlesSet.add(newTitle);
      nodeJSON.data.title = newTitle;
    };

    json.nodes.forEach(processNode);
  }
}
