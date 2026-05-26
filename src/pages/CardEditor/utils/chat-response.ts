// src/pages/CardEditor/utils/chat-response.ts

import type { NodeAction, PreviewNode, PreviewSpec, StyleToken } from '../types';
import { normalizeSpec } from './normalize-spec';

type ParsedModelPayload = {
  reply?: unknown;
  nextSpec?: unknown;
  log?: unknown;
};

export type ChatGenerationOutput = {
  reply: string;
  nextSpec: PreviewSpec;
  log: string;
};

function isNodeAction(value: unknown): value is NodeAction {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  const validType = candidate.type === 'navigate' || candidate.type === 'submit';

  if (!validType || typeof candidate.name !== 'string') return false;

  if ('payload' in candidate && candidate.payload != null) {
    if (typeof candidate.payload !== 'object' || Array.isArray(candidate.payload)) return false;
    return Object.values(candidate.payload as Record<string, unknown>).every((item) => typeof item === 'string');
  }

  return true;
}

function isStyleToken(value: unknown) {
  if (value == null) return true;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value as Record<string, unknown>).every((item) => item == null || typeof item === 'string');
}

function isPreviewNode(value: unknown): value is PreviewNode {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.type !== 'string' || !isStyleToken(candidate.style)) return false;

  switch (candidate.type) {
    case 'text':
      return 'text' in candidate;
    case 'input':
      return typeof candidate.name === 'string';
    case 'button':
      return (
        'label' in candidate && (!('action' in candidate) || candidate.action == null || isNodeAction(candidate.action))
      );
    case 'divider':
      return true;
    case 'badge':
      return 'label' in candidate;
    case 'image':
      return 'src' in candidate;
    case 'select':
      return typeof candidate.name === 'string' && Array.isArray(candidate.options);
    case 'buttonGroup':
      return typeof candidate.name === 'string' && Array.isArray(candidate.options);
    case 'page':
    case 'card':
    case 'column':
    case 'row':
      return Array.isArray(candidate.children) && candidate.children.every((child: unknown) => isPreviewNode(child));
    default:
      return false;
  }
}

