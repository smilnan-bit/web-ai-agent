import type { SkillStatusEnum, SkillTypeEnum } from '@/constants';

// biome-ignore lint/style/noNamespace: <explanation>
declare namespace SkillNS {
  // Skill详情信息
  export interface SkillDetailType {
    skillId: number;
    skillName: string;
    skillDesc: string;
    skillType: SkillTypeEnum;
    status: SkillStatusEnum;
    agentBindCount: number; // Agent引用数量
    updateTime: number;
    createTime: number;
    errorMsg?: string; //上传失败原因
  }

  // Skill上传任务状态
  export interface UploadTaskStatusType {
    taskToken: string;
    status: SkillStatusEnum;
    progress?: number;
    errorMessage?: string;
    skillId?: string;
  }

  // Skill关联信息
  export interface SkillAssociationType {
    agentId: string;
    skillId: string;
    associateTime: number;
  }

  // Skill搜索参数
  export interface SkillSearchParams {
    keyword?: string;
    category?: string;
    type?: SkillTypeEnum;
    status?: SkillStatusEnum;
    page?: number;
    pageSize?: number;
  }
}
