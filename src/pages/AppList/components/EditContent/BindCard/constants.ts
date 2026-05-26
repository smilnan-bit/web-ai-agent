import { ToolParamsTypeEnum } from '@/constants';

export const modulePrefix = 'BindCard';

export enum CardModeEnum {
  bind = 'bind',
  dialogue = 'dialogue',
  reply = 'reply', //工作流回复节点绑定
}

export enum CardTypeEnum {
  notUse = 'none',
  product = 'product',
  order = 'order',
  flow = 'flow',
  button = 'button',
  image = 'image',
  /**
   * a2ui（CotUi）卡片。
   * 所有 CotUi 卡片共享这一个 cardType，具体卡片通过 cardConfig.cotUi.specId 区分。
   * UI 层不把它作为 CardTypeConfig 的一项，而是在 SelectType 中单独列出 a2ui 卡片列表。
   */
  cotUi = 'cotUi',
}

export enum CardStyleEnum {
  single = 0, // 单行
  vertical = 1, // 竖向列表
  horizontal = 2, // 横向列表
}

export enum CardActionTypeEnum {
  url = 0, // 跳转url
  other = 1, // 其他
}

export enum VerticalCardStyleEnum {
  tile = 0, // 平铺
  replace = 1, // 替换
}

export enum CardOutputModeEnum {
  msgBubble = 1, // 消息气泡
  bottomPopup = 2, // 底部弹窗
}

export const ProductActionConfig = {
  [CardActionTypeEnum.url]: '点击卡片进行跳转',
  [CardActionTypeEnum.other]: '点击卡片进行选择',
};

// 操作按钮交互类型
export const ButtonActionConfig = {
  [CardActionTypeEnum.url]: '点击按钮进行跳转',
  [CardActionTypeEnum.other]: '点击按钮进行确认',
};

export const ProductCardStyleConfig = {
  [CardStyleEnum.single]: '单张卡片',
  [CardStyleEnum.vertical]: '竖向列表',
  [CardStyleEnum.horizontal]: '横向列表',
};

export const OrderCardStyleConfig = {
  [CardStyleEnum.single]: '单张卡片',
  [CardStyleEnum.vertical]: '竖向列表',
};

export const VerticalStyleConfig = {
  [VerticalCardStyleEnum.tile]: '平铺',
  [VerticalCardStyleEnum.replace]: '换一换',
};

export const CardOutputModeConfig = {
  [CardOutputModeEnum.msgBubble]: '消息气泡',
  [CardOutputModeEnum.bottomPopup]: '底部弹窗',
};

export interface FieldItemType {
  name: string;
  required?: boolean; // 字段是否必须，默认为false
  isSelectFromArray?: boolean; // 是否从数组中选择，若是则为输入框，否为参数选择框
  placeholder?: string; // 默认文案
  noDialogueOutput?: boolean; // 是否在工作流对话节点下不输出
}

type CardActionRadioType = {
  show: (data: { hasActionValue?: number; cardStyleValue?: CardStyleEnum }) => boolean;
  config: Partial<Record<CardActionTypeEnum, string>>;
  name: string;
  initialValue: CardActionTypeEnum | CardOutputModeEnum;
};

