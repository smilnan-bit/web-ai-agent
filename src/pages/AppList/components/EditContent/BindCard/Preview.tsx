import React, { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useRequest } from 'ahooks';
import SpecPreview from '@/pages/CardEditor/components/SpecPreview';
import { defaultRuntimeData } from '@/pages/CardEditor/utils/runtime-data';
import { getCardDetail } from '@/api/card';
import type { SpecMeta } from '@/api/card';
import type { PreviewSpec } from '@/pages/CardEditor/types';
import './index.less';
import { CardTypeConfig, CardTypeEnum, modulePrefix } from './constants';
import { SelectCardState, SelectedCotUiSpecIdState } from './model';
import { useGetFormData } from './utils';

interface PreviewProps {
  /** cotUi 模式下由 CotUiDataSource 提供，右栏据此给绑定字段叠加徽章 */
  cotUiMeta?: SpecMeta | null;
}

const Preview: React.FC<PreviewProps> = ({ cotUiMeta }) => {
  const selectCardType = useRecoilValue(SelectCardState);
  const cotUiSpecId = useRecoilValue(SelectedCotUiSpecIdState);

  if (selectCardType === CardTypeEnum.cotUi) {
    return <CotUiPreview specId={cotUiSpecId} meta={cotUiMeta} />;
  }

  return <LegacyPreview cardType={selectCardType} />;
};

const LegacyPreview: React.FC<{ cardType: CardTypeEnum }> = ({ cardType }) => {
  const { previewPic } = CardTypeConfig[cardType] || {};
  const { cardStyleValue, hasActionValue, actionValue, verticalCardStyle } = useGetFormData();
  return (
    <div className={`${modulePrefix}-preview`}>
      <div className={`${modulePrefix}-title`}>卡片预览</div>
      <img src={previewPic?.({ cardStyleValue, hasActionValue, actionValue, verticalCardStyle })} />
    </div>
  );
};

const CotUiPreview: React.FC<{ specId?: string; meta?: SpecMeta | null }> = ({ specId, meta }) => {
  const { data: detail, run: loadDetail } = useRequest(
    async () => {
      if (!specId) return null;
      return await getCardDetail({ id: specId });
    },
    { manual: true },
  );

  useEffect(() => {
    if (specId) loadDetail();
  }, [specId, loadDetail]);

  const spec = useMemo<PreviewSpec | null>(() => {
    const uiJson = detail?.data?.uiJson;
    if (!uiJson) return null;
    try {
      return JSON.parse(uiJson) as PreviewSpec;
    } catch {
      return null;
    }
  }, [detail]);

  const bindingBadges = useMemo<Map<string, number> | undefined>(() => {
    const paths = meta?.bindingPaths;
    if (!paths?.length) return undefined;
    return new Map(paths.map((p, i) => [p, i + 1]));
  }, [meta]);

  return (
    <div className={`${modulePrefix}-preview ${modulePrefix}-preview-cotui`}>
      <div className={`${modulePrefix}-title`}>卡片预览</div>
      <div className={`${modulePrefix}-preview-cotui-body`}>
        {spec ? (
          <SpecPreview spec={spec} runtimeData={defaultRuntimeData} bindingBadges={bindingBadges} fitContainer />
        ) : (
          <div className={`${modulePrefix}-preview-cotui-empty`}>请选择左侧 a2ui 卡片</div>
        )}
      </div>
    </div>
  );
};

export default Preview;
