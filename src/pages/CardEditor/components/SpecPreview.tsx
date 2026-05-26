// src/pages/CardEditor/components/SpecPreview.tsx

import React, { useCallback, useState } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import { resolvePreviewSpec } from '../utils/resolve-binding';
import type {
  BadgeNode,
  BindingValue,
  ButtonGroupNode,
  ButtonNode,
  DividerNode,
  ImageNode,
  InputNode,
  PreviewNode,
  PreviewSpec,
  ResolvableText,
  RuntimeData,
  SelectNode,
  StyleToken,
  TextNode,
} from '../types';

function toCssVars(theme: PreviewSpec['theme']): CSSProperties {
  return {
    '--theme-primary': theme.primary,
    '--theme-canvas': theme.bg,
    '--theme-text': theme.text,
    '--theme-text-minor': theme.textMinor,
  } as CSSProperties;
}

function mapStyles(style?: StyleToken): CSSProperties {
  if (!style) return {};
  return {
    width: style.width,
    maxWidth: style.maxWidth,
    minHeight: style.minHeight,
    padding: style.padding,
    gap: style.gap,
    borderRadius: style.radius,
    background: style.background,
    color: style.color,
    border: style.border,
    boxShadow: style.shadow,
    textAlign: style.align as CSSProperties['textAlign'],
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
  };
}

function getJustifyContent(value: StyleToken['justify']): string {
  switch (value) {
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'between':
      return 'space-between';
    default:
      return 'flex-start';
  }
}

function getNodeRenderKey(node: PreviewNode, fallbackKey?: string) {
  return node.id ?? fallbackKey ?? node.type;
}

function readBindingPath(value: ResolvableText | undefined): string | null {
  if (!value || typeof value !== 'object') return null;
  return typeof (value as BindingValue).binding === 'string' ? (value as BindingValue).binding : null;
}

/** 收集一个叶子节点上所有的 binding 路径（未解析前的 spec） */
function collectNodeBindingPaths(node: PreviewNode | undefined): string[] {
  if (!node) return [];
  const paths: string[] = [];
  const push = (p: string | null) => {
    if (p && !paths.includes(p)) paths.push(p);
  };
  switch (node.type) {
    case 'text':
      push(readBindingPath(node.text));
      return paths;
    case 'input':
      push(readBindingPath(node.label));
      push(readBindingPath(node.placeholder));
      push(readBindingPath(node.value));
      return paths;
    case 'button':
    case 'badge':
      push(readBindingPath(node.label));
      return paths;
    case 'image':
      push(readBindingPath(node.src));
      push(readBindingPath(node.alt));
      return paths;
    case 'select':
      push(readBindingPath(node.label));
      push(readBindingPath(node.placeholder));
      return paths;
    default:
      return paths;
  }
}

/**
 * 在字段左上角叠加「#序号」徽章。用 `position: relative` 的包装 + `absolute` 的徽章叠在内容角落，
 * 留一点内边距让徽章不贴着内容；保持 inline-block 避免撑宽父容器。
 */