type CardActionSwitchType = {
  label: string;
  labelTip?: string;
  name: string;
  checkedValue: any; // 开关打开传给服务端的值
  unCheckedValue: any; // 开关关闭传给服务端的值
  initialValue: any;
  hide?: boolean;
};
export interface CardFormConfigType {
  key?: string; // 标记下唯一
  title?: string; // 标题
  styleConfig?: Partial<Record<CardStyleEnum, string>>; // 卡片样式类型
  limitConfig?: {
    initialValue: number;
    name: string;
    label: string;
    dependenceStyleValues?: any[]; // 显示依赖于哪些styleValue
  }; // 卡片数量上限
  numInRow?: boolean; // 是否展示一行显示几个按钮
  bindArray?: {
    isSelectFromArray?: boolean; // 是否从数组中选择，若是则为输入框，否为参数选择框
    dependenceStyleValues?: any[]; // 显示依赖于哪些styleValue
    label?: string; // 对应formitem label
    name?: string; // 对应formitem name
  }; // 是否有为卡片绑定一个数组
  bindFields: {
    startIndex?: number; // 绑定数据的起始下标
    fields: Array<FieldItemType | Array<FieldItemType>>; // 绑定数据的formitem name
    fieldsTipSrc?: string;
    otherFields?: Array<FieldItemType>; // 绑定数据的formitem name
    customFields?: { name: string; validateRepeatField: Array<FieldItemType | Array<FieldItemType>> }; // 自定义变量
  };
  actionSwitch?: CardActionSwitchType; // 动作交互开关配置
  onlyOutputActionSwitch?:
    | false
    | {
        label: string;
        labelTip?: string;
        name: string;
        checkedValue: any; // 开关打开传给服务端的值
        unCheckedValue: any; // 开关关闭传给服务端的值
        initialValue: any;
      }; // 仅输出卡片开关配置
  outputModeRadio?: CardActionRadioType & { label?: string; labelTipSrc?: string }; // 卡片展示方式配置
  actionRadio?: CardActionRadioType; // 动作交互开Radio配置
  urlInput?: {
    show: (data: { hasActionValue?: number; actionValue?: any }) => boolean;
    isSelectFromArray?: boolean;
  }; // 跳转链接输入框
  btnTextInput?: {
    show: (data: { hasActionValue?: number; actionValue?: any }) => boolean;
    name?: string;
    isSelectFromArray?: boolean;
  }; // 按钮文案输入框
  btnActionInput?: {
    show: (data: { hasActionValue?: number; actionValue?: any }) => boolean;
    name?: string;
    isSelectFromArray?: boolean;
  }; // 点击按钮发送文案输入框
  verticalCardConfig?: {
    dependenceStyleValues?: any[]; // 显示依赖于哪些styleValue
    option: Partial<Record<VerticalCardStyleEnum, string>>; // 展现样式配置
    name: string; // 对应formitem name
    label: string; // 对应formitem label
    initialValue: VerticalCardStyleEnum; // 初始值
    limitName?: string; // 每批展示几个的formitem name 默认为cardLimit
  };
}
export interface CardConfigType {
  optionPic: string; // 选择图片
  formConfig: Array<CardFormConfigType>; // 表单配置
  previewPic: (data: {
    cardStyleValue: CardStyleEnum;
    hasActionValue?: number;
    actionValue?: any;
    verticalCardStyle?: VerticalCardStyleEnum;
  }) => string; // 预览图片配置
}

export const productCardConfig = {
  ui: [
    { name: 'picture', required: true, type: ToolParamsTypeEnum.string },
    { name: 'title', required: true, type: ToolParamsTypeEnum.string },
    { name: 'desc', required: true, type: ToolParamsTypeEnum.string },
    { name: 'price', required: true, type: ToolParamsTypeEnum.string },
  ],
  other: [
    { name: 'goodsId', type: ToolParamsTypeEnum.string },
    { name: 'productUrl', type: ToolParamsTypeEnum.string },
    { name: 'note', type: ToolParamsTypeEnum.string },
    { name: 'goodsCId', type: ToolParamsTypeEnum.string },
    { name: 'goodsCName', type: ToolParamsTypeEnum.string },
  ],
};

export const orderCardConfig = {
  ui: [
    [
      {
        name: 'orderIdFieldName',
        type: ToolParamsTypeEnum.string,
        placeholder: '请为orderId设置字段名称：输入数组中的参数名称',
        noDialogueOutput: true, //是否在工作流节点下不输出
      },
      { name: 'orderId', required: true, type: ToolParamsTypeEnum.string },
    ],
    [
      {
        name: 'orderTimeFieldName',
        type: ToolParamsTypeEnum.string,
        noDialogueOutput: true, //是否在工作流节点下不输出
        placeholder: '请为orderTime设置字段名称：输入数组中的参数名称',
      },
      { name: 'orderTime', required: true, type: ToolParamsTypeEnum.string },
    ],
  ],
  product: [
    { name: 'picture', required: true, type: ToolParamsTypeEnum.string },
    { name: 'title', required: true, type: ToolParamsTypeEnum.string },
    { name: 'desc', required: true, type: ToolParamsTypeEnum.string },
    { name: 'sku', type: ToolParamsTypeEnum.string },
    { name: 'payMoney', type: ToolParamsTypeEnum.string },
    { name: 'count', type: ToolParamsTypeEnum.string },
    { name: 'status', required: true, type: ToolParamsTypeEnum.string },
  ],
  other: [
    { name: 'goodsId', type: ToolParamsTypeEnum.string },
    { name: 'orderUrl', type: ToolParamsTypeEnum.string },
    { name: 'goodsCId', type: ToolParamsTypeEnum.string },
  ],
};

