import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ModalProps } from 'antd';
import isEqual from 'lodash/isEqual';
import { Checkbox, Switch, Button, Card, Col, Form, Input, Modal, Row, Select, message } from 'antd';
import { useRecoilValue } from 'recoil';
import { GlobalConfigState } from '@/model';
import type { AppsNS } from '@/types/Apps';
import EnumSelect from '@/components/EnumSelect';
import {
  AgentAppPermissionKeyMap,
  AgentAuthTypeConfig,
  AgentBizTypeEnum,
  AgentModeConfig,
  AgentModeEnum,
  AgentTypeConfig,
  AgentTypeEnum,
  disabledCardStyle,
  notSelectedCardStyle,
  trimPattern,
} from '@/constants';
import { checkThirdApp, copyApp, getAppBizTypeList, saveApp } from '@/api';
import './index.less';
import { useMemoizedFn } from 'ahooks';
import { checkAllPermissionsTrue, isTruthyIncludingZero } from '@/pages/AppList/components/CreateAppModal/utils';
import { useRouter } from '@ysf/ys-router';
import TemplateTag from '@/pages/AppList/components/CreateAppModal/component/Tag/Tag';
import PicUpload from '@/pages/AppList/components/CreateAppModal/component/PicUpload';
import RichTextEditor from '@/pages/AppList/components/CreateAppModal/component/RichEditor';
import RadioIcon from '@/pages/AppList/components/CreateAppModal/component/RadioIcon';
import { DEAULT_LOGO_URL_LIST, TemplateKeyenum } from '@/pages/AppList/components/CreateAppModal/constanst';
import { formatInitTemplateValues } from '@/pages/AppList/components/CreateAppModal/utils';

type AllowedCreateConfig = Omit<Record<AgentTypeEnum, boolean>, AgentTypeEnum.inspection>;

const CreateAppModal: React.FC<
  Overwrite<ModalProps, { onOk: (values: AppsNS.AppType) => void }> & {
    initData?: AppsNS.AppType;
    disableCreateConfig?: AllowedCreateConfig;
    permissions?: {
      selfAppOutLimit?: boolean;
      inspectionAppOutLimit?: boolean;
      thirdPartyAppOutLimit?: boolean;
    };
  }
