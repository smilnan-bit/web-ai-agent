import React, { useCallback, useEffect, useState } from 'react';
import type { ModalProps } from 'antd';
import { Card, Col, Form, Input, Modal, Row } from 'antd';
import { useRecoilValue } from 'recoil';
import { GlobalConfigState } from '@/model';
import { saveToolbox } from '@/api';
import EnumSelect from '@/components/EnumSelect';
import { AuthTypeConfig, AuthTypeEnum, ToolboxTypeEnum, httpsUrlPattern, trimPattern } from '@/constants';
import type { ToolNS } from '@/types/Tools';
import HeaderTable from './HeaderTable';
import './index.less';

const selectedStyle = {
  height: '100%',
  border: '1px solid #4096ff',
  backgroundColor: '#ecf2fe',
};

const notSelectedStyle = {
  height: '100%',
  border: '1px solid #d9d9d9',
  backgroundColor: '#fff',
};

const disabledStyle = {
  backgroundColor: '#f5f5f5',
  cursor: 'not-allowed',
};

const CreateToolbox: React.FC<
  { initData?: ToolNS.ToolBoxType } & Overwrite<
    ModalProps,
    { onOk: (toolboxId: string | number, selectedType: ToolboxTypeEnum) => void }
  >
> = ({ initData, onOk, ...modalProps }) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const globalConfig = useRecoilValue(GlobalConfigState);
  const { setFieldsValue, resetFields, validateFields } = form;

  const authTypeValue = Form.useWatch(['certification', 'authType'], form);

  const [selectedType, setSelectedType] = useState<ToolboxTypeEnum>();

  // 选择工具类型
  const handleTypeSelect = (type: ToolboxTypeEnum) => {
    if (initData) {
      return;
    }
    setSelectedType(type);
    form.setFieldsValue({ toolboxType: type });
  };

  const onSubmit = useCallback(async () => {
    try {
      setConfirmLoading(true);
      const values = await validateFields();
      const {
        data: { toolboxId: createToolBoxId },
      } = await saveToolbox(values);
      onOk?.(createToolBoxId || initData?.toolboxId, selectedType);
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmLoading(false);
    }
  }, [initData?.toolboxId, onOk, validateFields, selectedType]);

  useEffect(() => {
    if (modalProps.open) {
      if (initData) {
        setFieldsValue(initData);
        setSelectedType(initData?.type);
      } else {
        setSelectedType(ToolboxTypeEnum.custom);
        resetFields();
      }
    }
  }, [initData, modalProps.open, resetFields, setFieldsValue]);

  return (
    <Modal
      title={initData ? '编辑工具组' : '创建工具组'}
      onOk={onSubmit}
      confirmLoading={confirmLoading}
      destroyOnClose
      maskClosable={false}
      bodyStyle={{ height: 'calc(100vh - 308px)', overflowY: 'auto' }}
      {...modalProps}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item name="toolboxId" noStyle>
          <></>
        </Form.Item>
        <Form.Item
          label="工具组名称"
          name="name"
          rules={[
            { required: true, message: '请输入' },
            { pattern: trimPattern, message: '不能以空格开头和结尾' },
          ]}
        >
          <Input maxLength={globalConfig.toolboxNameLimit} placeholder="请输入工具名称，确保含义清晰" />
        </Form.Item>
        <Form.Item label="工具组描述" name="desc" rules={[{ required: true, message: '请输入' }]}>
          <Input.TextArea
            maxLength={globalConfig.toolboxDescLimit}
            placeholder="请输入工具的主要功能和使用场景，帮助大模型更好的理解工具能力"
          />
        </Form.Item>

        <Form.Item
          label="工具组工具类型"
          name="toolboxType"
          initialValue={selectedType}
          rules={[{ required: true, message: '请选择工具类型' }]}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Card
                hoverable
                onClick={() => handleTypeSelect(ToolboxTypeEnum.custom)}
                style={{
                  ...(selectedType === ToolboxTypeEnum.custom ? selectedStyle : notSelectedStyle),
                  ...(initData ? disabledStyle : {}),
                }}
              >
                <Card.Meta
                  title={<div style={{ textAlign: 'left' }}>API工具</div>}
                  description="调用该工具可实现和第三方接口的对接，从而获取必要返参信息"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card
                hoverable
                onClick={() => handleTypeSelect(ToolboxTypeEnum.modelTool)}
                style={{
                  ...(selectedType === ToolboxTypeEnum.modelTool ? selectedStyle : notSelectedStyle),
                  ...(initData ? disabledStyle : {}),
                }}
              >
                <Card.Meta
                  title={<div style={{ textAlign: 'left' }}>小模型工具</div>}
                  description="调用该小模型工具，可用于意图匹配、相似词匹配等场景"
                />
              </Card>
            </Col>
          </Row>
        </Form.Item>

        {selectedType === ToolboxTypeEnum.custom ? (
          <>
            <Form.Item
              label="工具组URL"
              name="url"
              validateFirst={true}
              rules={[
                { required: true, message: '请输入' },
                { type: 'url', message: '请输入正确的URL' },
              ]}
            >
              <Input placeholder="请输入工具地址或资源链接" maxLength={globalConfig.toolboxUrlLimit} />
            </Form.Item>
            <HeaderTable />
            <Form.Item
              label="授权方式"
              name={['certification', 'authType']}
              style={{ marginTop: 16 }}
              rules={[{ required: true, message: '请选择' }]}
            >
              <EnumSelect optionsConfig={AuthTypeConfig} isNumberValue={false} hasAll={false} hasSortValue={true} />
            </Form.Item>
            {[AuthTypeEnum.qiyu, AuthTypeEnum.service, AuthTypeEnum.qiyubot].includes(authTypeValue) && (
              <>
                <Form.Item
                  label={authTypeValue === AuthTypeEnum.qiyubot ? 'AppID' : 'AppKey'}
                  name={['certification', 'appKey']}
                  required
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <Input maxLength={globalConfig.toolboxAppKeyLimit} />
                </Form.Item>
                <Form.Item
                  label="AppSecret"
                  name={['certification', 'secretKey']}
                  required
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <Input maxLength={globalConfig.toolboxSecretKeyLimit} />
                </Form.Item>
              </>
            )}
          </>
        ) : null}
        {AuthTypeEnum.qiyubot === authTypeValue && (
          <Form.Item
            label="工具组tokenUrl"
            name={['certification', 'tokenUrl']}
            validateFirst={true}
            rules={[{ type: 'url', message: '请输入正确的URL' }]}
          >
            <Input placeholder="请输入工具组tokenUrl" maxLength={globalConfig.toolboxUrlLimit} />
          </Form.Item>
        )}

        {/* {selectedType === '小模型工具' ? (
          <Form.Item
            label="应用场景"
            name={['certification', 'appKey']}
            required
            rules={[{ required: true, message: '请输入' }]}
          >
            <Input maxLength={globalConfig.toolboxAppKeyLimit} />
          </Form.Item>
        ) : null} */}
      </Form>
    </Modal>
  );
};

export default CreateToolbox;
