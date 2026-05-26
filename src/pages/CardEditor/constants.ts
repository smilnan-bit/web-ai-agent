import type { PreviewSpec, PresetTemplate } from './types';
import { normalizeSpec } from './utils/normalize-spec';

function cloneSpec(spec: PreviewSpec): PreviewSpec {
  return JSON.parse(JSON.stringify(spec)) as PreviewSpec;
}

export const emptySpec: PreviewSpec = normalizeSpec({
  version: '0.2.0',
  theme: {
    primary: '#3370ff',
    bg: '#ffffff',
    text: '#1f2329',
    textMinor: '#8f959e',
  },
  root: {
    type: 'card',
    id: 'root',
    children: [],
  },
});

export const cardTemplates: Array<{ id: string; name: string; spec: PreviewSpec }> = [
  { id: 'blank', name: '空白', spec: emptySpec },
];

const loginSpec: PreviewSpec = {
  version: '0.2.0',
  theme: {
    primary: '#6f72d8',
    bg: '#ffffff',
    text: '#162033',
    textMinor: '#62708a',
  },
  root: {
    type: 'card',
    id: 'login-card',
    style: {
      width: '100%',
      maxWidth: '420px',
      padding: '24px',
      radius: '24px',
      background: '#ffffff',
      shadow: '0 14px 36px rgba(49, 69, 104, 0.10)',
    },
    children: [
      {
        type: 'column',
        id: 'login-content',
        style: {
          gap: '10px',
        },
        children: [
          {
            type: 'text',
            id: 'title',
            text: {
              binding: 'user.name',
              fallback: 'Welcome back',
            },
            as: 'h1',
            style: {
              fontSize: '36px',
              fontWeight: '700',
            },
          },
          {
            type: 'text',
            id: 'subtitle',
            text: 'Sign in to your workspace account',
            as: 'p',
            style: {
              color: '#62708a',
              fontSize: '16px',
            },
          },
          {
            type: 'input',
            id: 'email',
            name: 'email',
            label: 'Email',
            placeholder: {
              binding: 'user.email',
              fallback: 'Please enter your email',
            },
            inputType: 'email',
          },
          {
            type: 'input',
            id: 'password',
            name: 'password',
            label: 'Password',
            placeholder: 'Please enter your password',
            inputType: 'password',
          },
          {
            type: 'row',
            id: 'actions',
            style: {
              justify: 'start',
              gap: '10px',
              padding: '4px 0 0',
            },
            children: [
              {
                type: 'button',
                id: 'sign-in',
                label: 'Sign in',
                variant: 'primary',
                style: {
                  padding: '10px 18px',
                },
              },
            ],
          },
          {
            type: 'divider',
            id: 'divider',
          },
          {
            type: 'row',
            id: 'footer-actions',
            style: {
              justify: 'between',
              gap: '10px',
            },
            children: [
              {
                type: 'text',
                id: 'signup-copy',
                text: "Don't have an account?",
                as: 'p',
                style: {
                  color: '#62708a',
                  fontSize: '14px',
                },
              },
              {
                type: 'button',
                id: 'sign-up',
                label: 'Create account',
                variant: 'secondary',
                style: {
                  padding: '10px 16px',
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

const blankSpec: PreviewSpec = {
  version: '0.2.0',
  theme: {
    primary: '#4a7bff',
    bg: '#ffffff',
    text: '#162033',
    textMinor: '#7b88a1',
  },
  root: {
    type: 'card',
    id: 'blank-card',
    style: {
      width: '100%',
      maxWidth: '460px',
      padding: '20px',
      radius: '18px',
      background: '#ffffff',
      shadow: '0 10px 24px rgba(48, 84, 150, 0.08)',
    },
    children: [
      {
        type: 'column',
        id: 'blank-content',
        style: {
          gap: '8px',
        },
        children: [
          {
            type: 'text',
            id: 'blank-title',
            text: 'Blank canvas',
            as: 'h1',
            style: {
              fontSize: '24px',
              fontWeight: '700',
            },
          },
          {
            type: 'text',
            id: 'blank-subtitle',
            text: 'No preset content.',
            as: 'p',
            style: {
              color: '#7b88a1',
              fontSize: '14px',
            },
          },
        ],
      },
    ],
  },
};

const productSpec: PreviewSpec = {
  version: '0.2.0',
  theme: {
    primary: '#ff6a3d',
    bg: '#fffdfb',
    text: '#221b16',
    textMinor: '#7f6858',
  },
  root: {
    type: 'card',
    id: 'product-card',
    style: {
      width: '100%',
      maxWidth: '430px',
      padding: '22px',
      radius: '22px',
      background: '#fffdfb',
      shadow: '0 16px 40px rgba(140, 77, 34, 0.10)',
    },
    children: [
      {
        type: 'column',
        id: 'product-content',
        style: {
          gap: '12px',
        },
        children: [
          {
            type: 'text',
            id: 'badge',
            text: 'SPRING DROP',
            as: 'p',
            style: {
              color: '#ff6a3d',
              fontSize: '12px',
              fontWeight: '700',
            },
          },
          {
            type: 'card',
            id: 'product-image-block',
            style: {
              padding: '18px',
              radius: '18px',
              background: 'linear-gradient(135deg, #ffe2d2 0%, #fff4ec 100%)',
            },
            children: [
              {
                type: 'column',
                id: 'product-image-content',
                style: {
                  gap: '8px',
                },
                children: [
                  {
                    type: 'text',
                    id: 'image-title',
                    text: 'AeroPulse Headphones',
                    as: 'h2',
                    style: {
                      fontSize: '24px',
                      fontWeight: '700',
                    },
                  },
                  {
                    type: 'text',
                    id: 'image-subtitle',
                    text: 'Wireless noise cancellation with 32-hour battery life',
                    as: 'p',
                    style: {
                      color: '#7f6858',
                      fontSize: '14px',
                    },
                  },
                ],
              },
            ],
          },
          {
            type: 'row',
            id: 'price-row',
            style: {
              justify: 'between',
              gap: '10px',
            },
            children: [
              {
                type: 'text',
                id: 'price',
                text: '$249',
                as: 'h2',
                style: {
                  fontSize: '28px',
                  fontWeight: '700',
                },
              },
              {
                type: 'text',
                id: 'price-note',
                text: 'Free shipping today',
                as: 'p',
                style: {
                  color: '#7f6858',
                  fontSize: '14px',
                },
              },
            ],
          },
          {
            type: 'row',
            id: 'cta-row',
            style: {
              gap: '10px',
              justify: 'between',
            },
            children: [
              {
                type: 'button',
                id: 'buy-now',
                label: 'Buy now',
                variant: 'primary',
                style: {
                  padding: '10px 16px',
                },
              },
              {
                type: 'button',
                id: 'add-cart',
                label: 'Add to cart',
                variant: 'secondary',
                style: {
                  padding: '10px 16px',
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

const orderSpec: PreviewSpec = {
  version: '0.2.0',
  theme: {
    primary: '#1f7a5f',
    bg: '#ffffff',
    text: '#162a22',
    textMinor: '#668074',
  },
  root: {
    type: 'card',
    id: 'order-card',
    style: {
      width: '100%',
      maxWidth: '460px',
      padding: '22px',
      radius: '22px',
      background: '#ffffff',
      shadow: '0 16px 40px rgba(45, 95, 77, 0.10)',
    },
    children: [
      {
        type: 'column',
        id: 'order-content',
        style: {
          gap: '12px',
        },
        children: [
          {
            type: 'row',
            id: 'order-header',
            style: {
              justify: 'between',
              gap: '8px',
            },
            children: [
              {
                type: 'text',
                id: 'order-title',
                text: {
                  binding: 'order.id',
                  fallback: 'Order #A23198',
                },
                as: 'h2',
                style: {
                  fontSize: '24px',
                  fontWeight: '700',
                },
              },
              {
                type: 'button',
                id: 'status',
                label: 'Shipped',
                variant: 'secondary',
                style: {
                  padding: '8px 12px',
                },
              },
            ],
          },
          {
            type: 'text',
            id: 'order-subtitle',
            text: {
              binding: 'order.arrival',
              fallback: 'Estimated arrival: Tomorrow, 18:00 - 21:00',
            },
            as: 'p',
            style: {
              color: '#668074',
              fontSize: '14px',
            },
          },
          {
            type: 'divider',
            id: 'order-divider-1',
          },
          {
            type: 'row',
            id: 'order-item-row',
            style: {
              justify: 'between',
              gap: '10px',
            },
            children: [
              {
                type: 'column',
                id: 'order-item-info',
                style: {
                  gap: '6px',
                },
                children: [
                  {
                    type: 'text',
                    id: 'order-item-name',
                    text: 'AeroPulse Headphones',
                    as: 'h3',
                    style: {
                      fontSize: '18px',
                      fontWeight: '700',
                    },
                  },
                  {
                    type: 'text',
                    id: 'order-item-meta',
                    text: 'Midnight Black · Qty 1',
                    as: 'p',
                    style: {
                      color: '#668074',
                      fontSize: '14px',
                    },
                  },
                ],
              },
              {
                type: 'text',
                id: 'order-total',
                text: '$249',
                as: 'h3',
                style: {
                  fontSize: '18px',
                  fontWeight: '700',
                },
              },
            ],
          },
          {
            type: 'divider',
            id: 'order-divider-2',
          },
          {
            type: 'column',
            id: 'order-detail-list',
            style: {
              gap: '8px',
            },
            children: [
              {
                type: 'text',
                id: 'shipping-title',
                text: 'Shipping address',
                as: 'h3',
                style: {
                  fontSize: '16px',
                  fontWeight: '700',
                },
              },
              {
                type: 'text',
                id: 'shipping-body',
                text: 'Ling Chen · 188 0000 0000\n88 Century Avenue, Pudong, Shanghai',
                as: 'p',
                style: {
                  color: '#668074',
                  fontSize: '14px',
                },
              },
            ],
          },
          {
            type: 'row',
            id: 'order-action-row',
            style: {
              gap: '10px',
              justify: 'between',
              padding: '4px 0 0',
            },
            children: [
              {
                type: 'button',
                id: 'track-order',
                label: 'Track order',
                variant: 'primary',
                style: {
                  padding: '10px 16px',
                },
              },
              {
                type: 'button',
                id: 'contact-support',
                label: 'Contact support',
                variant: 'secondary',
                style: {
                  padding: '10px 16px',
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

export const presetTemplates: PresetTemplate[] = [
  { id: 'blank', name: '空白', description: '从空白画布开始', spec: blankSpec },
  { id: 'login', name: '登录', description: '品牌感登录卡片', spec: loginSpec },
  { id: 'product', name: '商品卡片', description: '偏电商展示与转化', spec: productSpec },
  { id: 'order', name: '订单信息', description: '后台信息卡片', spec: orderSpec },
];

export const defaultSpec = normalizeSpec(cloneSpec(loginSpec));

export function getPresetSpec(presetId: string): PreviewSpec {
  const preset = presetTemplates.find((item) => item.id === presetId)?.spec ?? loginSpec;
  return normalizeSpec(cloneSpec(preset));
}

export const THINKING_MESSAGE_ID = 'assistant-thinking';

export const starterMessages = [
  {
    id: 'assistant-1',
    role: 'assistant' as const,
    content: '你好！我是 AI 卡片编辑助手。你可以试试：把标题改成中文、主题色改成粉色、增加一个表单字段。',
    log: JSON.stringify({ stage: 'init', message: 'Default login card loaded.' }, null, 2),
  },
];
