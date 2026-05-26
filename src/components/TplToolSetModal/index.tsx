import { getToolDetail } from '@/api';
import { useMemoizedFn, useRequest } from 'ahooks';
import { message, Modal, type ModalProps, Select } from 'antd';
import { Xss } from '@ysf/helper';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import type { ToolNS } from '@/types/Tools';
import TreeDataShower from '@/components/TreeDataShower';
import { ToolParamsTypeEnum } from '@/constants';
import { VARIABLE_TYPE_ARRAY_ICON, VARIABLE_TYPE_ICON } from '@/constants';
import type { AppsNS } from '@/types/Apps';

const ParamsTable = ({ params }: { params: ToolNS.TemplateParamType[] }) => {
  return (
    <div tw="bg-back rounded-[2px] py-[12px] px-[16px] flex flex-col gap-2">
      <div tw="flex">
        <div tw="flex-1">字段名称</div>
        <div tw="w-[64px] text-center">必填</div>
        <div tw="flex-1">变量名称</div>
        <div tw="w-[64px] text-center">变量类型</div>
      </div>
      {params.map((item) => (
        <div key={item.id} tw="flex">
          <div tw="flex-1">{item.name}</div>
          <div tw="w-[64px] text-center">{item.required ? '是' : '否'}</div>
          <div tw="flex-1">{item.typeName}</div>
          <div tw="w-[64px] flex items-center justify-center">
            {item.type === ToolParamsTypeEnum.array
              ? VARIABLE_TYPE_ARRAY_ICON[ToolParamsTypeEnum.string]
              : VARIABLE_TYPE_ICON[item.type || ToolParamsTypeEnum.string]}
          </div>
        </div>
      ))}
    </div>
  );
};

const TplToolSetModal: React.FC<
  {
    initData?: AppsNS.ToolType & { templateToolVo?: ToolNS.TemplateItemType };
    onSave: (data: AppsNS.ToolType & { templateToolVo?: ToolNS.TemplateItemType }) => void;
  } & ModalProps
> = ({ initData, onSave, ...modalProps }) => {
  const [selectTemplateId, setSelectTemplateId] = useState<string>();
  const { data } = useRequest(
    () => getToolDetail({ toolId: initData?.toolId as number, toolboxId: initData?.toolboxId as number }),
    {
      ready: !!initData?.toolId && !!initData?.toolboxId,
      refreshDeps: [initData?.toolId, initData?.toolboxId],
    },
  );
  const { templateList = [], title, header, templateTips, responseParams = [] } = data?.data || {};

  const selectTemplate = useMemo(() => {
    return templateList?.find((item) => item.templateId === selectTemplateId);
  }, [templateList, selectTemplateId]);

  const onSubmit = useMemoizedFn(() => {
    if (!selectTemplate) {
      message.error(`请选择${title}`);
      return;
    }
    onSave({
      ...(initData as AppsNS.ToolType),
      cardConfig: { ...(initData?.cardConfig || {}), templateToolVo: selectTemplate },
    });
  });

  useEffect(() => {
    if (initData?.cardConfig?.templateToolVo) {
      setSelectTemplateId(initData?.cardConfig?.templateToolVo?.templateId);
    } else {
      setSelectTemplateId(undefined);
    }
  }, [initData]);

  return (
    <Modal
      title={`${initData?.cardConfig?.templateToolVo ? '编辑' : '创建'}${header || ''}`}
      onOk={onSubmit}
      {...modalProps}
    >
      <div tw="max-h-[500px] overflow-y-auto flex flex-col gap-2">
        <div>
          <div tw="mb-1">
            <span tw="text-red-500 mr-1">*</span>
            <span tw="font-bold">{title}</span>
          </div>
          <Select
            tw="w-full"
            value={selectTemplateId}
            options={templateList?.map((item) => ({ label: item.templateName, value: item.templateId })) || []}
            onChange={(value) => {
              setSelectTemplateId(value);
            }}
          />
          {templateTips && (
            <div tw="text-tip mt-1">
              <ExclamationCircleOutlined tw="text-tip mr-1" />
              <span dangerouslySetInnerHTML={{ __html: Xss.filterXss(templateTips) }} />
            </div>
          )}
        </div>
        {selectTemplateId && (
          <>
            <div>
              <div tw="font-bold mb-1">输入参数：</div>
              <ParamsTable params={selectTemplate?.paramList || []} />
            </div>
            <div>
              <div tw="font-bold mb-1">输出参数：</div>
              <TreeDataShower treeData={responseParams} style={{ background: 'transparent' }} />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default TplToolSetModal;
