export const MAX_TEMPLATE_TAG_NUMBER = 30;

export const MAX_TEMPLATE_TAG_INPUT_NUMBER = 30;

export const MIN_TEMPLATE_TAG_INPUT_NUMBER = 1;

export enum TemplateTagType {
  Number = 1,
  Keyword = 2,
}

export const MAX_TAG_LENGTH = 50;

export const MAX_TAG_NUMBER = 20;

export const DEAULT_LOGO_URL_LIST = [
  'https://res.qiyukf.net/storage/0ef8af90-52b2-46d2-a298-3ca3c21685ed.png',
  'https://res.qiyukf.net/storage/d3e0633c-0b10-48a1-9d19-ce9f3836d82b.png',
  'https://res.qiyukf.net/storage/5230a80e-56ae-45fa-9f63-36a9534b60f3.png',
  'https://res.qiyukf.net/storage/09b76248-9e9f-4daa-9e53-a171e2e21fb5.png',
  'https://res.qiyukf.net/storage/9aa9af86-d247-4a62-b542-bf82f721dff9.png',
  'https://res.qiyukf.net/storage/8a84c83e-5fc5-4e64-98bf-68cbadfdca3c.png',
  'https://res.qiyukf.net/storage/d0abb2cd-6449-4a9a-9c9d-f1ef7f8f38ba.png',
  'https://res.qiyukf.net/storage/de664274-5ec5-4555-8b8f-da82ef790d8b.png',
  'https://res.qiyukf.net/storage/676331a7-ff6b-438d-ac25-9abaa137eb67.png',
  'https://res.qiyukf.net/storage/3055d92f-d26c-4772-a4b3-2d148c7702a8.png',
  'https://res.qiyukf.net/storage/7fb797ad-6355-47fd-83b5-9cdf6a16e61f.png',
  'https://res.qiyukf.net/storage/409b18e5-b1c2-4147-a246-3f60372bf786.png',
  'https://res.qiyukf.net/storage/98db4a34-af3a-4551-817b-1006e0f9e39a.png',
  'https://res.qiyukf.net/storage/9c25b994-5b2c-4fa7-8bf4-970cebe6f55a.png',
  'https://res.qiyukf.net/storage/1d305327-6c26-44ff-bce1-46fb1c3de0ad.png',
  'https://res.qiyukf.net/storage/66056eec-526e-4082-a7ec-a49132ccb0e8.png',
  'https://res.qiyukf.net/storage/5fa9ef7c-6da1-4e44-8dcc-2df3160bdf40.png',
  'https://res.qiyukf.net/storage/8ff7f036-6772-40bd-9b37-a63cc808353f.png',
  'https://res.qiyukf.net/storage/ea6fb142-8dde-40af-b873-4e16abdc1f53.png',
  'https://res.qiyukf.net/storage/a29b8201-ce5e-4848-b4c3-24bb3f7610fe.png',
  'https://res.qiyukf.net/storage/369b8001-8ec4-4c13-b462-e8e26ca7589c.png',
  'https://res.qiyukf.net/storage/4ca9e455-cb6e-4692-a4ca-dae7c8ab7420.png',
  'https://res.qiyukf.net/storage/b7d45611-b312-4b3e-b4e6-a478c8023c8e.png',
  'https://res.qiyukf.net/storage/f0d4be15-b8ca-4cfe-998f-f85dff978adf.png',
  'https://res.qiyukf.net/storage/833dee75-df41-4a26-901e-b6b9c1bbc8cb.png',
  'https://res.qiyukf.net/storage/fb3d2119-2cd4-4ed4-af2c-f0b268d7f7a1.png',
  'https://res.qiyukf.net/storage/273c3099-2273-4033-b229-6031f8320945.png',
  'https://res.qiyukf.net/storage/0073e653-9412-40a2-a23f-ffc6162679ef.png',
  'https://res.qiyukf.net/storage/172aed43-0145-4328-b346-2f2743c6ea0b.png',
];

export const AuthTypeLabelMap: Record<string, string> = {
  none: '无',
  qiyu: '七鱼鉴权体系',
  service: '云商鉴权体系',
  qiyu_bot: '七鱼机器人一触即达鉴权体系',
};

export enum TemplateKeyenum {
  templateApp = 'templateApp',
  allowCopy = 'allowCopy',
  templateAccessUrl = 'templateAccessUrl',
  logoUrl = 'logoUrl',
  templateCategoryId = 'templateCategoryId',
  templateTagList = 'templateTagList',
  sampleQueries = 'sampleQueries',
}

export const TEMPLATE_KEY_LIST = [
  TemplateKeyenum.templateApp,
  TemplateKeyenum.allowCopy,
  TemplateKeyenum.templateAccessUrl,
  TemplateKeyenum.logoUrl,
  TemplateKeyenum.templateCategoryId,
  TemplateKeyenum.templateTagList,
  TemplateKeyenum.sampleQueries,
];
