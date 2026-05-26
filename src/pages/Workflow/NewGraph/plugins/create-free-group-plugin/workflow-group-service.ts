import { injectable, inject } from 'inversify';
import { DisposableCollection, Disposable } from '@flowgram.ai/utils';
import { FreeLayoutPluginContext } from '@flowgram.ai/free-layout-editor';
import {
  WorkflowDocument,
  WorkflowLineEntity,
  WorkflowOperationBaseService,
  WorkflowNodeEntity,
  WorkflowNodeJSON,
  WorkflowNodeRegistry,
} from '@flowgram.ai/free-layout-core';
import { HistoryService } from '@flowgram.ai/free-history-plugin';
import {
  NodeIntoContainerService,
  NodeIntoContainerType,
} from '@flowgram.ai/free-container-plugin';
import { FlowGroupService } from '@flowgram.ai/document';
import { dagreLib, DagreGraph } from '@flowgram.ai/free-auto-layout-plugin';
import { TransformData } from '@flowgram.ai/core';

import { WorkflowGroupUtils } from './utils';
import { WorkflowGroupPluginOptions } from './type';
import { WorkflowNodeType } from '../../nodes';
import { message } from 'antd';
import { CopyShortcut } from '../../shortcuts/copy';

@injectable()
/** 分组服务 */
export class WorkflowGroupService extends FlowGroupService {
  @inject(WorkflowDocument) private document: WorkflowDocument;

  @inject(WorkflowOperationBaseService) freeOperationService: WorkflowOperationBaseService;

  @inject(HistoryService) private historyService: HistoryService;

  @inject(NodeIntoContainerService) private nodeIntoContainerService: NodeIntoContainerService;

  @inject(WorkflowGroupPluginOptions) private opts: WorkflowGroupPluginOptions;

  @inject(FreeLayoutPluginContext) private context: FreeLayoutPluginContext;

  private toDispose = new DisposableCollection();

  public ready(): void {
    this.toDispose.push(this.listenContainer());
  }

  public dispose(): void {
    this.toDispose.dispose();
  }

  /** 创建分组节点 */
  public createGroup(nodes: WorkflowNodeEntity[]): WorkflowNodeEntity | undefined {
    if (!WorkflowGroupUtils.validate(nodes, (errorMessage)=> {
      message.error(errorMessage);
    })) {
      return;
    }
    const parent = nodes[0].parent ?? this.document.root;
    const nodeRegistry = this.document.getNodeRegistry<WorkflowNodeRegistry>(
      WorkflowNodeType.Group
    );
    let groupJSON: WorkflowNodeJSON = nodeRegistry?.onAdd?.(this.context);
    if (this.opts.initGroupJSON) {
      groupJSON = this.opts.initGroupJSON(groupJSON, nodes);
    }
    this.historyService.startTransaction();
    this.document.createWorkflowNodeByType(
      WorkflowNodeType.Group,
      {
        x: 0,
        y: 0,
      },
      groupJSON,
      parent.id
    );
    nodes.forEach((node) => {
      this.freeOperationService.moveNode(node, {
        parent: groupJSON.id,
      });
    });
    this.historyService.endTransaction();
  }

  /** 取消分组 */
  public ungroup(groupNode: WorkflowNodeEntity): void {
    const groupBlocks = groupNode.blocks.slice();
    if (!groupNode.parent) {
      return;
    }
    const groupPosition = groupNode.transform.position;

    this.historyService.startTransaction();
    groupBlocks.forEach((node) => {
      this.freeOperationService.moveNode(node, {
        parent: groupNode.parent?.id,
      });
    });
    groupNode.dispose();
    groupBlocks.forEach((node) => {
      const transform = node.getData(TransformData);
      const position = {
        x: transform.position.x + groupPosition.x,
        y: transform.position.y + groupPosition.y,
      };
      this.freeOperationService.updateNodePosition(node, position);
    });
    this.historyService.endTransaction();
  }

