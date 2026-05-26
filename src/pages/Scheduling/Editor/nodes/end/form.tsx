import React from 'react';
import { SectionPanel } from '../shared-form-components';

const EndForm = () => (
  <SectionPanel title="结束方式">
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'default' }}>
      <input type="radio" checked readOnly style={{ marginTop: 3, accentColor: '#337EFF' }} />
      <div>
        <div style={{ fontSize: 13, color: '#262626', fontWeight: 500 }}>直接结束</div>
        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>结束并返回结束标识</div>
      </div>
    </label>
  </SectionPanel>
);

export default EndForm;
