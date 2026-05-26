import React from 'react';

export const Empty = ({ text }: { text?: string }) => {
  return <div tw="flex items-center justify-center text-[rgba(0, 0, 0, 0.25)] py-[5px]">{text}</div>;
};