  /** 复制分组节点 */
  public async copy(groupNode: WorkflowNodeEntity): Promise<void> {
    // 递归获取分组内的所有子节点（用于获取边）
    const allNodes = this.getAllNodesInGroup(groupNode);
    
    // 使用现有的复制逻辑，只复制到剪贴板，不粘贴
    const copyShortcut = new CopyShortcut(this.context);
    
    // 传入所有节点，这样 getEdgeJSONs 能获取所有边
    // getNodeJSONs 会为每个节点调用 toNodeJSON，分组节点的 toNodeJSON 会自动包含 blocks
    const data = copyShortcut.toClipboardData(allNodes);
    if (data) {
      // 过滤掉子节点，只保留分组节点（子节点已经在分组节点的 blocks 中了）
      // 获取所有子节点的 ID 集合
      const childNodeIds = new Set<string>();
      const collectChildIds = (node: WorkflowNodeEntity) => {
        const blocks = node.blocks || [];
        blocks.forEach((child) => {
          childNodeIds.add(child.id);
          // 如果子节点也是分组节点，递归收集其子节点
          if (child.flowNodeType === WorkflowNodeType.Group) {
            collectChildIds(child);
          }
        });
      };
      collectChildIds(groupNode);
      
      // 只保留分组节点，过滤掉所有子节点
      data.json.nodes = data.json.nodes.filter((node) => {
        // 如果是分组节点且是我们要复制的分组节点，保留
        if (node.type === WorkflowNodeType.Group && node.id === groupNode.id) {
          return true;
        }
        // 如果是子节点，过滤掉（因为它们已经在分组节点的 blocks 中了）
        return !childNodeIds.has(node.id);
      });
      
      try {
        await navigator.clipboard.writeText(JSON.stringify(data));
        message.success({
          content: '分组已复制到剪贴板',
        });
      } catch (err) {
        console.error('Failed to write text: ', err);
        message.error({
          content: '复制失败',
        });
      }
    }
  }

  /** 递归获取分组内的所有节点（用于获取边） */
  private getAllNodesInGroup(groupNode: WorkflowNodeEntity): WorkflowNodeEntity[] {
    const allNodes: WorkflowNodeEntity[] = [groupNode];
    const blocks = groupNode.blocks || [];
    
    blocks.forEach((childNode) => {
      allNodes.push(childNode);
      // 如果子节点也是分组节点，递归获取其内部的节点（用于获取边）
      if (childNode.flowNodeType === WorkflowNodeType.Group) {
        allNodes.push(...this.getAllNodesInGroup(childNode).slice(1)); // slice(1) 排除重复的分组节点本身
      }
    });
    
    return allNodes;
  }

  /** 将分组节点堆叠 */
  public stack(groupNode: WorkflowNodeEntity): void {
    const groupBlocks = groupNode.blocks.slice();
    if (groupBlocks.length === 0) {
      return;
    }
    const baseX = Math.min(...groupBlocks.map((node) => node.transform.position.x));
    const baseY = Math.min(...groupBlocks.map((node) => node.transform.position.y));
    const GAP = 5;
    this.historyService.startTransaction();
    groupBlocks.forEach((node, index) => {
      this.freeOperationService.updateNodePosition(node, {
        x: baseX + index * GAP,
        y: baseY + index * GAP,
      });
    });
    this.historyService.endTransaction();
  }

  /** 将分组节点使用 Dagre 平铺 */
  public tile(groupNode: WorkflowNodeEntity): void {
    const groupBlocks = groupNode.blocks.slice();
    if (groupBlocks.length === 0) {
      return;
    }
    // 记录当前子节点的最小 x 和最小 y，用于保持 groupNode 左上角位置不变
    const originalMinX = Math.min(...groupBlocks.map((node) => node.transform.position.x));
    const originalMinY = Math.min(...groupBlocks.map((node) => node.transform.position.y));
    
    const allLines = this.document.linesManager?.getAllLines?.() ?? [];
    // 先根据连线拓扑确定节点顺序，避免后续布局跳跃
    const orderedNodes = this.buildNodeOrder(groupBlocks, allLines);
    // 优先尝试 Dagre，根据真实连线顺序排列
    const dagrePositions = this.buildDagrePositions(orderedNodes, allLines);
    // Dagre 结果可用则直接使用，否则回退为网格布局
    let positions =
      dagrePositions.length > 0 ? dagrePositions : this.buildGridPositions(orderedNodes);
    // 若布局过于"扁长"，则退回网格，保持更合理的宽高比
    if (positions.length > 0) {
      const { width, height } = this.getLayoutBoundingBox(positions);
      if (height === 0 || width / Math.max(height, 1) > TILE_MAX_ASPECT_RATIO) {
        positions = this.buildGridPositions(orderedNodes);
      }
    }
    if (positions.length === 0) {
      return;
    }
    // 计算新布局的最小 x 和最小 y
    const newMinX = Math.min(...positions.map((item) => item.x));
    const newMinY = Math.min(...positions.map((item) => item.y));
    // 计算偏移量，使新的最小位置与原来的保持一致
    const offsetX = originalMinX - newMinX;
    const offsetY = originalMinY - newMinY;
    this.historyService.startTransaction();
    positions.forEach(({ node, x, y }) => {
      this.freeOperationService.updateNodePosition(node, {
        x: x + offsetX,
        y: y + offsetY,
      });
    });
    this.historyService.endTransaction();
  }