export const CardTypeConfig: Partial<Record<CardTypeEnum, CardConfigType>> = {
  [CardTypeEnum.product]: {
    optionPic: 'https://res.qiyukf.net/storage/91bd8a3f-9473-42e7-aecb-e83943365083.png',
    formConfig: [
      {
        key: 'basic',
        styleConfig: ProductCardStyleConfig,
        limitConfig: {
          initialValue: 5,
          name: 'cardLimit',
          label: '卡片列表最大长度',
          dependenceStyleValues: [CardStyleEnum.horizontal, CardStyleEnum.vertical],
        },
        verticalCardConfig: {
          dependenceStyleValues: [CardStyleEnum.vertical],
          option: VerticalStyleConfig,
          name: 'showStyle',
          label: '选择展现样式',
          initialValue: VerticalCardStyleEnum.tile,
        },
        bindArray: {
          dependenceStyleValues: [CardStyleEnum.horizontal, CardStyleEnum.vertical],
        },
        bindFields: {
          fields: productCardConfig.ui,
        },
        actionSwitch: {
          label: '点击卡片交互',
          labelTip: '开启后，支持点击卡片跳转至其他页面，或进行卡片的选择确认',
          name: 'hasAction',
          checkedValue: 1,
          unCheckedValue: 0,
          initialValue: 0,
        },
        actionRadio: {
          show: ({ hasActionValue }) => !!hasActionValue,
          config: ProductActionConfig,
          name: 'action',
          initialValue: CardActionTypeEnum.url,
        },
        // 仅输出卡片的Switch配置
        onlyOutputActionSwitch: {
          label: ' 仅输出卡片',
          labelTip: '开启后，仅展现工具绑定的卡片内容，将不请求大模型进行下一步思考和润色答复',
          name: 'onlySendCard',
          checkedValue: true,
          unCheckedValue: false,
          initialValue: false,
        },
        urlInput: {
          show: ({ hasActionValue, actionValue }) => !!hasActionValue && actionValue === CardActionTypeEnum.url,
        },
      },
    ],
    previewPic: ({ cardStyleValue, verticalCardStyle }) => {
      const stylePicConfig = {
        [CardStyleEnum.single]: 'https://res.qiyukf.net/storage/0271b178-b4af-4c0e-a4f2-46ddb9a6c520.png',
        [CardStyleEnum.horizontal]: 'https://res.qiyukf.net/storage/702c9c4a-9cf9-45d7-bb91-967c73b17b89.png',
        [CardStyleEnum.vertical]:
          verticalCardStyle === VerticalCardStyleEnum.replace
            ? 'https://res.qiyukf.net/storage/bb2bda06-1312-4ebe-8375-24262bc31a6d.png'
            : 'https://res.qiyukf.net/storage/9836e9d4-edb8-4587-862f-bcb710ae97e6.png',
      };
      return stylePicConfig[cardStyleValue];
    },
  },
  [CardTypeEnum.order]: {
    optionPic: 'https://res.qiyukf.net/storage/7678f52c-043a-408d-a81b-4512d5b2c75a.png',
    formConfig: [
      {
        title: '订单信息设置',
        limitConfig: {
          initialValue: 5,
          name: 'cardLimit',
          label: '卡片列表最大长度',
        },
        bindArray: {},
        bindFields: {
          fieldsTipSrc: 'https://res.qiyukf.net/storage/8ba9e193-0712-4241-b6e8-f930aea351b7.png',
          fields: orderCardConfig.ui,
        },
      },
      {
        title: '订单商品信息设置',
        key: 'basic',
        verticalCardConfig: {
          option: VerticalStyleConfig,
          name: 'showStyle',
          label: '选择展现样式',
          initialValue: VerticalCardStyleEnum.tile,
          limitName: 'productLimit',
        },
        limitConfig: {
          initialValue: 5,
          name: 'productLimit',
          label: '卡片列表最大长度',
        },
        bindArray: { name: 'productArrayName', isSelectFromArray: true },
        bindFields: {
          startIndex: 3,
          fields: orderCardConfig.product,
        },
        actionSwitch: {
          label: '点击卡片交互',
          labelTip: '开启后，支持点击卡片跳转至其他页面，或进行卡片的选择确认',
          name: 'hasAction',
          checkedValue: 1,
          unCheckedValue: 0,
          initialValue: 0,
        },
        // 仅输出卡片的Switch配置
        onlyOutputActionSwitch: {
          label: ' 仅输出卡片',
          labelTip: '开启后，仅展现工具绑定的卡片内容，将不请求大模型进行下一步思考和润色答复',
          name: 'onlySendCard',
          checkedValue: true,
          unCheckedValue: false,
          initialValue: false,
        },
        actionRadio: {
          show: ({ hasActionValue }) => !!hasActionValue,
          config: ProductActionConfig,
          name: 'action',
          initialValue: CardActionTypeEnum.url,
        },
        urlInput: {
          show: ({ hasActionValue, actionValue }) => !!hasActionValue && actionValue === CardActionTypeEnum.url,
        },
      },
    ],
    previewPic: () => {
      return 'https://res.qiyukf.net/storage/f271f9a0-5b25-46b6-9e9f-9f9a2a07e396.png';
    },
  },
  [CardTypeEnum.flow]: {
    optionPic: 'https://res.qiyukf.net/storage/ea9e6fd2-42a4-41a3-bf3a-e5e42b8ad59f.png',
    formConfig: [
      {
        key: 'basic',
        limitConfig: { initialValue: 5, name: 'cardLimit', label: '节点最大数据' },
        bindArray: {},
        bindFields: {
          fields: [{ name: 'title', required: true }, { name: 'subtitle' }, { name: 'current' }],
        },
        actionSwitch: {
          label: '点击按钮进行跳转',
          labelTip: '开启后，支持点击卡片底部的操作按钮跳转至其他页面',
          name: 'action',
          checkedValue: CardActionTypeEnum.url,
          unCheckedValue: CardActionTypeEnum.other,
          initialValue: CardActionTypeEnum.other,
        },
        // 仅输出卡片的Switch配置
        onlyOutputActionSwitch: {
          label: ' 仅输出卡片',
          labelTip: '开启后，仅展现工具绑定的卡片内容，将不请求大模型进行下一步思考和润色答复',
          name: 'onlySendCard',
          checkedValue: true,
          unCheckedValue: false,
          initialValue: false,
        },
        urlInput: { show: ({ actionValue }) => actionValue === CardActionTypeEnum.url, isSelectFromArray: false },
        btnTextInput: {
          show: ({ actionValue }) => actionValue === CardActionTypeEnum.url,
          isSelectFromArray: false,
          name: 'content',
        },
      },
    ],
    previewPic: ({ actionValue }) => {
      const actionPicConfig = {
        [CardActionTypeEnum.url]: 'https://res.qiyukf.net/storage/68f34331-b8d4-4f8c-a4b4-5ca3ae6e6d7f.png',
        [CardActionTypeEnum.other]: 'https://res.qiyukf.net/storage/4edbdc0e-1158-494d-a325-e6bd582f44d2.png',
      };
      return actionPicConfig[actionValue];
    },
  },
  [CardTypeEnum.button]: {
    optionPic: 'https://res.qiyukf.net/storage/c97aae23-894a-49be-ab25-c5707f546720.png',
    formConfig: [
      {
        key: 'basic',
        numInRow: true,
        limitConfig: { initialValue: 5, name: 'cardLimit', label: '按钮最大数量' },
        bindFields: {
          fields: [
            { name: 'tip', required: true },
            { name: 'arrayName', required: true },
          ],
        },
        // 仅输出卡片的Switch配置
        onlyOutputActionSwitch: {
          label: ' 仅输出卡片',
          labelTip: '开启后，仅展现工具绑定的卡片内容，将不请求大模型进行下一步思考和润色答复',
          name: 'onlySendCard',
          checkedValue: true,
          unCheckedValue: false,
          initialValue: false,
        },
        actionRadio: {
          show: () => true,
          config: ButtonActionConfig,
          name: 'action',
          initialValue: CardActionTypeEnum.url,
        },
        btnTextInput: { show: () => true, isSelectFromArray: true }, // 按钮文案
        urlInput: { show: ({ actionValue }) => actionValue === CardActionTypeEnum.url, isSelectFromArray: true },
        btnActionInput: {
          show: ({ actionValue }) => actionValue === CardActionTypeEnum.other,
          isSelectFromArray: true,
        }, // 点击按钮发送文案
      },
    ],
    previewPic: () => {
      return 'https://res.qiyukf.net/storage/e7ffe8f0-a05d-4d39-a461-ccaf7d47f683.png';
    },
  },
  [CardTypeEnum.image]: {
    optionPic: 'https://res.qiyukf.net/storage/756938c5-8060-4e3c-b42b-6a3a55d810d1.png',
    formConfig: [
      {
        key: 'basic',
        bindFields: {
          fields: [{ name: 'mainImg', required: true }, { name: 'leftImg' }, { name: 'title' }, { name: 'content' }],
        },
        actionSwitch: {
          label: '点击按钮进行跳转',
          labelTip: '开启后，支持点击卡片底部的操作按钮跳转至其他页面',
          name: 'action',
          checkedValue: CardActionTypeEnum.url,
          unCheckedValue: CardActionTypeEnum.other,
          initialValue: CardActionTypeEnum.other,
        },
        // 仅输出卡片的Switch配置
        onlyOutputActionSwitch: {
          label: ' 仅输出卡片',
          labelTip: '开启后，仅展现工具绑定的卡片内容，将不请求大模型进行下一步思考和润色答复',
          name: 'onlySendCard',
          checkedValue: true,
          unCheckedValue: false,
          initialValue: false,
        },
        urlInput: { show: ({ actionValue }) => actionValue === CardActionTypeEnum.url },
        btnTextInput: { show: ({ actionValue }) => actionValue === CardActionTypeEnum.url, name: 'buttonContent' },
      },
    ],
    previewPic: ({ actionValue }) => {
      const actionPicConfig = {
        [CardActionTypeEnum.url]: 'https://res.qiyukf.net/storage/b37cc637-83fa-4e39-b516-15643ba357b4.png',
        [CardActionTypeEnum.other]: 'https://res.qiyukf.net/storage/93a84694-cb77-4a35-8f0e-c3d570267d2d.png',
      };
      return actionPicConfig[actionValue];
    },
  },
};

