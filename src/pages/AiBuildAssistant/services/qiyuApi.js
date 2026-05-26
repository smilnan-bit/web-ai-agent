import { APP_KEY, APP_SECRET } from './config';
import { generateChecksum } from './crypto';

async function qiyuPost(path, body) {
  const bodyStr = JSON.stringify(body);
  const { time, checksum } = await generateChecksum(APP_SECRET, bodyStr);
  const query = new URLSearchParams({ appKey: APP_KEY, time, checksum });

  const res = await fetch(`/api/qiyu/export/${path}?${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: bodyStr,
  });
  if (!res.ok) throw new Error(`Qiyu API ${path}: ${res.status}`);
  return res.json();
}

export async function exportSessions(start, end, type = 0) {
  return qiyuPost('session', { start, end, type });
}

export async function checkExportTask(key) {
  return qiyuPost('session/check', { key });
}

export async function fetchSessionDetail(sessionId) {
  return qiyuPost('session/one', { sessionId });
}

export async function fetchSessionMessages(sessionId) {
  return qiyuPost('session/one/message', { sessionId });
}
