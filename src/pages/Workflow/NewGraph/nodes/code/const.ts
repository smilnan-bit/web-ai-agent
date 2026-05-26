import { ToolParamsTypeEnum } from '@/constants';

export enum CodeNodeErrorEnum {
  break = 1, // 中断流程
  returnContent = 2, // 返回特定内容
  error = 3, // 执行异常流程
}

export const CodeNodeErrorConfig = {
  [CodeNodeErrorEnum.break]: '中断流程',
  [CodeNodeErrorEnum.returnContent]: '返回特定内容',
  [CodeNodeErrorEnum.error]: '执行异常流程',
};

export const defaultPythonCode = `def main(arg1: str, arg2: str) -> dict:
      return {
          "result": arg1 + arg2,
      }`;

export const defaultJSCode = `function main({arg1, arg2}) {
      return {
          result: arg1 + arg2
      }
  }`;

export const codeNodeDefaultOutputParam = [
  {
    name: 'errorBody',
    type: ToolParamsTypeEnum.object,
    subParams: [
      { name: 'errorMessage', type: ToolParamsTypeEnum.string },
      { name: 'errorCode', type: ToolParamsTypeEnum.string },
    ],
  },
  {
    name: 'isSuccess',
    type: ToolParamsTypeEnum.boolean,
  },
];
