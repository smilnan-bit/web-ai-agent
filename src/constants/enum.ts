import { IconGongzuoliumoshi, IconSanfangAgent, IconZiyingAgent, IconZizhuguihuamoshi } from '@/assets/icons';

/** 工具类型 */
export enum ToolboxTypeEnum {
  all = -1,
  default = 'builtIn',
  custom = 'openapi',
  modelTool = 'modelTool',
}

export const ToolboxTypeEnumMap = {
  [ToolboxTypeEnum.all]: '全部',
  [ToolboxTypeEnum.default]: '内置',
  [ToolboxTypeEnum.custom]: '自定义',
};

/** Skill状态枚举 */
export enum SkillStatusEnum {
  uploading = 0, // 上传中
  success = 1, // 成功
  failed = 2, // 上传失败
  deleted = 3, // 处理中
}
/** 工具组鉴权类型 */
export enum AuthTypeEnum {
  no = 'none',
  qiyu = 'qiyu',
  service = 'service',
  qiyubot = 'qiyu_bot', // 一触即达
}

// API工具或者小模型工具类型枚举
export enum ToolboxTypeNumEnum {
  openapi = 0,
  modelTool = 1,
}

// 小模型工具应用场景，0意图识别、1同义词匹配
export enum TypeToolUseCaseEunm {
  intent = 0,
  similar = 1,
}

// 小模型工具匹配模式，0相似匹配、1完全匹配
export enum ThesaurusMatchModeEnum {
  similar = 0,
  exact = 1,
}

export const ThesaurusMatchModeConfig = {
  [ThesaurusMatchModeEnum.similar]: {
    label: '相似匹配',
    tooltip: '当输入的参数值相似匹配标准词相似词时，该工具便会输出对应的标准词',
  },
  [ThesaurusMatchModeEnum.exact]: {
    label: '完全匹配',
    tooltip: '当输入的参数值完全匹配标准词相似词时，该工具才会输出对应的标准词；该选项常用于匹配企业的"机型/型号"',
  },
};

export const ToolUseCaseConfig = {
  [TypeToolUseCaseEunm.intent]: {
    standardTitle: '意图',
    similarTitle: '意图问法',
    standardPlaceHolder: '请输入访客意图，比如”退换货“',
    similarPlaceHolder: '请输入代表访客意图的问法，回车填写下一条',
    standardRepeatTxt: '已有该意图，不能重复添加',
    similarRepeatTxt: '已有该意图问法，不能重复添加',
    addAIRecommendBtnTxt: '添加意图问法',
    AIRecommendTitle: '推荐意图问法',
  },
  [TypeToolUseCaseEunm.similar]: {
    standardTitle: '标准词',
    similarTitle: '相似词',
    standardPlaceHolder: '请输入标准词',
    similarPlaceHolder: '请输入相似词，回车填写下一条',
    standardRepeatTxt: '已有该标准词，不能重复添加',
    similarRepeatTxt: '已有该相似词，不能重复添加',
    addAIRecommendBtnTxt: '添加相似词',
    AIRecommendTitle: '推荐相似词',
  },
};

export const AuthTypeConfig = {
  [AuthTypeEnum.no]: { name: '无鉴权', sort: 1 },
  [AuthTypeEnum.qiyu]: { name: '七鱼鉴权体系', sort: 2 },
  [AuthTypeEnum.qiyubot]: { name: '七鱼一触即达鉴权体系', sort: 3 },
  [AuthTypeEnum.service]: { name: '云商鉴权体系', sort: 4 },
};

/** 工具请求方法 */
export enum ToolRequestMethodEnum {
  get = 1,
  post = 2,
}

/** 工具参数位置   URL 参数：query ; 请求头参数：header ; 请求路径参数：path ; cookie 中的参数：cookie . */
export enum ToolParamsLocationEnum {
  path = 1,
  query = 2,
  body = 3,
  header = 4,
}

export enum ToolParamsTypeEnum {
  string = 1,
  integer = 2,
  number = 3,
  boolean = 4,
  object = 5,
  array = 6,
}

export enum ToolParamsTypeShowEnum {
  String = 1,
  Integer = 2,
  Number = 3,
  Boolean = 4,
  Object = 5,
  Array = 6,
}

export enum AppStatusEnum {
  draft = 0, // 草稿
  released = 1, // 已发布
}

export enum StepEnum {
  basicInfo = 0,
  input = 1,
  output = 2,
  debug = 3,
  similar = 4,
  intent = 5,
}

export enum ToolDebugStatusEnum {
  fail = 0,
  success = 1,
}

// 查询工具状态用 0-未开启 1-开启
export enum ToolStatusEnum {
  noOpen = 0,
  open = 1,
  deleted = 2,
}

export enum WorkflowStatusEnum {
  noRelease = 0,
  release = 1,
}

export enum KnowledgeCallTypeEnum {
  auto = 1,
  manual = 2,
}

// 知识库调用方式
export const KnowledgeCallTypeConfig = {
  [KnowledgeCallTypeEnum.auto]: '自动调用',
  [KnowledgeCallTypeEnum.manual]: '按需调用',
};