// 只要cardType 的product order
export const DialogueCardTypeConfig: Partial<Record<CardTypeEnum, CardConfigType>> = {
  [CardTypeEnum.product]: {
    ...(CardTypeConfig[CardTypeEnum.product] as CardConfigType),
    formConfig: (CardTypeConfig[CardTypeEnum.product]?.formConfig || []).map((item) => {
      if (item.key === 'basic') {
        return {
          ...item,
          bindFields: {
            ...item.bindFields,
            otherFields: productCardConfig.other,
            customFields: {
              name: 'customParams',
              validateRepeatField: [...orderCardConfig.ui, ...orderCardConfig.product, ...orderCardConfig.other],
            },
          },
          outputModeRadio: {
            show: ({ cardStyleValue }) =>
              cardStyleValue !== undefined && [CardStyleEnum.vertical, CardStyleEnum.single].includes(cardStyleValue),
            config: CardOutputModeConfig,
            label: '卡片展示方式',
            labelTipSrc: 'https://res.qiyukf.net/storage/180a1da3-2db5-4b1a-8e3a-b1bf5837272a.png',
            name: 'cardDisplayMode',
            initialValue: CardOutputModeEnum.msgBubble,
          },
          actionSwitch: {
            hide: true,
            label: '点击卡片交互',
            labelTip: '支持点击卡片进行选择确认，仅支持单选',
            name: 'hasAction',
            checkedValue: 1,
            unCheckedValue: 0,
            initialValue: 1,
          },
          actionRadio: {
            show: ({ hasActionValue }) => !!hasActionValue,
            config: {
              [CardActionTypeEnum.other]: '点击卡片进行选择',
            },
            name: 'action',
            initialValue: CardActionTypeEnum.other,
          },
          onlyOutputActionSwitch: false,
        };
      }
      return item;
    }),
  },
  [CardTypeEnum.order]: {
    ...(CardTypeConfig[CardTypeEnum.order] as CardConfigType),
    formConfig: (CardTypeConfig[CardTypeEnum.order]?.formConfig || []).map((item) => {
      if (item.key === 'basic') {
        return {
          ...item,
          bindFields: {
            ...item.bindFields,
            otherFields: orderCardConfig.other,
            customFields: {
              name: 'customParams',
              validateRepeatField: [...orderCardConfig.ui, ...orderCardConfig.product, ...orderCardConfig.other],
            },
          },
          outputModeRadio: {
            show: () => true,
            label: '卡片展示方式',
            labelTipSrc: 'https://res.qiyukf.net/storage/180a1da3-2db5-4b1a-8e3a-b1bf5837272a.png',
            config: CardOutputModeConfig,
            name: 'cardDisplayMode',
            initialValue: CardOutputModeEnum.msgBubble,
          },
          actionSwitch: {
            label: '点击卡片交互',
            labelTip: '支持点击卡片进行选择确认，仅支持单选',
            name: 'hasAction',
            checkedValue: 1,
            unCheckedValue: 0,
            initialValue: 1,
          },
          actionRadio: {
            show: ({ hasActionValue }) => !!hasActionValue,
            config: {
              [CardActionTypeEnum.other]: '点击卡片进行选择',
            },
            name: 'action',
            initialValue: CardActionTypeEnum.other,
          },
          onlyOutputActionSwitch: false,
        };
      }
      return item;
    }),
  },
};

