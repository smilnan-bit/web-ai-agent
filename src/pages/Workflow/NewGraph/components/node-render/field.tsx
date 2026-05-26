import type { PropsWithChildren } from 'react';
import { FieldEmpty } from './field-empty';
import React from 'react';
import { CustomPort } from './CustomPort';

interface FieldProps {
  label: string | React.ReactNode;
  isEmpty?: boolean;
  labelClassName?: string;
  contentClassName?: string;
  customEmptyLabel?: string;
  showPort?: boolean;
  portId?: string;
}

export function Field({
  label,
  isEmpty = false,
  children,
  labelClassName,
  // contentClassName,
  customEmptyLabel,
  showPort,
  portId,
}: PropsWithChildren<FieldProps>) {
  return (
    <>
      <div
        tw="text-[14px] leading-5 font-medium text-[#ACB3BF] text-right whitespace-nowrap self-start"
        className={labelClassName}
      >
        {label}
      </div>
      <div tw="relative text-[14px] text-[#333] font-normal leading-5">
        {isEmpty ? <FieldEmpty fieldName={customEmptyLabel ?? label} /> : children}
        {showPort ? <CustomPort data-port-id={portId} data-port-type="output" /> : null}
      </div>
    </>
  );
}