// 知识库召回策略
export enum KnowledgeRecallTypeEnum {
  hybrid = 'hybridScoreLimit', // 召回阈值
  maxCount = 'topNLimit', // 最大数量
  maxLength = 'wordSizeLimit', // 最大长度
}

export const KnowledgeRecallTypeConfig = {
  [KnowledgeRecallTypeEnum.hybrid]: {
    order: 1,
    label: '切片召回阈值',
    tip: '控制召回切片的相似度',
    min: 0.0001,
    max: 1,
    precision: 4,
  },
  [KnowledgeRecallTypeEnum.maxCount]: {
    order: 2,
    label: '切片召回最大数量',
    tip: '控制召回切片的个数',
    min: 1,
    max: 100,
  },
  [KnowledgeRecallTypeEnum.maxLength]: {
    order: 3,
    label: '文本召回最大长度',
    tip: '控制召回切片的最大token长度',
    min: 512,
    max: 32000,
  },
};
// 导入轮询结果枚举
export enum ImportStatusEnum {
  Waiting = 1,
  Success = 2,
  FailedInfo = 3,
  Failed = 5,
}

// 当前步骤枚举
export enum CurrentEnum {
  First = 0,
  Second = 1,
  Third = 2,
}

// step状态枚举
export enum StepStatusEnum {
  Process = 'process',
  Finish = 'finish',
  Error = 'error',
}

// 进度条状态枚举
export enum ProgressStatusEnum {
  Active = 'active',
  Success = 'success',
  Exception = 'exception',
}

export enum DownloadAllTypeEnum {
  all = 1, // 全部
  notAll = 2, // 选中
  condition = 3, // 条件
}
export enum AgentTypeEnum {
  self = 0,
  thirdParty = 1,
  inspection = 2,
}

export const AgentTypeConfig = {
  [AgentTypeEnum.self]: {
    name: '自营Agent',
    icon: IconZiyingAgent,
    selectedStyle: { height: '100%', border: '1px solid #5983ff', backgroundColor: '#fff' },
    iconBgColor: '#fef5e3',
  },
  [AgentTypeEnum.thirdParty]: {
    name: '三方Agent',
    icon: IconSanfangAgent,
    selectedStyle: { height: '100%', border: '1px solid #5983ff', backgroundColor: '#fff' },
    iconBgColor: '#eef3ff',
  },
};

export const AgentRequestConfig = {
  GET: 'GET',
  POST: 'POST',
};

export const AgentAuthTypeConfig = {
  [AuthTypeEnum.qiyu]: AuthTypeConfig[AuthTypeEnum.qiyu].name,
  [AuthTypeEnum.service]: AuthTypeConfig[AuthTypeEnum.service].name,
};

// Agent模型模式
export enum AgentLLMModeEnum {
  strict = 1,
  standard = 2,
  open = 3,
  custom = 4,
}

export const AgentLLMModeConfig = {
  [AgentLLMModeEnum.standard]: '标准型',
  [AgentLLMModeEnum.strict]: '严谨型',
  [AgentLLMModeEnum.open]: '开放型',
  [AgentLLMModeEnum.custom]: '自定义',
};

export enum AgentBizTypeEnum {
  // 智能客服
  Service = 0,
  // 智能质检
  Inspection = 1,
  // 呼入机器人
  CallInRobot = 2,
  // 外呼机器人
  OutboundRobot = 3,
  // 科学策略中心
  StrategyCenter = 4,
}

// Agent模式枚举
export enum AgentModeEnum {
  // 自主规划模式
  autonomous = 0,
  // 工作流模式
  workflow = 1,
}

export const AgentModeConfig = {
  [AgentModeEnum.autonomous]: {
    name: '自主规划模式',
    description: '通过大模型自主规划和决策解决问题',
    icon: IconZizhuguihuamoshi,
    selectedStyle: { height: '100%', border: '1px solid #5983ff', backgroundColor: '#fff' },
    iconBgColor: '#fef5e3',
  },
  [AgentModeEnum.workflow]: {
    name: '工作流模式',
    description: '严格按照工作流的编排进行任务执行',
    icon: IconGongzuoliumoshi,
    selectedStyle: { height: '100%', border: '1px solid #5983ff', backgroundColor: '#fff' },
    iconBgColor: '#eef3ff',
  },
};

// Agent应用对应的权限key
export const AgentAppPermissionKeyMap = {
  [AgentBizTypeEnum.Service]: 'selfAppOutLimit,thirdPartyAppOutLimit',
  [AgentBizTypeEnum.Inspection]: 'inspectionAppOutLimit',
};

export const VARIABLE_TYPE_ALIAS_MAP: Record<ToolParamsTypeEnum, string> = {
  [ToolParamsTypeEnum.string]: 'String',
  [ToolParamsTypeEnum.integer]: 'Integer',
  [ToolParamsTypeEnum.number]: 'Number',
  [ToolParamsTypeEnum.boolean]: 'Boolean',
  [ToolParamsTypeEnum.object]: 'Object',
  [ToolParamsTypeEnum.array]: 'Array',
};

export enum SkillTypeEnum {
  all = -1,
  builtin = 0,
  custom = 1,
}
