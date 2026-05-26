import React from 'react';
import { SectionPanel, VarsTable } from '../shared-form-components';

const INPUT_VARS = [
  { name: 'BOT_USER_INPUT', type: 'String', desc: '用户本轮对话输入内容' },
  { name: 'HISTORY_CONTEXT', type: 'String', desc: '用户本轮对话上下文内容' },
];

const StartForm = () => (
  <SectionPanel title="输入">
    <VarsTable rows={INPUT_VARS} />
  </SectionPanel>
);

export default StartForm;
