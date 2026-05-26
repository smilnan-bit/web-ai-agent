import React, { useMemo } from 'react';
import { OverflowTagList, type TagProps } from './overflow-tag-list';
import type { ToolNS } from '@/types/Tools';
import { ToolParamsTypeEnum, VARIABLE_TYPE_ALIAS_MAP, VARIABLE_TYPE_ARRAY_ICON, VARIABLE_TYPE_ICON } from '@/constants';
import { IconCozWarningCircle } from '@coze-arch/coze-design/icons';
import {
  getGlobalVariableMap,
  TAG_BACKGROUND_COLOR,
  TAG_COLOR,
  TAG_SUCCESS_BACKGROUND_COLOR,
  TAG_SUCCESS_COLOR,
  TAG_WARNING_BACKGROUND_COLOR,
  TAG_WARNING_COLOR,
} from '../../constants';
// 状态
export enum VariableTagStatus {
  Success = 'success',
  Warning = 'warning',
  Default = 'default',
}

export interface VariableTagListProps {
  /* tag 列表 */
  value?: (ToolNS.ToolParamsType & { invalid?: boolean })[];
  /**
   * 每个 tag 最大宽度，默认为父容器的宽度
   */
  maxTagWidth?: number;
  isGlobal?: boolean;
}

interface VariableTagRenderProps extends TagProps {
  invalid?: boolean;
  status?: VariableTagStatus;
}

export const VariableTagList: React.FC<VariableTagListProps> = ({ value = [], maxTagWidth, isGlobal = false }) => {
  const renderTag = ({ icon, label, invalid, status }: VariableTagRenderProps) => {
    if (!status && invalid) {
      status = VariableTagStatus.Warning;
    }

    // 用style实现
    const getStatusClasses = (status: VariableTagStatus | undefined) => {
      switch (status) {
        case VariableTagStatus.Warning:
          return {
            backgroundColor: TAG_WARNING_BACKGROUND_COLOR,
            color: TAG_WARNING_COLOR,
          };
        case VariableTagStatus.Success:
          return {
            backgroundColor: TAG_SUCCESS_BACKGROUND_COLOR,
            color: TAG_SUCCESS_COLOR,
          };
        default:
          return {
            backgroundColor: TAG_BACKGROUND_COLOR,
            color: TAG_COLOR,
          };
      }
    };

    return (
      <div
        tw="flex items-center cursor-pointer max-w-full px-1 py-0.5 gap-0.5 rounded-[4px]"
        style={getStatusClasses(status)}
      >
        <span
          tw="flex flex-grow-0 flex-shrink-0 text-[14px] font-medium"
          style={{
            color:
              status === VariableTagStatus.Warning
                ? 'inherit'
                : status === VariableTagStatus.Success
                  ? 'rgba(0,153,102,0.38)'
                  : 'rgba(55,67,106,0.38)',
          }}
        >
          {icon}
        </span>
        <span
          tw="leading-4 text-[12px] overflow-hidden text-ellipsis whitespace-nowrap"
          style={{
            maxWidth: maxTagWidth,
            color:
              status === VariableTagStatus.Warning
                ? 'rgba(255,153,0,1)'
                : status === VariableTagStatus.Success
                  ? 'rgba(0,153,102,1)'
                  : 'rgba(15,21,40,0.82)',
          }}
        >
          {label}
        </span>
      </div>
    );
  };

  const formattedValue = useMemo<VariableTagRenderProps[]>(
    () =>
      value.map((v) => {
        const label = isGlobal ? getGlobalVariableMap()[v?.name]?.name || '未定义' : v?.name || '未定义';
        const invalid = !v?.name || !v?.type || v?.invalid;
        const type = v?.type;
        const subType = v.subType || ToolParamsTypeEnum.string;
        const icon = type ? (
          type === ToolParamsTypeEnum.array ? (
            VARIABLE_TYPE_ARRAY_ICON[subType]
          ) : (
            VARIABLE_TYPE_ICON[type]
          )
        ) : (
          <IconCozWarningCircle key="empty" />
        );
        return {
          key: v?.name,
          label,
          icon,
          invalid,
          tooltip: v?.type
            ? type === ToolParamsTypeEnum.array
              ? `${VARIABLE_TYPE_ALIAS_MAP[type]}<${VARIABLE_TYPE_ALIAS_MAP[subType]}>`
              : VARIABLE_TYPE_ALIAS_MAP[type]
            : undefined,
          status: invalid ? VariableTagStatus.Warning : VariableTagStatus.Default,
        };
      }),
    [value],
  );
  return <OverflowTagList<VariableTagRenderProps> value={formattedValue} enableTooltip tagItemRenderer={renderTag} />;
};