function isPreviewSpec(value: unknown): value is PreviewSpec {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as PreviewSpec;
  return (
    typeof candidate.version === 'string' &&
    typeof candidate.theme?.primary === 'string' &&
    typeof candidate.theme?.bg === 'string' &&
    typeof candidate.theme?.text === 'string' &&
    typeof candidate.theme?.textMinor === 'string' &&
    isStyleToken(candidate.root?.style) &&
    isPreviewNode(candidate.root)
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function sanitizeString(value: unknown, fallback = '') {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

/** 处理 ResolvableText 类型：string | BindingValue，保留 binding 对象 */
function sanitizeResolvableText(value: unknown, fallback = ''): string | { binding: string; fallback?: string } {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  // 如果是 binding 对象，保留原样
  if (
    value &&
    typeof value === 'object' &&
    'binding' in value &&
    typeof (value as Record<string, unknown>).binding === 'string'
  ) {
    const obj = value as Record<string, unknown>;
    return {
      binding: obj.binding as string,
      ...(typeof obj.fallback === 'string' ? { fallback: obj.fallback } : {}),
    };
  }
  return fallback;
}

function sanitizeStyleToken(value: unknown): StyleToken | undefined {
  const candidate = asRecord(value);
  if (!candidate) return undefined;
  const entries = Object.entries(candidate).flatMap(([key, item]) =>
    typeof item === 'string' ? ([[key, item]] as [string, string][]) : [],
  );
  return entries.length ? (Object.fromEntries(entries) as StyleToken) : undefined;
}

function sanitizeNodeAction(value: unknown): NodeAction | undefined {
  if (isNodeAction(value)) return value;
  return undefined;
}

function toPlaceholderTextNode(value: unknown, fallbackLabel = 'Unsupported node'): PreviewNode {
  const candidate = asRecord(value);
  const typeLabel = sanitizeString(candidate?.type, 'unknown');
  const label =
    sanitizeString(candidate?.label) ||
    sanitizeString(candidate?.name) ||
    sanitizeString(candidate?.title) ||
    sanitizeString(candidate?.text);

  return {
    type: 'text',
    text: `[${typeLabel}] ${label || fallbackLabel}`,
    as: 'p',
    style: { color: '#62708a', fontSize: '14px' },
  };
}

function sanitizePreviewNode(value: unknown): PreviewNode {
  const candidate = asRecord(value);
  if (!candidate || typeof candidate.type !== 'string') {
    return toPlaceholderTextNode(value, 'Invalid node');
  }

  const style = sanitizeStyleToken(candidate.style);

  switch (candidate.type) {
    case 'text':
      return {
        type: 'text',
        id: sanitizeString(candidate.id) || undefined,
        text: 'text' in candidate ? sanitizeResolvableText(candidate.text, '') : '',
        as:
          candidate.as === 'span' ||
          candidate.as === 'p' ||
          candidate.as === 'h1' ||
          candidate.as === 'h2' ||
          candidate.as === 'h3'
            ? candidate.as
            : undefined,
        style,
      };
    case 'input':
      return {
        type: 'input',
        id: sanitizeString(candidate.id) || undefined,
        name: sanitizeString(candidate.name, 'field'),
        label: sanitizeResolvableText(candidate.label) || undefined,
        placeholder: sanitizeResolvableText(candidate.placeholder) || undefined,
        value: sanitizeResolvableText(candidate.value) || undefined,
        inputType:
          candidate.inputType === 'password' || candidate.inputType === 'email' || candidate.inputType === 'text'
            ? candidate.inputType
            : undefined,
        style,
      };
    case 'button':
      return {
        type: 'button',
        id: sanitizeString(candidate.id) || undefined,
        label: sanitizeResolvableText(candidate.label, 'Button'),
        variant: candidate.variant === 'secondary' ? 'secondary' : 'primary',
        action: sanitizeNodeAction(candidate.action),
        style,
      };
    case 'divider':
      return { type: 'divider', id: sanitizeString(candidate.id) || undefined, style };
    case 'badge':
      return {
        type: 'badge',
        id: sanitizeString(candidate.id) || undefined,
        label: sanitizeResolvableText(candidate.label, 'Badge'),
        tone:
          candidate.tone === 'info' ||
          candidate.tone === 'success' ||
          candidate.tone === 'warning' ||
          candidate.tone === 'danger' ||
          candidate.tone === 'neutral'
            ? candidate.tone
            : undefined,
        style,
      };
    case 'image':
      return {
        type: 'image',
        id: sanitizeString(candidate.id) || undefined,
        src: sanitizeResolvableText(candidate.src, ''),
        alt: sanitizeResolvableText(candidate.alt) || undefined,
        fit: candidate.fit === 'contain' ? 'contain' : 'cover',
        style,
      };
    case 'page':
    case 'card':
    case 'column':
    case 'row': {
      const rawChildren = Array.isArray(candidate.children) ? candidate.children : [];
      return {
        type: candidate.type,
        id: sanitizeString(candidate.id) || undefined,
        style,
        children: rawChildren.map((child: unknown) => sanitizePreviewNode(child)),
      };
    }
    case 'select': {
      const rawOptions = Array.isArray(candidate.options) ? candidate.options : [];
      return {
        type: 'select',
        id: sanitizeString(candidate.id) || undefined,
        name: sanitizeString(candidate.name, 'field'),
        label: sanitizeResolvableText(candidate.label) || undefined,
        placeholder: sanitizeResolvableText(candidate.placeholder) || undefined,
        mode: candidate.mode === 'multiple' ? 'multiple' : 'single',
        options: rawOptions.map((opt: unknown) => {
          const o = opt && typeof opt === 'object' ? (opt as Record<string, unknown>) : {};
          return { label: sanitizeString(o.label, ''), value: sanitizeString(o.value, '') };
        }),
        value: sanitizeResolvableText(candidate.value) || undefined,
        style,
      };
    }
    case 'buttonGroup': {
      const rawOptions = Array.isArray(candidate.options) ? candidate.options : [];
      return {
        type: 'buttonGroup',
        id: sanitizeString(candidate.id) || undefined,
        name: sanitizeString(candidate.name, 'field'),
        mode: candidate.mode === 'multiple' ? 'multiple' : 'single',
        direction: candidate.direction === 'column' ? 'column' : 'row',
        options: rawOptions.map((opt: unknown) => {
          const o = opt && typeof opt === 'object' ? (opt as Record<string, unknown>) : {};
          return { label: sanitizeString(o.label, ''), value: sanitizeString(o.value, '') };
        }),
        value: sanitizeResolvableText(candidate.value) || undefined,
        style,
      };
    }
    default:
      return toPlaceholderTextNode(candidate, 'Unsupported node');
  }
}

function sanitizePreviewSpec(value: unknown, fallbackSpec: PreviewSpec): PreviewSpec | null {
  const candidate = asRecord(value);
  if (!candidate) return null;

  const theme = asRecord(candidate.theme);

  return normalizeSpec({
    version: sanitizeString(candidate.version, fallbackSpec.version),
    theme: {
      primary: sanitizeString(theme?.primary ?? theme?.accent, fallbackSpec.theme.primary),
      bg: sanitizeString(theme?.bg ?? theme?.canvas, fallbackSpec.theme.bg),
      text: sanitizeString(theme?.text, fallbackSpec.theme.text),
      textMinor: sanitizeString(theme?.textMinor ?? theme?.muted, fallbackSpec.theme.textMinor),
    },
    root: sanitizePreviewNode(candidate.root ?? fallbackSpec.root),
  });
}

function stripCodeFences(text: string) {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

function extractJsonObject(text: string) {
  const trimmed = stripCodeFences(text);

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

/**
 * 尝试修复截断的 JSON：统计未闭合的 brackets/braces 并补全。
 * 只处理尾部截断的情况（LLM 生成不完整）。
 */
function tryRepairTruncatedJson(text: string): string {
  let inString = false;
  let isEscaped = false;
  const stack: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (ch === '\\' && inString) {
      isEscaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === ch) {
        stack.pop();
      }
    }
  }

  // 如果在字符串内部被截断，先关闭字符串
  let suffix = '';
  if (inString) suffix += '"';
  // 按栈顺序反向补全
  while (stack.length > 0) {
    suffix += stack.pop();
  }

  return text + suffix;
}

function parseModelPayload(text: string): ParsedModelPayload {
  const jsonText = extractJsonObject(text);

  // 第一次尝试：直接解析
  try {
    const parsed = JSON.parse(jsonText) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Model response is not a JSON object.');
    }
    return parsed as ParsedModelPayload;
  } catch (firstError) {
    // 第二次尝试：修复截断的 JSON 后重试
    try {
      const repaired = tryRepairTruncatedJson(jsonText);
      if (repaired !== jsonText) {
        console.warn('[parseModelPayload] JSON truncated, auto-repaired. Added:', repaired.slice(jsonText.length));
        const parsed = JSON.parse(repaired) as unknown;
        if (parsed && typeof parsed === 'object') {
          return parsed as ParsedModelPayload;
        }
      }
    } catch {
      // 修复也失败，抛出原始错误
    }

    // 提取出错位置附近的字符用于调试
    const posMatch = String(firstError).match(/position (\d+)/);
    if (posMatch) {
      const pos = Number(posMatch[1]);
      const around = jsonText.slice(Math.max(0, pos - 20), pos + 20);
      const charCodes = Array.from(around)
        .map((c) => `${c}(${c.charCodeAt(0).toString(16)})`)
        .join(' ');
      console.error(`[parseModelPayload] error near pos ${pos}:`, around, '\ncharCodes:', charCodes);
    }
    throw new Error(
      `Failed to parse model JSON response: ${firstError instanceof Error ? firstError.message : 'Unknown error'}. Raw text: ${text}`,
    );
  }
}

export function resolveChatGeneration(responseText: string, fallbackSpec: PreviewSpec): ChatGenerationOutput {
  try {
    const payload = parseModelPayload(responseText);
    const reply = typeof payload.reply === 'string' ? payload.reply : null;
    const nextSpec = isPreviewSpec(payload.nextSpec)
      ? normalizeSpec(payload.nextSpec)
      : sanitizePreviewSpec(payload.nextSpec, fallbackSpec);
    const log = typeof payload.log === 'string' ? payload.log : '';

    if (!reply) {
      throw new Error('Model response must include a string reply.');
    }

    if (!nextSpec) {
      return {
        reply,
        nextSpec: normalizeSpec(fallbackSpec),
        log: log || 'Model response did not provide a valid nextSpec. Falling back to current spec.',
      };
    }

    return { reply, nextSpec, log };
  } catch (err) {
    // JSON 完全无法解析，或 reply 字段缺失时软降级：
    // 将原始文本作为 reply 展示给用户，spec 保持当前状态不变
    console.error('[resolveChatGeneration] parse error:', err);
    return {
      reply: responseText?.trim() || '抱歉，生成结果解析失败，请重试。',
      nextSpec: normalizeSpec(fallbackSpec),
      log: `Parse failed. Raw response: ${responseText}`,
    };
  }
}