  /**
   * 使用 Dagre 计算节点的自动布局位置
   *
   * 思路：
   * 1. 根据传入的节点和连线构建一个有向图（DagreGraph）
   * 2. 为每个节点设置尺寸信息，方便 Dagre 计算排布
   * 3. 只保留当前分组内的有效连线（from/to 都在 nodes 中）
   * 4. 调用 dagreLib.layout 让 Dagre 生成每个节点的坐标
   * 5. 将 Dagre 的中心点坐标转换为左上角坐标，返回统一的 NodePosition 结构
   *
   * 该方法只负责“根据拓扑和节点尺寸给出相对布局”，不负责最终的绝对偏移（偏移在 tile 中做）
   */
  private buildDagrePositions(
    nodes: WorkflowNodeEntity[],
    allLines: WorkflowLineEntity[]
  ): NodePosition[] {
    // 边界情况：没有节点时，不需要布局
    if (nodes.length === 0) {
      return [];
    }

    // 只关心当前分组内的节点，后面会据此过滤连线
    const nodeIdSet = new Set(nodes.map((node) => node.id));

    // 创建 Dagre 有向图，禁止多重边和复合节点（这里不需要容器 / 子图能力）
    // Dagre 只负责给节点“排队”，同一层之间的间距由 nodesep / ranksep 控制
    const graph = new DagreGraph({ multigraph: false, compound: false });
    graph.setGraph({
      // 从左到右布局（LR = left to right），符合工作流“自左向右”的阅读习惯
      rankdir: 'LR',
      // 同一层节点之间的水平间距
      nodesep: TILE_GAP_X,
      // 上下层之间的垂直间距：在基础间距上加半个默认高度，让层级更疏朗一点
      ranksep: TILE_GAP_Y + DEFAULT_HEIGHT / 2,
      // 整体布局的左右 / 上下留白
      marginx: 20,
      marginy: 20,
    });
    // 默认的边数据结构，这里不需要额外属性，返回空对象即可
    graph.setDefaultEdgeLabel(() => ({}));

    // 为每个节点注册尺寸信息，Dagre 会基于这些尺寸计算节点中心点坐标
    nodes.forEach((node) => {
      const { width, height } = this.getNodeSize(node);
      graph.setNode(node.id, { width, height });
    });

    // 过滤出“有效连线”：from / to 都存在且在当前分组节点集合中
    const validEdges = allLines.filter((line) => {
      const from = line.from;
      const to = line.to;
      return !!from && !!to && nodeIdSet.has(from.id) && nodeIdSet.has(to.id);
    });

    // 将有效连线写入 Dagre 图中，形成拓扑结构
    validEdges.forEach((line) => {
      const from = line.from;
      const to = line.to;
      if (from && to) {
        graph.setEdge(from.id, to.id);
      }
    });

    // 如果没有任何边，Dagre 无法给出有意义的拓扑布局，直接返回空数组
    if (graph.edges().length === 0) {
      return [];
    }

    // 调用 Dagre 布局算法，计算每个节点的中心点坐标和最终尺寸
    dagreLib.layout(graph, {});

    // 将 Dagre 节点信息转换为内部使用的 NodePosition
    // Dagre 返回的是“中心点坐标 + 宽高”，这里统一转换为“左上角坐标 + 宽高”
    return nodes
      .map((node) => {
        const dagreNode = graph.node(node.id);
        if (!dagreNode) {
          return undefined;
        }
        return {
          node,
          // x/y 为左上角坐标：中心点减去一半宽 / 高
          x: dagreNode.x - (dagreNode.width ?? 0) / 2,
          y: dagreNode.y - (dagreNode.height ?? 0) / 2,
          width: dagreNode.width ?? DEFAULT_WIDTH,
          height: dagreNode.height ?? DEFAULT_HEIGHT,
        };
      })
      // 过滤掉找不到 dagreNode 的情况（理论上不应该发生，但做一下防御性处理）
      .filter(Boolean) as NodePosition[];
  }