const ReplyCardActionConfig = {
  [CardActionTypeEnum.url]: '点击卡片进行跳转',
};

export const ReplyCardTypeConfig: Partial<Record<CardTypeEnum, CardConfigType>> = {
  [CardTypeEnum.product]: {
    ...(CardTypeConfig[CardTypeEnum.product] as CardConfigType),
    formConfig: (CardTypeConfig[CardTypeEnum.product]?.formConfig || []).map((item) => {
      if (item.key === 'basic') {
        return {
          ...item,
          onlyOutputActionSwitch: false,
          actionRadio: {
            ...(item.actionRadio as CardActionRadioType),
            config: ReplyCardActionConfig,
          },
          actionSwitch: {
            ...(item.actionSwitch as CardActionSwitchType),
            labelTip: '开启后，支持点击卡片跳转至其他页面。',
          },
        };
      }
      return item;
    }),
  },
  [CardTypeEnum.order]: {
    ...(CardTypeConfig[CardTypeEnum.order] as CardConfigType),
    formConfig: (CardTypeConfig[CardTypeEnum.order]?.formConfig || []).map((item) => {
      if (item.key === 'basic') {
        return {
          ...item,
          onlyOutputActionSwitch: false,
          actionRadio: {
            ...(item.actionRadio as CardActionRadioType),
            config: ReplyCardActionConfig,
          },
          actionSwitch: {
            ...(item.actionSwitch as CardActionSwitchType),
            labelTip: '开启后，支持点击卡片跳转至其他页面。',
          },
        };
      }
      return item;
    }),
  },
  [CardTypeEnum.flow]: {
    ...(CardTypeConfig[CardTypeEnum.flow] as CardConfigType),
    formConfig: (CardTypeConfig[CardTypeEnum.flow]?.formConfig || []).map((item) => {
      if (item.key === 'basic') {
        return {
          ...item,
          onlyOutputActionSwitch: false,
        };
      }
      return item;
    }),
  },
  [CardTypeEnum.button]: {
    ...(CardTypeConfig[CardTypeEnum.button] as CardConfigType),
    formConfig: (CardTypeConfig[CardTypeEnum.button]?.formConfig || []).map((item) => {
      if (item.key === 'basic') {
        return {
          ...item,
          onlyOutputActionSwitch: false,
          actionRadio: {
            ...(item.actionRadio as CardActionRadioType),
            config: {
              [CardActionTypeEnum.url]: '点击按钮进行跳转',
            },
          },
        };
      }
      return item;
    }),
  },
  [CardTypeEnum.image]: {
    ...(CardTypeConfig[CardTypeEnum.image] as CardConfigType),
    formConfig: (CardTypeConfig[CardTypeEnum.image]?.formConfig || []).map((item) => {
      if (item.key === 'basic') {
        return {
          ...item,
          onlyOutputActionSwitch: false,
        };
      }
      return item;
    }),
  },
};
