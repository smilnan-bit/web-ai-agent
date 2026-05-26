import type { RequestResultType, TableParamsType, TableResultType } from '@/utils';
import type { SkillNS } from '@/types/Skills';
import { request } from '@/utils';
import type { SkillStatusEnum, SkillTypeEnum } from '@/constants';

// Skill列表查询
export const getSkillList: (
  params: TableParamsType & { skillType?: SkillTypeEnum; skillStatus?: SkillStatusEnum },
) => TableResultType<SkillNS.SkillDetailType> = (params) => {
  return request('/agent/api/skill/list', { params });
};

// 上传Skill
export const uploadSkill: (data: {
  nosKey: string;
}) => RequestResultType = (data) => {
  return request('/agent/api/skill/upload', {
    method: 'post',
    data: data,
  });
};

// 删除Skill
export const deleteSkill: (data: { skillId: string }) => RequestResultType = (data) => {
  return request('/agent/api/skill/delete', { method: 'post', data });
};