  /**
   * 构建网格布局坐标
   *
   * 作为 Dagre 自动布局的兜底方案：当没有有效连线，或者 Dagre 结果过于“扁长”时，
   * 使用简单的网格（多行多列）方式将节点排布得更紧凑、宽高比更均衡。
   *
   * 布局规则：
   * 1. 按节点数量的平方根估算列数，尽量让行数和列数接近，从而保证整体是一个“接近正方形”的网格
   * 2. 每一行从左到右依次放置节点，节点之间按 `TILE_GAP_X` 预留水平间距
   * 3. 每一行的行高取该行内节点的最大高度，行与行之间按 `TILE_GAP_Y` 预留垂直间距
   *
   * @param nodes 需要做网格布局的节点集合
   * @returns 每个节点的网格布局坐标和尺寸信息
   */
  private buildGridPositions(nodes: WorkflowNodeEntity[]): NodePosition[] {
    // 无节点时直接返回空数组
    if (nodes.length === 0) {
      return [];
    }

    // 简单按 sqrt(n) 估算列数（列数约为 √n），可以让网格整体更趋近于正方形，避免一行太长或一列太高
    const columns = Math.max(1, Math.floor(Math.sqrt(nodes.length)));
    const positions: NodePosition[] = [];
    // 当前行的起始 Y 坐标
    let currentY = 0;

    // 按行切片，每行最多 columns 个节点
    for (let rowStart = 0; rowStart < nodes.length; rowStart += columns) {
      const rowNodes = nodes.slice(rowStart, rowStart + columns);
      // 当前行从左到右的 X 坐标起点
      let currentX = 0;
      // 记录当前行中节点的最大高度，用于计算下一行的 Y 偏移量
      let rowHeight = 0;

      // 遍历当前行的每个节点，依次从左到右排布
      rowNodes.forEach((node) => {
        const { width, height } = this.getNodeSize(node);
        positions.push({
          node,
          x: currentX,
          y: currentY,
          width,
          height,
        });
        // 下一个节点的 X 坐标 = 当前节点右侧再加上水平间距
        currentX += width + TILE_GAP_X;
        // 行高取该行中所有节点高度的最大值
        rowHeight = Math.max(rowHeight, height);
      });

      // 下一行的 Y 坐标 = 当前行底部再加上垂直间距
      currentY += rowHeight + TILE_GAP_Y;
    }

    return positions;
  }