function wrapWithBadges(element: ReactElement, badgeNumbers: number[], renderKey?: string): ReactElement {
  if (!badgeNumbers.length) return element;
  const sorted = Array.from(new Set(badgeNumbers)).sort((a, b) => a - b);
  return (
    <span
      key={renderKey ? `${renderKey}-badged` : undefined}
      style={{
        position: 'relative',
        display: 'inline-block',
        paddingTop: 12,
        paddingLeft: 12,
        marginTop: -12,
        marginLeft: -12,
        maxWidth: '100%',
      }}
    >
      {element}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: -8,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {sorted.map((n) => (
          <span
            key={n}
            style={{
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: '#337eff',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

function renderText(node: TextNode, renderKey?: string) {
  const Tag = (node.as ?? 'p') as keyof JSX.IntrinsicElements;
  const content = typeof node.text === 'string' ? node.text : (node.text.fallback ?? '');
  return (
    <Tag key={renderKey} style={{ margin: 0, ...mapStyles(node.style) }}>
      {content}
    </Tag>
  );
}

function renderInput(
  node: InputNode,
  renderKey?: string,
  onFormChange?: (name: string, value: string) => void,
  formValues?: Record<string, string>,
) {
  const label = typeof node.label === 'string' ? node.label : node.label?.fallback;
  const placeholder = typeof node.placeholder === 'string' ? node.placeholder : node.placeholder?.fallback;
  const defaultVal = typeof node.value === 'string' ? node.value : node.value?.fallback;
  const fieldName = node.name || node.id || renderKey || 'input';
  const currentValue = formValues?.[fieldName] ?? defaultVal ?? '';

  return (
    <label key={renderKey} tw="flex flex-col gap-1" style={mapStyles(node.style)}>
      {label ? (
        <span tw="text-[13px] font-medium" style={{ color: 'var(--theme-text)' }}>
          {label}
        </span>
      ) : null}
      <input
        tw="w-full rounded-lg border border-[rgba(0,0,0,0.12)] px-3 py-2 text-[14px] outline-none bg-white"
        value={currentValue}
        name={fieldName}
        placeholder={placeholder}
        type={node.inputType ?? 'text'}
        onChange={(e) => onFormChange?.(fieldName, e.target.value)}
      />
    </label>
  );
}

function renderDivider(node: DividerNode, renderKey?: string) {
  return <div key={renderKey} tw="w-full h-px" style={{ background: 'rgba(0,0,0,0.08)', ...mapStyles(node.style) }} />;
}

function renderBadge(node: BadgeNode, renderKey?: string) {
  const label = typeof node.label === 'string' ? node.label : (node.label?.fallback ?? '');
  const toneColors: Record<string, { bg: string; color: string }> = {
    neutral: { bg: 'rgba(0,0,0,0.06)', color: '#666' },
    info: { bg: '#e0f2fe', color: '#0369a1' },
    success: { bg: '#dcfce7', color: '#15803d' },
    warning: { bg: '#fef9c3', color: '#a16207' },
    danger: { bg: '#fee2e2', color: '#b91c1c' },
  };
  const tone = toneColors[node.tone ?? 'neutral'] ?? toneColors.neutral;

  return (
    <span
      key={renderKey}
      tw="inline-block rounded-full px-3 py-1 text-[12px] font-semibold"
      style={{ background: tone.bg, color: tone.color, ...mapStyles(node.style) }}
    >
      {label}
    </span>
  );
}

function renderImage(node: ImageNode, renderKey?: string) {
  const src = typeof node.src === 'string' ? node.src : (node.src.fallback ?? '');
  const alt = typeof node.alt === 'string' ? node.alt : (node.alt?.fallback ?? '');

  return (
    <img
      key={renderKey}
      tw="w-full rounded-lg"
      alt={alt}
      src={src || 'https://placehold.co/600x400/e9eef8/62708a?text=Preview'}
      style={{ objectFit: node.fit ?? 'cover', ...mapStyles(node.style) }}
    />
  );
}

/** Select 下拉组件：保持原始 select 样式，点击展开选项面板 */
const SelectPreview: React.FC<{
  label?: string;
  placeholder?: string;
  displayText: string;
  options: { label: string; value: string }[];
  selectedValues: string[];
  style?: StyleToken;
  isMultiple?: boolean;
  onOptionClick: (value: string) => void;
}> = ({ label, placeholder, displayText, options, selectedValues, style, isMultiple, onOptionClick }) => {
  const [open, setOpen] = useState(false);

  const handleOptionClick = (optValue: string) => {
    onOptionClick(optValue);
    if (!isMultiple) {
      setOpen(false);
    }
  };

  return (
    <label tw="flex flex-col gap-1 relative" style={mapStyles(style)}>
      {label ? (
        <span tw="text-[13px] font-medium" style={{ color: 'var(--theme-text)' }}>
          {label}
        </span>
      ) : null}
      <div
        tw="w-full rounded-lg border border-[rgba(0,0,0,0.12)] px-3 py-2 text-[14px] bg-white flex items-center justify-between cursor-pointer"
        style={{ color: displayText ? 'var(--theme-text)' : '#a0a3a8', minHeight: '38px' }}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{displayText || placeholder || '请选择'}</span>
        <span tw="text-[12px] text-[#a0a3a8]" style={{ transform: open ? 'rotate(180deg)' : undefined }}>
          ▾
        </span>
      </div>
      {open && options.length > 0 && (
        <div
          tw="absolute left-0 right-0 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white shadow-lg z-10 overflow-hidden"
          style={{ top: '100%', marginTop: 4 }}
        >
          {options.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <div
                key={opt.value}
                tw="px-3 py-2 text-[14px] cursor-pointer transition-colors hover:bg-[rgba(0,0,0,0.04)]"
                style={{
                  background: isSelected ? 'color-mix(in srgb, var(--theme-primary) 10%, transparent)' : undefined,
                  color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text)',
                  fontWeight: isSelected ? '500' : '400',
                }}
                onClick={() => handleOptionClick(opt.value)}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </label>
  );
};

function renderSelect(
  node: SelectNode,
  renderKey?: string,
  onFormChange?: (name: string, value: string) => void,
  formValues?: Record<string, string>,
) {
  const label = typeof node.label === 'string' ? node.label : node.label?.fallback;
  const placeholder = typeof node.placeholder === 'string' ? node.placeholder : node.placeholder?.fallback;
  const defaultVal = typeof node.value === 'string' ? node.value : node.value?.fallback;
  const fieldName = node.name || node.id || renderKey || 'select';
  const currentValue = formValues?.[fieldName] ?? defaultVal ?? '';
  const selectedValues = currentValue ? currentValue.split(',').filter(Boolean) : [];
  const isMultiple = node.mode === 'multiple';

  const handleOptionClick = (optValue: string) => {
    if (!onFormChange) return;
    if (isMultiple) {
      const next = selectedValues.includes(optValue)
        ? selectedValues.filter((v) => v !== optValue)
        : [...selectedValues, optValue];
      onFormChange(fieldName, next.join(','));
    } else {
      onFormChange(fieldName, selectedValues.includes(optValue) ? '' : optValue);
    }
  };

  const displayText =
    selectedValues.length > 0
      ? node.options
          .filter((opt) => selectedValues.includes(opt.value))
          .map((opt) => opt.label)
          .join(', ')
      : '';

  return (
    <SelectPreview
      key={renderKey}
      label={label}
      placeholder={placeholder}
      displayText={displayText}
      options={node.options}
      selectedValues={selectedValues}
      style={node.style}
      isMultiple={isMultiple}
      onOptionClick={handleOptionClick}
    />
  );
}

function renderButtonGroup(
  node: ButtonGroupNode,
  renderKey?: string,
  onFormChange?: (name: string, value: string) => void,
  formValues?: Record<string, string>,
) {
  const defaultVal = typeof node.value === 'string' ? node.value : node.value?.fallback;
  const fieldName = node.name || node.id || renderKey || 'buttonGroup';
  const currentValue = formValues?.[fieldName] ?? defaultVal ?? '';
  const selectedValues = currentValue ? currentValue.split(',').filter(Boolean) : [];
  const isRow = node.direction !== 'column';
  const isMultiple = node.mode === 'multiple';

  const handleOptionClick = (optValue: string) => {
    if (!onFormChange) return;
    if (isMultiple) {
      const next = selectedValues.includes(optValue)
        ? selectedValues.filter((v) => v !== optValue)
        : [...selectedValues, optValue];
      onFormChange(fieldName, next.join(','));
    } else {
      onFormChange(fieldName, selectedValues.includes(optValue) ? '' : optValue);
    }
  };

  return (
    <div
      key={renderKey}
      tw="flex flex-wrap"
      style={{
        flexDirection: isRow ? 'row' : 'column',
        gap: node.style?.gap ?? '8px',
        ...mapStyles(node.style),
      }}
    >
      {node.options.map((opt) => {
        const isSelected = selectedValues.includes(opt.value);
        return (
          <div
            key={opt.value}
            tw="rounded-lg px-4 py-2 text-[14px] font-medium text-center transition-all cursor-pointer"
            style={{
              border: isSelected ? '1.5px solid var(--theme-primary)' : '1px solid #e4e6eb',
              background: isSelected ? 'color-mix(in srgb, var(--theme-primary) 8%, transparent)' : 'transparent',
              color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text)',
              fontWeight: isSelected ? '500' : '400',
            }}
            onClick={() => handleOptionClick(opt.value)}
          >
            {opt.label}
          </div>
        );
      })}
    </div>
  );
}

function renderNode(
  node: PreviewNode | null | undefined,
  origNode: PreviewNode | null | undefined,
  fallbackKey?: string,
  onAction?: (node: ButtonNode) => void,
  onFormChange?: (name: string, value: string) => void,
  formValues?: Record<string, string>,
  bindingBadges?: Map<string, number>,
  rootOutlineColor?: string,
  isRoot?: boolean,
): React.ReactElement {
  if (!node || typeof node !== 'object' || !('type' in node)) {
    return <div key={fallbackKey ?? 'invalid-node'} />;
  }

  const renderKey = getNodeRenderKey(node, fallbackKey);

  const badgeNumbers =
    bindingBadges && origNode
      ? collectNodeBindingPaths(origNode)
          .map((p) => bindingBadges.get(p))
          .filter((n): n is number => typeof n === 'number')
      : [];

  const applyBadge = (el: ReactElement) => wrapWithBadges(el, badgeNumbers, renderKey);

  const getOrigChild = (origContainer: PreviewNode | null | undefined, index: number): PreviewNode | undefined => {
    if (
      origContainer &&
      typeof origContainer === 'object' &&
      'children' in origContainer &&
      Array.isArray((origContainer as { children: PreviewNode[] }).children)
    ) {
      return (origContainer as { children: PreviewNode[] }).children[index];
    }
    return undefined;
  };

  switch (node.type) {
    case 'text':
      return applyBadge(renderText(node, renderKey));
    case 'input':
      return applyBadge(renderInput(node, renderKey, onFormChange, formValues));
    case 'button': {
      const label = typeof node.label === 'string' ? node.label : (node.label?.fallback ?? '');
      const isPrimary = node.variant !== 'secondary';
      return applyBadge(
        <button
          key={renderKey}
          tw="rounded-lg px-4 py-2 text-[14px] font-medium cursor-pointer border-none outline-none transition-opacity hover:opacity-80"
          style={{
            background: isPrimary ? 'var(--theme-primary)' : 'transparent',
            color: isPrimary ? '#fff' : 'var(--theme-primary)',
            border: isPrimary ? 'none' : '1px solid var(--theme-primary)',
            ...mapStyles(node.style),
          }}
          type="button"
          onClick={() => onAction?.(node)}
        >
          {label}
        </button>,
      );
    }
    case 'badge':
      return applyBadge(renderBadge(node, renderKey));
    case 'image':
      return applyBadge(renderImage(node, renderKey));
    case 'divider':
      return renderDivider(node, renderKey);
    case 'select':
      return applyBadge(renderSelect(node, renderKey, onFormChange, formValues));
    case 'buttonGroup':
      return applyBadge(renderButtonGroup(node, renderKey, onFormChange, formValues));
    case 'card': {
      const mapped = mapStyles(node.style);
      // 仅 root card 接受 rootOutlineColor：用 box-shadow 叠描边，保留卡片自身阴影，不影响布局
      const outlineShadow = isRoot && rootOutlineColor ? `0 0 0 2px ${rootOutlineColor}` : '';
      const finalShadow = [outlineShadow, mapped.boxShadow].filter(Boolean).join(', ');
      return (
        <div
          key={renderKey}
          tw="rounded-2xl"
          style={{
            background: 'var(--theme-bg)',
            ...mapped,
            ...(finalShadow ? { boxShadow: finalShadow } : {}),
          }}
        >
          {node.children.map((child, i) =>
            renderNode(
              child,
              getOrigChild(origNode, i),
              `${renderKey}-${i}`,
              onAction,
              onFormChange,
              formValues,
              bindingBadges,
              rootOutlineColor,
              false,
            ),
          )}
        </div>
      );
    }
    case 'column':
      return (
        <div key={renderKey} tw="flex flex-col" style={mapStyles(node.style)}>
          {node.children.map((child, i) =>
            renderNode(
              child,
              getOrigChild(origNode, i),
              `${renderKey}-${i}`,
              onAction,
              onFormChange,
              formValues,
              bindingBadges,
              rootOutlineColor,
              false,
            ),
          )}
        </div>
      );
    case 'row':
      return (
        <div
          key={renderKey}
          tw="flex flex-row items-center"
          style={{ justifyContent: getJustifyContent(node.style?.justify), ...mapStyles(node.style) }}
        >
          {node.children.map((child, i) =>
            renderNode(
              child,
              getOrigChild(origNode, i),
              `${renderKey}-${i}`,
              onAction,
              onFormChange,
              formValues,
              bindingBadges,
              rootOutlineColor,
              false,
            ),
          )}
        </div>
      );
    default:
      return <div key={fallbackKey ?? 'unknown-node'} />;
  }
}

interface SpecPreviewProps {
  spec: PreviewSpec;
  runtimeData: RuntimeData;
  /** 撑满父容器宽度，用于列表缩略图场景 */
  fitContainer?: boolean;
  /**
   * 徽章模式：binding 路径 → 徽章序号（1 开始）。传入后，在对应叶子节点左上角叠加「#序号」徽章。
   * 用于 BindCard 中 a2ui 卡片变量映射面板，与中栏变量列表一一对应。
   */
  bindingBadges?: Map<string, number>;
  /**
   * 给 root card 叠加 2px 描边（box-shadow）。用于 CotUiOptionCard 选中/悬停态。
   * 未设置时不绘制描边。
   */
  rootOutlineColor?: string;
}

type ActionInfo = {
  type: string;
  name: string;
  nodeId: string;
  staticPayload: Record<string, string>;
  formValues: Record<string, string>;
};

const SpecPreview: React.FC<SpecPreviewProps> = ({
  spec,
  runtimeData,
  fitContainer,
  bindingBadges,
  rootOutlineColor,
}) => {
  const [actionInfo, setActionInfo] = useState<ActionInfo | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const resolvedSpec = resolvePreviewSpec(spec, runtimeData);

  const handleFormChange = useCallback((name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAction = useCallback(
    (node: ButtonNode) => {
      if (!node.action) return;
      setActionInfo({
        type: node.action.type,
        name: node.action.name,
        nodeId: node.id ?? 'anonymous',
        staticPayload: node.action.payload ?? {},
        formValues: { ...formValues },
      });
    },
    [formValues],
  );

  const renderedCard = renderNode(
    resolvedSpec.root,
    spec.root,
    undefined,
    handleAction,
    handleFormChange,
    formValues,
    bindingBadges,
    rootOutlineColor,
    true,
  );

  return (
    <div
      tw="relative rounded-lg flex items-center justify-center"
      style={{
        ...toCssVars(resolvedSpec.theme),
        color: 'var(--theme-text)',
        ...(fitContainer ? { alignItems: 'flex-start' } : {}),
      }}
    >
      {fitContainer ? (
        <div style={{ width: '100%', maxWidth: '100%' }} className="fit-container">
          {renderedCard}
        </div>
      ) : (
        renderedCard
      )}
      {actionInfo ? (
        <div
          tw="absolute bottom-2 left-2 right-2 rounded-lg bg-[rgba(0,0,0,0.82)] text-white text-[12px] px-3 py-2 font-mono cursor-pointer"
          onClick={() => setActionInfo(null)}
          title="点击关闭"
        >
          <div tw="flex items-center gap-1 mb-1">
            <span tw="text-[#7dd3fc]">[{actionInfo.type}]</span>
            <span tw="font-semibold">{actionInfo.name}</span>
            <span tw="text-[#94a3b8]">@ {actionInfo.nodeId}</span>
          </div>
          {Object.keys(actionInfo.staticPayload).length > 0 && (
            <div tw="border-t border-[rgba(255,255,255,0.15)] pt-1 mt-1">
              <div tw="text-[#94a3b8] mb-0.5">payload (static):</div>
              {Object.entries(actionInfo.staticPayload).map(([key, value]) => (
                <div key={key} tw="flex gap-1 pl-2">
                  <span tw="text-[#67e8f9]">{key}:</span>
                  <span tw="text-[#fde68a]">{value || '(empty)'}</span>
                </div>
              ))}
            </div>
          )}
          {Object.keys(actionInfo.formValues).length > 0 && (
            <div tw="border-t border-[rgba(255,255,255,0.15)] pt-1 mt-1">
              <div tw="text-[#94a3b8] mb-0.5">user input:</div>
              {Object.entries(actionInfo.formValues).map(([name, value]) => (
                <div key={name} tw="flex gap-1 pl-2">
                  <span tw="text-[#a5b4fc]">{name}:</span>
                  <span tw="text-[#fde68a]">{value || '(empty)'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SpecPreview;
