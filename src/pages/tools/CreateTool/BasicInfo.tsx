import React, { useCallback, useEffect } from 'react';
import { Form, Input, Radio, Tooltip } from 'antd';
import { useRecoilState, useRecoilValue } from 'recoil';
import Ellipsis from '@ysf/ellipsis';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { createTool, updateTool } from '@/api';
import {
  ToolNameValidator,
  ToolRequestMethodEnum,
  ToolboxTypeEnum,
  ToolboxTypeNumEnum,
  formItemLayout2,
  TypeToolUseCaseEunm,
  ThesaurusMatchModeEnum,
  ThesaurusMatchModeConfig,
} from '@/constants';
import EnumSelect from '@/components/EnumSelect';
import { CurrentToolBoxState, GlobalConfigState } from '@/model';
import { CurrentToolState } from './model';
import Actions from './Actions';
import { useInitPageData } from './utils';

const BasicInfo = () => {
  const [form] = Form.useForm();
  const [currentTool, setCurrentTool] = useRecoilState(CurrentToolState);
  const currentToolBox = useRecoilValue(CurrentToolBoxState);
  const globalConfig = useRecoilValue(GlobalConfigState) || {};

  const { toolboxId, toolboxType, toolUseCase } = useInitPageData();
  const { toolId } = currentTool || {};
  const isApi = toolboxType === ToolboxTypeEnum.custom;
  const toolType = toolboxType ? ToolboxTypeNumEnum[toolboxType] : undefined;
  const useCaseVal = isApi ? undefined : Number(toolUseCase);

  const validateData = useCallback(async () => {
    const values = await form.validateFields();
    const { data: createResData = {} } = toolId ? await updateTool(values) : await createTool(values);
    setCurrentTool((pre) => ({ ...(pre || {}), ...values, ...(toolId ? {} : createResData) }));
  }, [form, setCurrentTool, toolId]);

  useEffect(() => {
    currentTool
      ? form.setFieldsValue({
          ...currentTool,
          toolboxId,
          toolType,
          toolUseCase: useCaseVal,
        })
      : form.setFieldsValue({ toolboxId, toolType, toolUseCase: useCaseVal });
  }, [currentTool, form, toolboxId, toolType, useCaseVal]);

  return (
    <div className="BasicInfo">
      <Form form={form} style={{ width: 800, margin: '34px auto 0' }} {...formItemLayout2}>
        <Form.Item name="toolboxId" noStyle>
          <></>
        </Form.Item>
        <Form.Item name="toolId" noStyle>
          <></>
        </Form.Item>
        <Form.Item name="toolType" noStyle>
          <></>
        </Form.Item>
        <Form.Item name="toolUseCase" noStyle>
          <></>
        </Form.Item>
        <Form.Item label="工具名称" name="name" rules={[{ required: true, message: '请输入' }, ToolNameValidator]}>
          <Input maxLength={globalConfig?.toolNameLimit} placeholder="请输入工具名称，确保含义清晰、无歧义、易理解" />
        </Form.Item>
        <Form.Item label="工具描述" name="desc" rules={[{ required: true, message: '请输入' }]}>
          <Input.TextArea
            maxLength={globalConfig?.toolDescLimit}
            placeholder="请输入工具的主要功能和使用场景，确保含义清晰、无歧义、易理解"
          />
        </Form.Item>
        {/* 小模型工具的标准词相似词类型需要显示匹配模式 */}
        {!isApi && Number(toolUseCase) === TypeToolUseCaseEunm.similar ? (
          <Form.Item
            label="匹配模式"
            name="thesaurusMatchMode"
            initialValue={ThesaurusMatchModeEnum.similar}
            rules={[{ required: true, message: '请选择' }]}
          >
            <Radio.Group>
              <Radio value={ThesaurusMatchModeEnum.similar}>
                {ThesaurusMatchModeConfig[ThesaurusMatchModeEnum.similar].label}
                <Tooltip title={ThesaurusMatchModeConfig[ThesaurusMatchModeEnum.similar].tooltip}>
                  <QuestionCircleOutlined style={{ marginLeft: 8, color: '#00000073' }} />
                </Tooltip>
              </Radio>
              <Radio value={ThesaurusMatchModeEnum.exact}>
                {ThesaurusMatchModeConfig[ThesaurusMatchModeEnum.exact].label}
                <Tooltip title={ThesaurusMatchModeConfig[ThesaurusMatchModeEnum.exact].tooltip}>
                  <QuestionCircleOutlined style={{ marginLeft: 8, color: '#00000073' }} />
                </Tooltip>
              </Radio>
            </Radio.Group>
          </Form.Item>
        ) : null}
        {isApi ? (
          <>
            <Form.Item
              label="工具路径"
              tooltip="若工具中包含path参数，请在url中用大括号声明参数位置。如：'/api/{param}'"
              name="path"
              rules={[{ required: true, message: '请输入' }]}
            >
              <Input
                addonBefore={
                  <Ellipsis width={240} style={{ verticalAlign: 'bottom' }} tooltipProps={{ mouseEnterDelay: 1 }}>
                    {currentToolBox?.url}
                  </Ellipsis>
                }
                placeholder="请输入工具地址或资源链接"
                maxLength={globalConfig?.toolPathLimit}
              />
            </Form.Item>
            <Form.Item label="请求方法" name="method" rules={[{ required: true, message: '请选择' }]}>
              <EnumSelect optionsConfig={ToolRequestMethodEnum} isNumberEnum={true} hasAll={false} />
            </Form.Item>
          </>
        ) : null}
      </Form>
      <Actions validateData={validateData} />
    </div>
  );
};
export default BasicInfo;
