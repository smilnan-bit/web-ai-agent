import React, { useCallback, useEffect, useMemo } from 'react';
import { IconJiantoukaozuo } from '@/pages/Workflow/NewGraph/nodes/icons';
import { useRouter } from '@ysf/ys-router';
import './try.less';
import { Alert, Form, Input, message, Modal, Tooltip } from 'antd';
import { useRecoilValue } from 'recoil';
import { useMemoizedFn, useRequest } from 'ahooks';
import { GlobalConfigState } from '@/model';
import { trimPattern } from '@/constants';
import { copyTemplateAgent, getAgentDetail } from '@/api/template';
import { AuthTypeLabelMap } from '@/pages/AppList/components/CreateAppModal/constanst';
import { timestamp2date, useQueryLocationSearch } from '@/utils';
import { InfoCircleFilled } from '@ant-design/icons';

const Try: React.FC = () => {
  const [currentAgentDetail, setCurrentAgentDetail] = React.useState<any>(null);
  const globalConfig = useRecoilValue(GlobalConfigState);

  const { run, loading } = useRequest(copyTemplateAgent, {
    manual: true,
    onSuccess: (res) => {
      const { data } = res || {};
      const { result, appId } = data || {};
      if (!result) return;
      message.success('复制成功');
      navigate(routesMap.appEdit.path, { query: { appId } });
      setOpen(false);
    },
    onError: (e) => {},
  });

  const { appId } = useQueryLocationSearch();

  const { navigate, routesMap } = useRouter();
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  const showCopyAlert = useMemo(() => {
    const hasKnowledge = (currentAgentDetail?.knowledgeNameList || []).length > 0;
    const hasToolbox = (currentAgentDetail?.toolboxList || []).length > 0;
    return hasKnowledge || hasToolbox;
  }, [currentAgentDetail]);

  const handleCopy = useCallback((currentAgentDetail) => {
    setOpen(true);
    form.setFieldsValue({
      appName: `${currentAgentDetail?.appName || ''}_${timestamp2date(Date.now(), 'yyyyMMddHHmmss')}`,
      appDesc: currentAgentDetail?.appDesc || '',
    });
    Promise.resolve().then(() => {
      form.validateFields();
    });
  }, []);

  const handleSaveCopy = useMemoizedFn(() => {
    form
      .validateFields()
      .then((values) => {
        if (!showCopyAlert) {
          run({ copyAppId: currentAgentDetail?.appId, appName: values.appName, appDesc: values.appDesc });
        } else {
          setOpen(false);
          Modal.confirm({
            width: 420,
            title: '请注意',
            className: 'template-try-copy-alert-modal',
            content: (
              <AlertItem
                withTitle={false}
                knowledgeNameList={currentAgentDetail?.knowledgeNameList || []}
                toolboxList={currentAgentDetail?.toolboxList || []}
              />
            ),
            onOk: () => {
              run({ copyAppId: currentAgentDetail?.appId, appName: values.appName, appDesc: values.appDesc });
            },
            onCancel: () => {},
          });
        }
      })
      .catch((err) => {});
  });

  const AlertItem = useMemoizedFn(({ knowledgeNameList, toolboxList, withTitle = true }) => {
    const showKnowledge = (knowledgeNameList || []).length > 0;
    const showToolbox = (toolboxList || []).length > 0;
    return (
      <div>
        {withTitle ? (
          <div tw={'flex items-center '}>
            <InfoCircleFilled className={'ant-alert-icon'} />
            <span tw={'text-[14px] leading-[22px] text-[#000000D9]'}>请注意</span>
          </div>
        ) : null}

        {showKnowledge ? (
          <>
            <p tw={'text-[14px] leading-[22px] text-[#00000073] mb-[8px] mt-[2px]'}>
              当前模板存在不可复制的知识，请在复制完成后，前往新版知识库上传企业知识，并在“Agent-知识库”中进行关联。
            </p>
            {(knowledgeNameList || []).map((name: string) => (
              <div tw={'flex'} key={name}>
                <span tw={'text-[14px] text-[#00000073] mr-[2px]'}>-</span>
                <p tw={'mb-[0] text-[14px] text-[#00000073]'}>
                  知识空间名称：<span>{name}</span>
                </p>
              </div>
            ))}
          </>
        ) : null}
        {showToolbox ? (
          <>
            {' '}
            <p tw={'text-[14px] text-[#00000073] mb-[8px] mt-[2px]'}>
              当前模板存在API工具，请在复制完成后，前往“Agent-工具”找到下列工具组，并完善工具组鉴权信息。
            </p>
            {(toolboxList || []).map((tool: { name: string; authType: string }) => (
              <div tw={'flex'} key={tool.name}>
                <span tw={'text-[14px] text-[#00000073] mr-[2px]'}>-</span>
                <p tw={'mb-[0] text-[14px] text-[#00000073]'}>
                  工具组名称：<span>{tool.name}</span>，鉴权方式：
                  <span>{tool.authType === 'none' ? '无鉴权' : AuthTypeLabelMap[tool.authType]}</span>
                </p>
              </div>
            ))}
          </>
        ) : null}
      </div>
    );
  });

  const isFormValid = useMemo(() => {
    const currentValues = form.getFieldsValue();

    // 1. 检查必填字段
    const requiredFields = ['appName'];
    const hasAllRequired = requiredFields.every((field) => {
      const value = currentValues[field];
      return value && value.toString().trim() !== '';
    });

    if (!hasAllRequired) return false;

    // 2. 简单的客户端验证规则
    const name = currentValues.appName;
    const desc = currentValues.appDesc;

    // 姓名长度检查
    if (name && name.length > globalConfig?.appNameLimit) return false;

    // 简单邮箱格式检查
    if (desc && desc.length > globalConfig?.appDescLimit) return false;

    return true;
  }, [values, form]);

  useEffect(() => {
    getAgentDetail({ appId: appId })
      .then((res) => {
        const { data } = res || {};
        if (data) {
          setCurrentAgentDetail(data);
        }
      })
      .catch((err) => {
        console.log('err===', err);
      });
  }, []);

  if (!currentAgentDetail) {
    return null;
  }
  return (
    <>
      <div tw={'p-[16px 0] h-full w-full'}>
        <div tw={'flex h-full'}>
          <div tw={'flex-[0 0 48px] mr-[16px] '}>
            <span tw={'inline-flex items-center cursor-pointer '} onClick={() => navigate(routesMap.template.path)}>
              <IconJiantoukaozuo size={16} tw={'mr-[4px]'} color={'#00000073'} />
              <span tw={'text-[#00000073] text-[14px] leading-[22px] font-semibold'}>返回</span>
            </span>
          </div>
          <div tw={'flex h-full gap-[12px]'} className={'template-try-container'}>
            <iframe className={'template-try-iframe'} src={currentAgentDetail?.templateAccessUrl} />
            <div className={'template-try-opertare'}>
              <div
                tw={'min-w-0 pb-[20px] '}
                style={{ borderBottom: '1px solid #0000000F' }}
                key={currentAgentDetail?.appId}
              >
                <div tw={'flex min-w-0'}>
                  <img
                    src={currentAgentDetail?.logoUrl}
                    tw={'w-[64px] h-[64px] mr-[12px] rounded-[10px] border-[1px] border-[#EBEBF5] border-solid'}
                  />
                  <div tw={'flex-1 min-w-0'}>
                    <div tw={'mb-[0] flex justify-between items-center leading-[25px] gap-[20px]'}>
                      <Tooltip placement="topLeft" title={currentAgentDetail?.appName}>
                        <span tw={'text-[#000000D9] font-medium text-[18px] truncate flex-1 min-w-0'}>
                          {currentAgentDetail?.appName}
                        </span>
                      </Tooltip>
                    </div>
                    <div tw={'mb-[0]'}>
                      <Tooltip placement="top" title={currentAgentDetail?.templateTagList?.join(', ')}>
                        <div tw={'flex flex-wrap overflow-hidden min-w-0'} style={{ maxHeight: '26px' }}>
                          {(currentAgentDetail?.templateTagList || []).map((tag: string) => (
                            <span
                              key={tag}
                              tw={
                                'p-[0px 8px] bg-[#F2F2F2] leading-[20px] rounded-[4px] mt-[6px] inline-block text-[#00000073] text-[12px] mr-[4px]'
                              }
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>

              <Tooltip
                placement="leftTop"
                title={currentAgentDetail?.appDesc}
                getPopupContainer={(triggerNode) => triggerNode?.parentElement as HTMLElement}
                arrowPointAtCenter={true}
              >
                <p
                  tw={
                    'mt-[20px] mb-[20px] line-clamp-2 overflow-hidden overflow-ellipsis text-[#00000073] text-[14px] leading-[1.5]'
                  }
                >
                  {currentAgentDetail?.appDesc}
                </p>
              </Tooltip>

              <>
                {currentAgentDetail?.sampleQueries ? (
                  <p tw={'text-[16px] text-[#000000D9] font-medium mb-[8px]'}>测试问法示例</p>
                ) : null}
                <div tw={'h-[calc(100%-260px)] overflow-x-hidden overflow-y-auto w-full text-wrap'}>
                  <div dangerouslySetInnerHTML={{ __html: currentAgentDetail?.sampleQueries || '' }}></div>
                </div>
              </>

              {currentAgentDetail?.allowCopy ? (
                <div
                  tw={
                    'absolute bottom-[0] left-[0] w-full  text-center h-[44px] leading-[44px] bg-[#EBFAF3] text-[#0ABF65] rounded-b-[7px] cursor-pointer'
                  }
                  onClick={() => handleCopy(currentAgentDetail)}
                >
                  免费复制
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {open ? (
        <Modal
          open={open}
          title={'复制'}
          width={520}
          onCancel={() => setOpen(false)}
          onOk={handleSaveCopy}
          confirmLoading={loading}
          className={'template-try-copy-modal'}
          okButtonProps={{
            disabled: !isFormValid, // 根据表单验证状态禁用按钮
          }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name={'appName'}
              label={'Agent名称'}
              required
              rules={[
                { required: true, message: '请输入Agent名称' },
                { pattern: trimPattern, message: '不能以空格开头和结尾' },
                { max: globalConfig.appNameLimit, message: `最多输入${globalConfig?.appNameLimit}个字符` },
              ]}
            >
              <Input
                showCount
                maxLength={globalConfig.appNameLimit}
                placeholder={'请输入Agent名称'}
                autoComplete="off"
              />
            </Form.Item>
            <Form.Item name={'appDesc'} label={'Agent描述'}>
              <Input.TextArea showCount maxLength={globalConfig?.appDescLimit} placeholder={'请输入Agent描述'} />
            </Form.Item>

            {showCopyAlert ? (
              <Alert
                closable={false}
                message={
                  <AlertItem
                    knowledgeNameList={currentAgentDetail?.knowledgeNameList || []}
                    toolboxList={currentAgentDetail?.toolboxList || []}
                  />
                }
                type="warning"
                tw={'mt-[30px]'}
              />
            ) : null}
          </Form>
        </Modal>
      ) : null}
    </>
  );
};

export default Try;
