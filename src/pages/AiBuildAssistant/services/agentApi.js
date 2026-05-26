import { APP_KEY, APP_SECRET, TENANT_GUID } from './config';
import { generateChecksum } from './crypto';

async function agentGet(path, params = {}) {
  const query = new URLSearchParams({ ...params, tenantGuid: TENANT_GUID });
  const bodyStr = '';
  const { time, checksum } = await generateChecksum(APP_SECRET, bodyStr);
  query.set('appKey', APP_KEY);
  query.set('time', time);
  query.set('checksum', checksum);

  const res = await fetch(`/api/agent/agent/${path}?${query}`);
  if (!res.ok) throw new Error(`Agent API ${path}: ${res.status}`);
  return res.json();
}

async function agentPost(path, body = {}) {
  const bodyStr = JSON.stringify(body);
  const { time, checksum } = await generateChecksum(APP_SECRET, bodyStr);
  const query = new URLSearchParams({ appKey: APP_KEY, time, checksum });

  const res = await fetch(`/api/agent/agent/${path}?${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: bodyStr,
  });
  if (!res.ok) throw new Error(`Agent API ${path}: ${res.status}`);
  return res.json();
}

export async function fetchAgentList(bizType = 0) {
  const data = await agentGet('app/list', { bizType });
  return data?.data?.appList || [];
}

export async function fetchAgentDetail(appId) {
  const data = await agentGet('app/detail', { appId });
  return data?.data || null;
}

export async function fetchKnowledgeSpaces() {
  const data = await agentPost('knowledge/space/list', { tenantGuid: TENANT_GUID });
  return data?.data || [];
}

export async function saveAgent(payload) {
  const body = { tenantGuid: TENANT_GUID, ...payload };
  const data = await agentPost('app/save', body);
  if (data.code && data.code !== 200) {
    throw new Error(data.message || `创建失败 (code: ${data.code})`);
  }
  return data;
}
