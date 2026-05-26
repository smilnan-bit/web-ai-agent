// biome-ignore lint/style/noNamespace: <explanation>
declare namespace basicNS {
  export interface GlobalConfigType {
    appNameLimit: number;
    appDescLimit: number;
    promptLimit: number;
    appLimit: number;
    appToolLimit: number;
    toolboxLimit: number;
    toolboxDescLimit: number;
    toolboxNameLimit: number;
    toolboxAppKeyLimit: number;
    toolboxSecretKeyLimit: number;
    toolboxHeaderLimit: number;
    toolboxHeaderKeyLimit: number;
    toolboxHeaderValueLimit: number;
    toolboxUrlLimit: number;
    toolNameLimit: number;
    toolDescLimit: number;
    toolLimit: number;
    toolParamDescLimit: number;
    toolParamNameLimit: number;
    toolRequestParamLimit: number;
    toolResponseParamLimit: number;
    toolPathLimit: number;
    workflowLimit: number;
    thesaurusExpressionGroupMaxCount: number;
    thesaurusExpressionLimit: number;
    thirdPartyEnable: number; // 是否可创建第三方应用 0-否 1-是
    thirdPartyAppLimit: number; // 第三方应用数量限制
    evaluationTaskUploadRowsLimit: number;
    paramLimit: number;
    subParamLimit: number;
    inspectionAppEnable: number; // 是否可创建质检应用 0-否 1-是
    inspectionAppLimit: number; // 质检应用数量限制
    templateTenant: boolean; //是否是模板企业
    showTemplateGallery: boolean; //是否显示Agent模板广场页
    templateCategoryList: Record<string, string>[]; // 模板分类列表
    viewAllAgentsPermission: 0 | 1; // 是否可查看所有应用 0-否 1-是
    batchNodeMaxCount: number; // 批处理节点数量限制
    agentMemoryPermission: boolean;
    agentSkillEnabled: boolean; // 是否启用Agent技能
    builtinSkillTenant: boolean; // 是否是内置技能企业
    subWorkflowNodeMaxCount: number; // 子流程节点数量限制
  }
}
