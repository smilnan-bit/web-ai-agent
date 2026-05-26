// biome-ignore lint/style/noNamespace: <explanation>
declare namespace MemoryRepositoryNS {
  /** 记忆库类型 */
  export interface RepositoryType {
    /** 记忆库 ID */
    id: number;
    /** 记忆库名称 */
    name: string;
    /** 记忆库描述 */
    description?: string;
    /** 创建时间（时间戳） */
    createTime: number;
  }

  /** 用户类型 */
  export interface UserType {
    /** 用户 UID */
    userId: string;
  }

  /** 记忆类型 */
  export interface MemoryType {
    /** 记忆 ID */
    id: string;
    /** 记忆内容 */
    memory: string;
    /** 用户 ID */
    userId: string;
    /** 智能体 ID */
    agentId?: string;
    /** 会话 ID */
    sessionId?: string;
    /** 创建时间（时间戳） */
    createTime: number;
    updateTime: number;
  }

  /** Agent 关联的记忆库信息 */
  export interface RepositoryAssociationType {
    /** 记忆库 ID */
    repositoryId: number;
    /** 记忆库名称 */
    name: string;
  }
}
