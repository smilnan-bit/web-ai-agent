import React, { useEffect, useMemo } from 'react';
import { Form, Empty } from 'antd';
import { useRecoilValue } from 'recoil';
import { useRequest } from 'ahooks';
import { getSpecMeta } from '@/api/card';
import type { SpecMeta } from '@/api/card';
import { modulePrefix } from '../../constants';
import { SelectedCotUiSpecIdState } from '../../model';
import CotUiBindingInput from '../CotUiBindingInput';
import './index.less';

const FormItem = Form.Item;

/**
 * 中栏：a2ui 卡片变量映射面板。
 * - 每一行 = #序号 + binding 路径 + 工作流变量引用选择器
 * - 序号与右栏 SpecPreview 的徽章序号一一对应
 * - 写回 form 字段：
 *   - specId：当前选中的 a2ui 卡片 id
 *   - bindings：path → 变量引用序列化字符串
 *   - reportDataKeys / actionNames：缓存的 spec meta，供 Dialog 节点同步推导输出与路由
 */
const CotUiDataSource: React.FC<{ onMetaLoaded?: (meta: SpecMeta) => void }> = ({ onMetaLoaded }) => {
  const specId = useRecoilValue(SelectedCotUiSpecIdState);
  const form = Form.useFormInstance();

  const { data: meta, run: loadMeta } = useRequest(
    async () => {
      if (!specId) return null;
      return await getSpecMeta({ id: specId });
    },
    { manual: true },
  );

  useEffect(() => {
    if (specId) loadMeta();
  }, [specId, loadMeta]);

  useEffect(() => {
    if (!meta) return;
    onMetaLoaded?.(meta);
    // 把 meta 写回 form，提交时 CardConfig.cotUi 会同时带上 reportDataKeys / actionNames
    form.setFieldsValue({
      specId,
      reportDataKeys: meta.reportDataKeys,
      actionNames: meta.actionNames,
    });
  }, [meta, onMetaLoaded, form, specId]);

  const bindingPaths = useMemo(() => meta?.bindingPaths ?? [], [meta]);

  return (
    <div className={`${modulePrefix}-datasource`}>
      <div className={`${modulePrefix}-title`} style={{ marginBottom: 24 }}>
        为卡片绑定数据源
      </div>
      {/* 隐藏字段：提交时随 form.getFieldsValue() 带出 */}
      <FormItem name="specId" hidden>
        <input />
      </FormItem>
      <FormItem name="reportDataKeys" hidden>
        <input />
      </FormItem>
      <FormItem name="actionNames" hidden>
        <input />
      </FormItem>
      {bindingPaths.length === 0 ? (
        <Empty description="该卡片没有可绑定的动态变量" style={{ marginTop: 80 }} />
      ) : (
        <div className={`${modulePrefix}-cotui-bindings`}>
          {bindingPaths.map((path, index) => (
            <div key={path} className={`${modulePrefix}-cotui-bindings-row`}>
              <span className={`${modulePrefix}-cotui-bindings-badge`}>{index + 1}</span>
              <div className={`${modulePrefix}-cotui-bindings-body`}>
                <div className={`${modulePrefix}-cotui-bindings-path`}>{path}</div>
                <FormItem name={['bindings', path]} noStyle>
                  <CotUiBindingInput />
                </FormItem>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CotUiDataSource;
