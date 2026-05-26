import type { AgentTypeEnum, AppStatusEnum, ToolParamsTypeEnum, ToolStatusEnum, ToolboxTypeEnum } from '@/constants';

// biome-ignore lint/style/noNamespace: <explanation>
declare namespace AppsNS {
  export interface AppType {
    type: AgentTypeEnum;
    appId: number;
    appName: string;
    prompt?: string;
    appDesc?: string;
    updateStaffName: string;
    updateTime: number;
    avatarUrl?: string;
    bizType?: number; // 应用业务类型
    mode?: number; // Agent模式：0-自主规划模式，1-工作流模式
    certification?: {
      url: string;
      appSecret: string;
      appKey: string;
      authType: AuthTypeEnum;
    };
    isCopy?: boolean;
  }

  export interface OutputParamsProps {
    name: string;
    desc: string;
    type: ToolParamsTypeEnum;
    visible: boolean;
    subParams?: OutputParamsProps[];
  }

  export interface CardConfigType extends Record<string, unknown> {
    cardType?: string | number;
    onlySendCard?: boolean;
    templateToolVo?: ToolNS.TemplateItemType;
  }

  interface ToolType {
    toolId: number;
    name: string;
    desc?: string;
    toolboxId: number;
    toolStatus: ToolStatusEnum;
    toolboxType: ToolboxTypeEnum;
    cardConfig?: CardConfigType;
    responseParams: ToolNS.ToolParamsType[];
    status?: number; // 状态，0：草稿 1：已发布 2：已删
    supportBindCard?: 0 | 1; //是否支持绑定卡片
    supportToolSetting?: 0 | 1; //是否支持工具设置
    isTemplateTool?: boolean; //是否是模版工具
  }

  interface KnowledgeType {
    spaceId: number;
    spaceName: string;
    spaceLink: string; // 跳转到知识库详情用
    status?: ToolStatusEnum;
  }

  /** 记忆库绑定类型 */
  interface MemoryRepositoryType {
    id: number;
    name: string;
  }

  interface WorkflowType {
    workflowId: number;
    workflowName: string;
    workflowDesc?: string;
    cardConfig: CardConfigType;
    responseParams: ToolNS.ToolParamsType[];
    status?: number; // 状态，0：草稿 1：已发布 2：已删
    isNew?: number;
  }

  interface SessionSetType {
    contextRound: number;
  }

  interface ModelSetType {
    mode: AgentLLMModeEnum;
    temperature: number;
  }

  interface SkillType {
    skillId: number;
    skillName: string;
    skillDesc: string;
  }

  export interface AppAnswerTipsSetting {
    answerTips: string;
  }

  export interface AppDetailType extends AppType {
    status: AppStatusEnum;
    prompt?: string;
    reactLimit?: number; // agent最大计算轮次
    appVersion?: number; // 应用版本号
    toolList?: ToolType[];
    ysKnowledgeList?: KnowledgeType[];
    workflowList?: WorkflowType[];
    memorySetting?: MemoryRepositoryType; // 绑定的记忆库（最多1个）
    skillList?: SkillType[]; // Skill 关联列表
    sessionSetting: SessionSetType;
    modelSetting: ModelSetType;
    version: number; //  历史记录版本号
    prePrompt?: string; //  上一版本的prompt
    answerTipsSetting?: AppAnswerTipsSetting; // 应答提示语配置
  }

  export interface AppBizType {
    title: string;
    value: number;
    permissionKey: string;
  }

  export type ILibraryItem = AppsNS.ToolType | AppsNS.WorkflowType | AppsNS.KnowledgeType;
}
