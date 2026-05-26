import React from 'react';
import { useRecoilValue } from 'recoil';
import type { ToolboxTypeEnum } from '@/constants';
import { StepEnum } from '@/constants';
import { useQueryLocationSearch } from '@/utils';
import type { ToolNS } from '@/types/Tools';
import InputParams from './InputParams';
import OutputParams from './OutputParams';
import BasicInfo from './BasicInfo';
import Debug from './Debug';
import WordsSimilar from './WordsSimilar';
import { CurrentToolState } from './model';

// export const steps = [
//   {
//     key: StepEnum.basicInfo,
//     title: '填写基本信息',
//     content: <BasicInfo />,
//   },
//   {
//     key: StepEnum.input,
//     title: '配置输入参数',
//     content: <InputParams />,
//   },
//   {
//     key: StepEnum.output,
//     title: '配置输出参数',
//     content: <OutputParams />,
//   },
//   {
//     key: StepEnum.debug,
//     title: '调试与校验',
//     content: <Debug />,
//   },
// ];

// // 配置标准词相似词
// export const similarWordsSteps = [
//   {
//     key: StepEnum.basicInfo,
//     title: '填写基本信息',
//     content: <BasicInfo />,
//   },
//   {
//     key: StepEnum.similar,
//     title: '配置标准词相似词',
//     content: <WordsSimilar />,
//   },
// ];

// 定义步骤类型
interface Step {
  key: StepEnum;
  title: string;
  content: React.ReactNode;
}

// 通用步骤
const commonSteps: Step[] = [
  {
    key: StepEnum.basicInfo,
    title: '填写基本信息',
    content: <BasicInfo />,
  },
];

// 特定步骤
const specificSteps: Record<string, Step[]> = {
  default: [
    {
      key: StepEnum.input,
      title: '配置输入参数',
      content: <InputParams />,
    },
    {
      key: StepEnum.output,
      title: '配置输出参数',
      content: <OutputParams />,
    },
    {
      key: StepEnum.debug,
      title: '调试与校验',
      content: <Debug />,
    },
  ],
  similarWords: [
    {
      key: StepEnum.similar,
      title: '配置标准词相似词',
      content: <WordsSimilar />,
    },
    {
      key: StepEnum.debug,
      title: '调试与校验',
      content: <Debug />,
    },
  ],
  intent: [
    {
      key: StepEnum.intent,
      title: '配置意图及意图问法',
      content: <WordsSimilar />,
    },
    {
      key: StepEnum.debug,
      title: '调试与校验',
      content: <Debug />,
    },
  ],
};

// API工具步骤
export const steps = [...commonSteps, ...specificSteps.default];

// 小模型工具，标准词相似词步骤
export const similarWordsSteps = [...commonSteps, ...specificSteps.similarWords];

// 小模型工具，意图问法步骤
export const intentSteps = [...commonSteps, ...specificSteps.intent];

export const StepContentClassName = 'CreateTool-StepContent';

export const StepActionClassName = 'CreateTool-StepAction';

export const deleteId = (initData) => {
  const getDeleteIdData = (data = []) =>
    data?.map((item) => {
      if (item.subParams) {
        item.subParams = getDeleteIdData(item.subParams);
      }
      return { ...item, id: undefined };
    });
  return getDeleteIdData(initData);
};

export const useInitPageData = () => {
  const currentTool = useRecoilValue(CurrentToolState);
  let { toolUseCase, ...otherToolData } = useQueryLocationSearch();
  toolUseCase = otherToolData.toolId ? currentTool?.toolUseCase : toolUseCase;
  return { toolUseCase, ...otherToolData } as Pick<ToolNS.ToolType, 'toolId' | 'toolboxId' | 'toolUseCase'> & {
    isDebug?: string;
    toolboxType?: ToolboxTypeEnum;
  };
};

export const syncSubParamsType = (form, basePath, newType) => {
  const subParams = form.getFieldValue(basePath);
  if (!subParams?.length) return;

  subParams.forEach((item, index) => {
    const itemPath = [...basePath, index];
    form.setFieldValue([...itemPath, 'location'], newType);

    // 递归处理更深层的子项
    if (item?.subParams?.length) {
      syncSubParamsType(form, [...itemPath, 'subParams'], newType);
    }
  });
};

export function pickEnumKeys<T extends Record<string, any>>(
  enumObj: T,
  keys: string[],
): Record<string, string | number> {
  const result: Record<string, string | number> = {};

  keys.forEach((key) => {
    if (key in enumObj) {
      const value = enumObj[key];
      result[key] = value;
      result[value] = key; // 添加反向映射
    }
  });

  return result;
}
