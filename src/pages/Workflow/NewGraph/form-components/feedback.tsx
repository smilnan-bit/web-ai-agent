import type { FieldError, FieldState, FieldWarning } from '@flowgram.ai/free-layout-editor';
import React from 'react';

interface StatePanelProps {
  errors?: FieldState['errors'];
  warnings?: FieldState['warnings'];
  invalid?: boolean;
  style?: React.CSSProperties;
}

export const Feedback = ({ errors = [], warnings = [], invalid, style }: StatePanelProps) => {
  const renderFeedbacks = (fs: FieldError[] | FieldWarning[] | undefined) => {
    if (!fs) return null;
    return fs.map((f) => <span key={f.name}>{f.message}</span>);
  };
  if (errors?.length === 0 && warnings?.length === 0) return null;
  return (
    <div style={style}>
      <div tw="text-[#FF4D4F] text-[12px]">{renderFeedbacks(errors)}</div>
      <div tw="text-[#FAAD14] text-[12px]">{renderFeedbacks(warnings)}</div>
    </div>
  );
};
