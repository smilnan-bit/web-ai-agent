import { Empty, Form, Modal, type ModalProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import type { ToolNS } from '@/types/Tools';
import useAgentHistory from '@/pages/AppList/components/EditContent/History/useAgentHistory';
import './index.less';
import SelectType from './SelectType';
import DataSource from './DataSource';
import Preview from './Preview';
import CotUiDataSource from './components/CotUiDataSource';
import { CardModeEnum, CardTypeConfig, CardTypeEnum, modulePrefix } from './constants';
import { SelectCardState, SelectedCotUiSpecIdState } from './model';
import type { SpecMeta } from '@/api/card';

const BindCard: React.FC<
  Overwrite<
    ModalProps,
    {
      initData?: any;
      responseParams: ToolNS.ToolParamsType[];
      mode?: CardModeEnum;
      onOk: (params: { cardType: CardTypeEnum } & Record<string, any>) => void;
      agnetCardParams?: Record<string, any>;
      readonly?: boolean;
    }
  >
> = ({
  initData,
  responseParams,
  onOk,
  mode = CardModeEnum.bind,
  agnetCardParams = {},
  readonly = false,
  ...modalProps
}) => {
  const [form] = Form.useForm();
  const [selectCardType, setSelectedCardType] = useRecoilState(SelectCardState);
  const resetSelectCardType = useResetRecoilState(SelectCardState);
  const [selectedCotUiSpecId, setSelectedCotUiSpecId] = useRecoilState(SelectedCotUiSpecIdState);
  const resetSelectedCotUiSpecId = useResetRecoilState(SelectedCotUiSpecIdState);
  const { isHistoryMode } = useAgentHistory();
  const disabled = readonly || isHistoryMode;
  const [cotUiMeta, setCotUiMeta] = useState<SpecMeta | null>(null);

  const onSubmit = async () => {
    const agentCardParams = {};
    const values = await form.validateFields();
    const agentCardParamsKeys = Object.keys(agnetCardParams || {});
    agentCardParamsKeys.forEach((key) => {
      if (agentCardParams[key] === undefined) {
        agentCardParams[key] = values[key];
      }
    });
    const params = {
      cardType: selectCardType,
      ...(selectCardType === CardTypeEnum.notUse ? {} : { [selectCardType]: values }),
      ...agentCardParams,
    };
    onOk(params);
  };

  useEffect(() => {
    if (modalProps.open) {
      if (!initData) {
        resetSelectCardType();
        resetSelectedCotUiSpecId();
      } else {
        setSelectedCardType(initData.cardType);
        if (initData.cardType === CardTypeEnum.cotUi) {
          setSelectedCotUiSpecId(initData.cotUi?.specId);
        } else {
          resetSelectedCotUiSpecId();
        }
      }
    }
  }, [modalProps.open, initData]);

  useEffect(() => {
    // 切换卡片类型或 a2ui 切换 specId 时重置表单；同类型同 specId 恢复 initData
    const isSameType = initData?.cardType === selectCardType;
    const isSameCotUiSpec = selectCardType !== CardTypeEnum.cotUi || initData?.cotUi?.specId === selectedCotUiSpecId;
    if (!isSameType || !isSameCotUiSpec) {
      form.resetFields();
      return;
    }
    if (selectCardType === CardTypeEnum.cotUi) {
      form.setFieldsValue(initData?.cotUi);
    } else {
      form.setFieldsValue(initData?.[selectCardType]);
    }
  }, [form, initData, selectCardType, selectedCotUiSpecId]);

  // 特殊数据变化时，更新表单
  useEffect(() => {
    if (Object.keys(agnetCardParams || {})?.length !== 0) {
      form.setFieldsValue(agnetCardParams);
    }
  }, [agnetCardParams]);

  const isCotUi = selectCardType === CardTypeEnum.cotUi;

  return (
    <Modal
      title={mode !== CardModeEnum.bind ? '配置卡片内容' : '绑定卡片'}
      bodyStyle={{ height: 600, padding: 0 }}
      width={1200}
      onOk={onSubmit}
      cancelButtonProps={{ disabled }}
      okButtonProps={{ disabled }}
      {...modalProps}
    >
      <Form
        form={form}
        style={{ height: '100%' }}
        onValuesChange={(changedValues) => {
          // 商品卡片 切换样式重置绑定数据
          if (changedValues.cardStyle !== undefined && selectCardType === CardTypeEnum.product) {
            const { bindFields } = CardTypeConfig?.[selectCardType]?.formConfig?.[0] || {};
            const bindFieldsName =
              bindFields?.fields?.flatMap((item) =>
                Array.isArray(item) ? item.map((item) => item.name) : [item.name],
              ) || [];
            const otherFieldsName = bindFields?.otherFields?.map((item) => item.name) || [];
            form.resetFields([...bindFieldsName, ...otherFieldsName, 'url']);
          }
        }}
        disabled={disabled}
      >
        <div className={modulePrefix}>
          <SelectType mode={mode} disabled={disabled} />
          {selectCardType === CardTypeEnum.notUse ? (
            <div className={`${modulePrefix}-notuse`}>
              <Empty description={null}>
                <>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>不使用卡片回复</div>
                  <div>大模型将根据工具调用结果生成文本回复，不会显示任何可视化卡片</div>
                </>
              </Empty>
            </div>
          ) : isCotUi ? (
            <>
              <CotUiDataSource onMetaLoaded={setCotUiMeta} />
              <Preview cotUiMeta={cotUiMeta} />
            </>
          ) : (
            <>
              <DataSource responseParams={responseParams} mode={mode} />
              <Preview />
            </>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default React.memo(BindCard);