> = ({ initData, onOk, disableCreateConfig, permissions = {}, ...modalProps }) => {
  const [form] = Form.useForm();
  const { navigate, routesMap } = useRouter();

  const { setFieldsValue, validateFields } = form;
  const [submitLoading, setSubmitLoading] = useState(false);
  const nameValue = Form.useWatch('appName', form);
  const descValue = Form.useWatch('appDesc', form);
  const globalConfig = useRecoilValue(GlobalConfigState) || {};
  const selectedAgentType = Form.useWatch('type', form);
  const selectedAgentMode = Form.useWatch('mode', form);
  const certificationValue = Form.useWatch('certification', form);
  const bizTypeValue = Form.useWatch('bizType', form);
  const [bizTypeList, setBizTypeList] = useState<Array<{ label: string; value: number; disabled: boolean }>>([]);
  const templateValue = Form.useWatch('template', form);
  const templateSwitchValue = Form.useWatch(['template', TemplateKeyenum.templateApp], form);

  const onSave = useCallback(
    (e) => {
      validateFields().then((values) => {
        const queryParams = {
          ...values,
          ...values.template,
        };
        delete queryParams.template; // 移除template字段，template下的值已平铺至queryParams中
        delete queryParams.isCopy;
        setSubmitLoading(true);
        const api = initData?.isCopy ? copyApp : saveApp;
        // 复制时，移除isCopy和templateApp字段
        api(queryParams)
          .then((res) => {
            const title = initData?.isCopy ? '复制' : initData ? '编辑' : '创建';
            message.success(`${title}成功`);
            if (initData?.isCopy && values?.type !== AgentTypeEnum.thirdParty) {
              try {
                const { data } = res || {};
                const { appId } = data || {};
                navigate(routesMap.appEdit.path, { query: { appId } });
              } catch (error) {}

              return;
            }
            onOk?.(queryParams);
          })
          .finally(() => {
            setSubmitLoading(false);
          });
      });
    },
    [initData, onOk, validateFields],
  );

  const validateThird = useCallback(() => {
    checkThirdApp(certificationValue).then(({ data }) => {
      if (data) {
        message.success('接口校验成功');
      } else {
        message.error('接口校验失败');
      }
    });
  }, [certificationValue]);

  // 选择Agent类型
  const handleTypeSelect = (type: AgentTypeEnum) => {
    if (initData) {
      return;
    }
    // 当选择三方Agent时，清除mode字段
    if (type === AgentTypeEnum.thirdParty) {
      form.setFieldsValue({ type, mode: undefined });
    } else {
      // 当选择自营Agent时，如果mode未设置，则设置为默认值
      const currentMode = form.getFieldValue('mode');
      form.setFieldsValue({
        type,
        mode: currentMode !== undefined ? currentMode : AgentModeEnum.autonomous,
      });
    }
  };

  // 选择Agent模式
  const handleModeSelect = (mode: AgentModeEnum) => {
    if (initData) {
      return;
    }
    form.setFieldsValue({ mode });
  };

  // 是否展示模板相关配置项
  const showTemplateSection = useMemo(() => {
    const { templateTenant } = globalConfig || {};
    if (!templateTenant) return false;
    if (initData?.isCopy) return false;
    if (bizTypeValue !== AgentBizTypeEnum.Service) return false;
    return selectedAgentType === AgentTypeEnum.self;
  }, [globalConfig, selectedAgentType, bizTypeValue, initData]);

  // 模板分类选项
  const templateCategoryOptions = useMemo(() => {
    if (!showTemplateSection) return [];
    const { templateCategoryList } = globalConfig || {};
    return (templateCategoryList || [])?.map((category) => ({
      label: category.categoryName,
      value: category.categoryId,
    }));
  }, [globalConfig, showTemplateSection]);

  // 初始化模板值
  const initTemplateValues = useMemo(() => {
    return formatInitTemplateValues(initData, templateCategoryOptions);
  }, [initData, templateCategoryOptions]);

  // 判断模板内容是否关闭
  const isCloseTemplate = useMemo(() => {
    return (
      initTemplateValues?.[TemplateKeyenum.templateApp] === false &&
      templateValue?.[TemplateKeyenum.templateApp] === false
    );
  }, [initTemplateValues, templateValue]);

  // 初始化数据表单
  const handleInitModalData = useMemoizedFn(async () => {
    try {
      const res = await getAppBizTypeList();
      const { data } = res || {};
      const list =
        data?.map((item) => {
          const disabled = checkAllPermissionsTrue(
            permissions || [],
            AgentAppPermissionKeyMap[item.value as AgentTypeEnum]?.split(',') || [],
          );
          return {
            label: item?.title,
            value: item?.value,
            disabled: disabled,
          };
        }) || [];
      setBizTypeList(list);
      // 先设置bizType，避免联动问题
      setFieldsValue({ bizType: isTruthyIncludingZero(initData?.bizType) ? initData?.bizType : list?.[0]?.value });
      // 再设置其他数据
      Promise.resolve().then(() => {
        const initTemplateValues = formatInitTemplateValues(initData, templateCategoryOptions);
        setFieldsValue({
          ...initData,
          template: initTemplateValues,
          mode: initData?.mode !== undefined ? initData.mode : AgentModeEnum.autonomous,
        });
        if (initData?.isCopy) {
          validateFields();
        }
      });
    } catch (e) {
      setFieldsValue({ ...initData });
    }
  });

  useEffect(() => {
    if (modalProps?.open) handleInitModalData();
  }, [modalProps?.open]);

  const memoizedBizTypeValue = useMemo(() => {
    return (bizTypeList || []).map((item) => {
      const disabled = checkAllPermissionsTrue(
        permissions || [],
        AgentAppPermissionKeyMap[item.value as AgentTypeEnum]?.split(',') || [],
      );
      return {
        ...item,
        disabled: disabled,
      };
    });
  }, [bizTypeList, permissions]);

  /// 根据应用类型动态配置Agent类型选项
  const customAgentActionConfig: Partial<
    Pick<
      Record<
        AgentTypeEnum,
        { name: string; icon: React.JSXElementConstructor<any>; selectedStyle: Record<string, any> }
      >,
      AgentTypeEnum.self | AgentTypeEnum.thirdParty
    >
  > = useMemo(() => {
    return bizTypeValue === AgentBizTypeEnum.Service
      ? AgentTypeConfig
      : {
          [AgentTypeEnum.self]: AgentTypeConfig[AgentTypeEnum.self],
        };
  }, [bizTypeValue]);

  const memoTitle = useMemo(() => {
    if (initData?.isCopy) {
      return `复制Agent应用`;
    }
    return `${initData ? '编辑' : '创建'}Agent应用`;
  }, [initData]);

  const memoOkButtonDisabled = useMemo(() => {
    // 如果是复制，只要名称为空就禁用
    if (initData?.isCopy) {
      return !nameValue?.trim();
    }
    return (
      (initData &&
        nameValue === initData?.appName &&
        descValue === initData?.appDesc &&
        (initData.type === AgentTypeEnum.self || isEqual(certificationValue, initData.certification)) &&
        (isEqual(initTemplateValues, templateValue) || isCloseTemplate)) ||
      !nameValue?.trim()
    );
  }, [
    initData,
    nameValue,
    descValue,
    selectedAgentType,
    certificationValue,
    initTemplateValues,
    templateValue,
    isCloseTemplate,
  ]);

  return (
    <Modal
      title={memoTitle}
      okText={initData ? '确定' : '创建'}
      onOk={onSave}
      confirmLoading={submitLoading}
      okButtonProps={{
        // 禁用条件：1.未填写Agent名称 2.未修改任何内容
        disabled: memoOkButtonDisabled,
      }}
      destroyOnClose
      maskClosable={false}
      wrapClassName="CreateAppModal"
      width={640}
      bodyStyle={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'scroll' }}
      {...modalProps}
    >
      <Form form={form} preserve={false} layout="vertical">
        <Form.Item name="appId" hidden>
          <></>
        </Form.Item>
        <Form.Item name="isCopy" hidden>
          <></>
        </Form.Item>
        {globalConfig.viewAllAgentsPermission !== 1 ? (
          <Form.Item name="bizType" hidden initialValue={AgentBizTypeEnum.Service}>
            <></>
          </Form.Item>
        ) : (
          <Form.Item label="Agent应用" name={'bizType'}>
            <Select
              disabled={!!initData}
              onChange={(selectKey) => {
                // 切换应用类型时，重置Agent类型为自营应用
                form.setFieldsValue({ type: AgentTypeEnum.self });
              }}
              placeholder="请选择应用类型"
              options={memoizedBizTypeValue}
            ></Select>
          </Form.Item>
        )}
        <Form.Item
          label="Agent类型"
          name="type"
          initialValue={
            !initData && disableCreateConfig?.[AgentTypeEnum.self] ? AgentTypeEnum.thirdParty : AgentTypeEnum.self // 自营应用不可创建则默认选中三方应用
          }
          rules={[{ required: true, message: '请选择工具类型' }]}
        >
          <Row gutter={8}>
            {Object.entries(customAgentActionConfig).map(([type, config]) => {
              const {
                name,
                icon: Icon,
                selectedStyle,
                iconBgColor,
              } = config as typeof config & { iconBgColor?: string };
              const disableCreate = !initData && disableCreateConfig?.[Number(type)];
              const isSelected = selectedAgentType === Number(type);
              const bgColor = iconBgColor || (type === String(AgentTypeEnum.self) ? '#fef5e3' : '#eef3ff');
              return (
                <Col span={12} key={type}>
                  <Card
                    hoverable={!disableCreate && !initData}
                    onClick={() => !disableCreate && handleTypeSelect(Number(type))}
                    style={{
                      ...(isSelected ? selectedStyle : notSelectedCardStyle),
                      ...(initData || disableCreate ? disabledCardStyle : {}),
                      height: 80,
                      cursor: initData || disableCreate ? 'not-allowed' : 'pointer',
                    }}
                    bodyStyle={{
                      padding: '16px 12px',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div tw="flex items-center gap-[8px] flex-1">
                      <div
                        tw="rounded-[8px] p-[10px] flex items-center justify-center"
                        style={{ backgroundColor: bgColor }}
                      >
                        <Icon style={{ fontSize: 24 }} />
                      </div>
                      <span tw="text-[14px] font-medium text-[rgba(0,0,0,0.85)]">{name}</span>
                    </div>
                    <RadioIcon checked={isSelected} />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Form.Item>
        {selectedAgentType !== AgentTypeEnum.thirdParty && (
          <div tw="bg-[#f4f5f7] rounded-[2px] p-[8px 12px 12px] mb-[24px] relative">
            <div
              tw="absolute top-0 left-[16px]"
              style={{
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '10px solid #f4f5f7',
                transform: 'translateY(-100%)',
              }}
            ></div>
            <Form.Item
              label="Agent模式"
              name="mode"
              initialValue={AgentModeEnum.autonomous}
              rules={[{ required: true, message: '请选择Agent模式' }]}
              style={{ marginBottom: 0 }}
            >
              <div style={{ paddingTop: 5 }}>
                <Row gutter={8}>
                  {Object.entries(AgentModeConfig).map(([mode, config]) => {
                    const {
                      name,
                      description,
                      icon: Icon,
                      selectedStyle,
                    } = config as typeof config & { iconBgColor?: string };
                    const isSelected = selectedAgentMode === Number(mode);
                    return (
                      <Col span={12} key={mode}>
                        <Card
                          hoverable={!initData}
                          onClick={() => !initData && handleModeSelect(Number(mode))}
                          style={{
                            ...(isSelected ? selectedStyle : notSelectedCardStyle),
                            ...(initData ? disabledCardStyle : {}),
                            height: 80,
                            cursor: initData ? 'not-allowed' : 'pointer',
                          }}
                          bodyStyle={{
                            padding: '16px 12px',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <div tw="flex items-start gap-[8px] flex-1">
                            <div tw="flex items-center justify-center p-[1px 0]">
                              <Icon style={{ fontSize: 20 }} />
                            </div>
                            <div tw="flex flex-col gap-[2px] flex-1">
                              <span tw="text-[14px] font-medium text-[rgba(0,0,0,0.85)] leading-[22px]">{name}</span>
                              <span tw="text-[12px] text-[rgba(0,0,0,0.45)] leading-[18px]">{description}</span>
                            </div>
                          </div>
                          <RadioIcon checked={isSelected} />
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </Form.Item>
          </div>
        )}
        <Form.Item
          label="Agent名称"
          name="appName"
          rules={[
            { required: true, message: '请输入Agent名称' },
            { pattern: trimPattern, message: '不能以空格开头和结尾' },
            { max: globalConfig.appNameLimit, message: `最多输入${globalConfig.appNameLimit}个字符` },
          ]}
        >
          <Input showCount maxLength={globalConfig.appNameLimit} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Agent描述" name="appDesc">
          <Input.TextArea showCount maxLength={globalConfig.appDescLimit} style={{ width: '100%' }} />
        </Form.Item>
        {selectedAgentType === AgentTypeEnum.thirdParty && (
          <>
            <Form.Item
              label="请求地址"
              name={['certification', 'url']}
              rules={[
                { required: true, message: '请输入' },
                { type: 'url', message: '请输入正确的地址' },
              ]}
              validateFirst={true}
            >
              <Input placeholder="请输入工具地址或资源链接" maxLength={globalConfig?.toolPathLimit} />
            </Form.Item>
            <Form.Item
              label="鉴权方式"
              name={['certification', 'authType']}
              rules={[{ required: true, message: '请选择' }]}
            >
              <EnumSelect optionsConfig={AgentAuthTypeConfig} isNumberValue={false} hasAll={false} />
            </Form.Item>
            <Form.Item
              label="appKey"
              name={['certification', 'appKey']}
              rules={[{ required: true, message: '请输入' }]}
            >
              <Input placeholder="请输入appKey" maxLength={globalConfig?.toolPathLimit} />
            </Form.Item>
            <Form.Item
              label="appSecret"
              name={['certification', 'appSecret']}
              rules={[{ required: true, message: '请输入' }]}
            >
              <Input placeholder="请输入appKey" maxLength={globalConfig?.toolPathLimit} />
            </Form.Item>
            {selectedAgentType === AgentTypeEnum.thirdParty && (
              <Form.Item>
                <Button
                  disabled={
                    !(
                      certificationValue &&
                      certificationValue.url &&
                      certificationValue.authType &&
                      certificationValue.appKey &&
                      certificationValue.appSecret
                    )
                  }
                  onClick={validateThird}
                >
                  接口校验
                </Button>
              </Form.Item>
            )}
          </>
        )}

        {showTemplateSection ? (
          <>
            <span tw={'text-[14px] leading-[22px] text-[14px] mb-[8px] font-medium'}>应用场景</span>
            <Row tw={'flex items-center justify-between m-[8px 0] p-[5px 0]'}>
              <span>云商Agent模板中心</span>
              <Form.Item name={['template', TemplateKeyenum.templateApp]} valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </Row>

            {templateSwitchValue ? (
              <>
                <Row tw={'flex items-center gap-[8px] m-[8px 0 24px 0] p-[5px 0]'}>
                  <Form.Item name={['template', TemplateKeyenum.allowCopy]} valuePropName="checked" noStyle>
                    <Checkbox />
                  </Form.Item>
                  <span>一键复制</span>
                </Row>
                <>
                  <Form.Item
                    name={['template', TemplateKeyenum.logoUrl]}
                    label={'头像'}
                    initialValue={DEAULT_LOGO_URL_LIST[0]}
                  >
                    <PicUpload />
                  </Form.Item>
                </>

                <Form.Item
                  label={'分类'}
                  name={['template', TemplateKeyenum.templateCategoryId]}
                  initialValue={templateCategoryOptions?.[0]?.value}
                >
                  <Select
                    options={templateCategoryOptions}
                    getPopupContainer={(node) => node?.parentNode}
                    listHeight={300}
                  />
                </Form.Item>
                <Form.Item
                  label={'标签'}
                  name={['template', TemplateKeyenum.templateTagList]}
                  rules={[{ required: true, message: '请至少添加一个标签' }]}
                >
                  <TemplateTag />
                </Form.Item>
                <>
                  <Form.Item
                    name={['template', TemplateKeyenum.templateAccessUrl]}
                    label={'访客体验url'}
                    rules={[
                      { required: true, message: '请输入访客体验url' },
                      { type: 'url', message: '请输入正确的url地址' },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </>
                <>
                  <div tw={'text-[14px] leading-[22px] mb-[8px]'}>测试问法示例</div>
                  <Form.Item name={['template', TemplateKeyenum.sampleQueries]}>
                    <RichTextEditor />
                  </Form.Item>
                </>
              </>
            ) : null}
          </>
        ) : null}
      </Form>
    </Modal>
  );
};
export default CreateAppModal;
