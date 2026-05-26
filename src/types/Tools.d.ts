import type {
  AuthTypeEnum,
  ToolDebugStatusEnum,
  ToolParamsLocationEnum,
  ToolboxTypeEnum,
  TypeToolUseCaseEunm,
  ToolParamsTypeEnum,
} from '@/constants';

// biome-ignore lint/style/noNamespace: <explanation>
declare namespace ToolNS {
  export interface AuthConfigType {
    authType: AuthTypeEnum; // 鉴权头部前缀
    appKey: string;
    secretKey: string;
  }

  export interface HeaderConfigType {
    headerKey: string;
    headerValue: string;
  }

  export interface ToolParamsType {
    name: string;
    desc?: string;
    required?: boolean;
    location?: ToolParamsLocationEnum; // 参数位置
    type: ToolParamsTypeEnum; // 参数类型
    subType?: ToolParamsTypeEnum; // 子参数类型，用于Array<String>
    deep?: number; // 参数深度 从1开始
    subParams?: ToolParamsType[];
  }

  export interface ToolBasicType {
    toolId?: string | number;
    toolboxId: string | number;
    name: string;
    desc: string;
    path: string;
    method: ToolRequestMethodEnum;
  }

  export interface TemplateParamType {
    id: string;
    name: string; // 变量中文名
    typeName: string; // 变量英文名
    required: boolean;
    type?: ToolParamsTypeEnum;
  }

  export interface TemplateItemType {
    templateId: string; // 模板ID
    templateName: string; // 模版名称
    paramList: TemplateParamType[]; // 模版参数列表
    templateOriginInfo: string; // 模板原始返回对象内容
  }

  export interface ToolType extends ToolBasicType {
    enabled?: boolean;
    requestParams: ToolParamsType[];
    responseParams: ToolParamsType[];
    agentBindCount?: number; // Agent引用数量
    createTime?: number;
    debugStatus?: ToolDebugStatusEnum;
    toolUseCase?: TypeToolUseCaseEunm;
    supportBindCard?: 0 | 1; //是否知识绑定卡片
    supportToolSetting?: 0 | 1; //是否支持工具设置
    isTemplateTool?: boolean; //是否是模版工具
    templateList?: TemplateItemType[]; //模版工具列表
    templateTips?: string; // 模版工具提示
    title?: string; // 模版工具标题
    header?: string; // 模版工具头部
    thesaurusMatchMode?: 0 | 1; // 小模型工具匹配模式：0-相似匹配（默认），1-完全匹配
  }

  export interface ToolBoxType {
    toolboxId: string | number;
    name: string;
    type: ToolboxTypeEnum;
    desc: string;
    certification: AuthConfigType;
    url: string; // 工具组Url
    headers: HeaderConfigType[];
    imageUrl?: string;
  }

  export interface ToolBoxDetailType extends ToolBoxType {
    updateStaffName: string;
    agentBindCount: number; // Agent引用数量
    updateTime: number;
    toolNames: string[];
  }

  export interface ToolDebugResType {
    code: number;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    data?: any;
    message?: string;
    response?: string;
  }

  // 相似词列表
  export interface SimilarWordsListItem {
    toolId: number;
    standardId: number;
    toolType: number;
    toolUseCase: TypeToolUseCaseEunm;
    standard: string;
    similarExpressions: string[];
    updateStaffName: string;
    createStaffName: string;
    updateTime: number;
    createTime: number;
  }
}
