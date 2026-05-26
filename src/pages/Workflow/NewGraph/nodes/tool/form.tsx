import React, { useEffect, useState } from 'react';
import type { InputParamsType, OutputParamsType } from '@form';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Xss } from '@ysf/helper';
import { FormField, FormFragmentFieldWrapper } from '@form';
import FixedParamsInput from '../../form-components/fixed-params-input';
import TreeDataShower from '@/components/TreeDataShower';
import { useNodeRenderContext } from '../../hooks';
import { useWatchFormValues } from '@flowgram.ai/free-layout-editor';
import { Select } from 'antd';
import type { ToolNS } from '@/types/Tools';
import FormFragment from '../../components/form-fragment';
import { getToolDetail } from '@/api';
import { SimpleParamTypeEnum } from '../../constants';
import { useMemoizedFn } from 'ahooks';

export type ToolFormData = {
  inputParam: InputParamsType[];
  outputParam: OutputParamsType[];
  toolboxId: string;
  toolId: string;
};

const FormContent = () => {
  const { node, form } = useNodeRenderContext();
  const formData = useWatchFormValues(node);
  const [toolDetail, setToolDetail] = useState<ToolNS.ToolType>();
  const { isTemplateTool, templateToolVo } = formData;
  const { templateList = [], title, templateTips } = toolDetail || {};

  useEffect(() => {
    getToolDetail({ toolId: formData.toolId, toolboxId: formData.toolboxId }).then((res) => {
      setToolDetail(res.data);
    });
  }, [formData.toolboxId, formData.toolId]);

  const onTemplateChange = useMemoizedFn((value: string, onChange: (templateVo?: ToolNS.TemplateItemType) => void) => {
    const _templateVo = templateList.find((item) => item.templateId === value);
    form?.setValueIn(
      'inputParam',
      _templateVo?.paramList?.map((item) => ({
        name: item.name,
        type: item.type,
        required: item.required,
        valueType: SimpleParamTypeEnum.quote,
      })),
    );
    onChange(_templateVo);
  });

  return (
    <>
      <FormFragment title="输入" desc="输入参数">
        {isTemplateTool ? (
          <div tw="pt-4">
            <FormField name="isTemplateTool">{() => <></>}</FormField>
            <FormField<ToolNS.TemplateItemType> name="templateToolVo">
              {({ onChange, value }) => (
                <>
                  <div>
                    {title}
                    <span tw="text-red-500 ml-1">*</span>
                  </div>
                  <Select
                    value={value?.templateId}
                    options={templateList?.map((item) => ({ label: item.templateName, value: item.templateId })) || []}
                    onChange={(value) => onTemplateChange(value, onChange)}
                  />
                  {templateTips && (
                    <div tw="text-tip mt-1">
                      <ExclamationCircleOutlined tw="text-tip mr-1" />
                      <span dangerouslySetInnerHTML={{ __html: Xss.filterXss(templateTips) }} />
                    </div>
                  )}
                </>
              )}
            </FormField>
          </div>
        ) : null}
        {!isTemplateTool || templateToolVo?.paramList.length ? (
          <>
            {!!isTemplateTool && <div tw="h-[1px] bg-[rgba(0, 0, 0, 0.06)] mt-[20px]" />}
            <FixedParamsInput needFragWrap={false} showDesc={!isTemplateTool} />
          </>
        ) : null}
      </FormFragment>
      <FormFragmentFieldWrapper<ToolFormData['outputParam']> name="outputParam" title="输出">
        {({ value }) => <TreeDataShower treeData={value} />}
      </FormFragmentFieldWrapper>
    </>
  );
};

export default FormContent;