  /**
   * 构建节点顺序
   * 使用拓扑排序算法（Kahn算法）根据节点之间的连线关系确定节点的执行顺序
   * 这样可以确保在布局时，有依赖关系的节点能够按照正确的顺序排列，避免布局跳跃
   * 
   * @param nodes - 需要排序的节点数组
   * @param lines - 所有连线实体数组，用于确定节点之间的依赖关系
   * @returns 按照拓扑顺序排列的节点数组
   */
  private buildNodeOrder(
    nodes: WorkflowNodeEntity[],
    lines: WorkflowLineEntity[]
  ): WorkflowNodeEntity[] {
    // 边界情况：如果没有节点，直接返回空数组
    if (nodes.length === 0) {
      return [];
    }
    
    // 创建节点ID到节点实体的映射，方便后续快速查找
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    
    // 初始化每个节点的入度（指向该节点的边的数量）
    // 入度为0的节点表示没有前置依赖，可以优先处理
    const inDegree = new Map<string, number>();
    nodeMap.forEach((_value, key) => {
      inDegree.set(key, 0);
    });
    
    // 构建邻接表：记录每个节点指向的所有邻居节点
    // 使用 Set 避免重复边
    const adjacency = new Map<string, Set<string>>();
    
    // 遍历所有连线，构建有向图并计算每个节点的入度
    lines.forEach((line) => {
      const from = line.from;
      const to = line.to;
      
      // 跳过无效的连线：起点或终点不存在，或不在当前节点集合中
      if (!from || !to || !nodeMap.has(from.id) || !nodeMap.has(to.id)) {
        return;
      }
      
      // 如果起点还没有邻接表，创建一个新的 Set
      if (!adjacency.has(from.id)) {
        adjacency.set(from.id, new Set());
      }
      
      const neighbors = adjacency.get(from.id)!;
      
      // 避免重复边：如果这条边已经存在，跳过
      if (!neighbors.has(to.id)) {
        neighbors.add(to.id);
        // 终点的入度加1（因为有一条边指向它）
        inDegree.set(to.id, (inDegree.get(to.id) ?? 0) + 1);
      }
    });
    
    // Kahn算法：使用队列存储所有入度为0的节点（没有前置依赖的节点）
    const queue: string[] = [];
    inDegree.forEach((value, key) => {
      if (value === 0) {
        queue.push(key);
      }
    });
    
    // 存储拓扑排序的结果
    const ordered: WorkflowNodeEntity[] = [];
    
    // 拓扑排序主循环：不断处理入度为0的节点
    while (queue.length > 0) {
      // 取出队列头部的节点（入度为0的节点）
      const current = queue.shift()!;
      const node = nodeMap.get(current);
      
      // 将当前节点加入排序结果
      if (node) {
        ordered.push(node);
      }
      
      // 处理当前节点的所有邻居节点
      const neighbors = adjacency.get(current);
      if (neighbors) {
        neighbors.forEach((neighbor) => {
          // 将邻居节点的入度减1（因为当前节点已经被处理，相当于移除了指向邻居的边）
          const degree = (inDegree.get(neighbor) ?? 0) - 1;
          inDegree.set(neighbor, degree);
          
          // 如果邻居节点的入度变为0，说明它的所有前置依赖都已处理，可以加入队列
          if (degree === 0) {
            queue.push(neighbor);
          }
        });
      }
    }
    
    // 处理特殊情况：如果仍有节点未处理，说明图中存在环或孤点
    // 环：节点之间形成循环依赖，无法通过拓扑排序处理
    // 孤点：没有与其他节点连线的节点，入度始终为0但可能未被加入队列
    // 将这些节点追加到结果末尾，确保所有节点都被包含在结果中
    if (ordered.length < nodes.length) {
      nodes.forEach((node) => {
        if (!ordered.includes(node)) {
          ordered.push(node);
        }
      });
    }
    
    return ordered;
  }

  private getLayoutBoundingBox(positions: NodePosition[]): { width: number; height: number } {
    if (positions.length === 0) {
      return { width: 0, height: 0 };
    }
    const minX = Math.min(...positions.map((item) => item.x));
    const minY = Math.min(...positions.map((item) => item.y));
    const maxX = Math.max(...positions.map((item) => item.x + item.width));
    const maxY = Math.max(...positions.map((item) => item.y + item.height));
    return {
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  private getNodeSize(node: WorkflowNodeEntity): { width: number; height: number } {
    const transform = node.getData(TransformData);
    return {
      width: transform?.size?.width ?? DEFAULT_WIDTH,
      height: transform?.size?.height ?? DEFAULT_HEIGHT,
    };
  }

  private listenContainer(): Disposable {
    return this.nodeIntoContainerService.on((e) => {
      if (
        e.type !== NodeIntoContainerType.Out ||
        e.sourceContainer?.flowNodeType !== WorkflowNodeType.Group
      ) {
        return;
      }
      if (e.sourceContainer?.blocks.length === 0) {
        e.sourceContainer.dispose();
      }
    });
  }
}

interface NodePosition {
  node: WorkflowNodeEntity;
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_WIDTH = 240;
const DEFAULT_HEIGHT = 120;
const TILE_GAP_X = 40;
const TILE_GAP_Y = 40;
const TILE_MAX_ASPECT_RATIO = 1.8;
