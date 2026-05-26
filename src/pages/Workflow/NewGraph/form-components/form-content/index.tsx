import React from 'react';
import { useNodeRenderContext } from '../../hooks';
import { FormWrapper } from './styles';

/**
 * @param props
 * @constructor
 */
export function FormContent(props: { children?: React.ReactNode; style?: React.CSSProperties }) {
  const { expanded } = useNodeRenderContext();
  return <FormWrapper style={props.style}>{expanded && props.children}</FormWrapper>;
}
