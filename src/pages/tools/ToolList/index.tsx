import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Badge, Button, Divider, Empty, Modal, Radio, Spin, Switch, Tag, Typography, message } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useRouter } from '@ysf/ys-router';
import Ellipsis from '@ysf/ellipsis';
import { formatDate } from '@/utils';
import { Bianji, IconXiangsici, IconYitu, Shanchu } from '@/assets/icons';
import type { TableChangeInterface, TableResInterface } from '@/components/RequestTable';
import RequestTable from '@/components/RequestTable';
import Breadcrumbs from '@/components/Breadcrumbs';
import { CurrentToolBoxState, GlobalConfigState } from '@/model';
import { useQueryLocationSearch } from '@/utils/other';
import { deleteTool, getToolList, getToolboxDetail, updateTool } from '@/api';
import type { ToolNS } from '@/types/Tools';
import ContentWrapper from '@/components/ContenWrapper';
import { ToolboxTypeEnum, TypeToolUseCaseEunm } from '@/constants';
import CreateToolbox from '../CreateToolbox';
import ToolboxIcon from '../ToolboxIcon';

const { Text, Paragraph } = Typography;

const ToolList: React.FC = () => {
  const { navigate, routesMap } = useRouter();
  const { toolboxId, toolboxType } = useQueryLocationSearch();
  const isModelTool = toolboxType === ToolboxTypeEnum.modelTool;
  const [currentToolBox, setCurrentToolBox] = useRecoilState(CurrentToolBoxState);
  const { name, desc } = currentToolBox || {};
  const [createToolBoxVis, setCreateToolBoxVis] = useState(false);
  const globalConfig = useRecoilValue(GlobalConfigState);
  const [detailError, setDetailError] = useState();

  const [toolUseCase, setToolUseCase] = useState<number>(TypeToolUseCaseEunm.intent);
  const [creatModelToolBoxVisable, setCreatModelToolBoxVisable] = useState(false);

  const tableChangeRef = useRef<TableChangeInterface>();
  const [tableRes, setTableRes] = useState<Pick<TableResInterface<ToolNS.ToolType>, 'data'>>();
  const {
    data: { list, total },
  } = tableRes || { data: {} };

  const onDelete = useCallback(
    ({ toolId }) => {
      Modal.confirm({
        title: '确认删除该工具吗？',
        okType: 'danger',
        onOk: () => {
          deleteTool({ toolId, toolboxId }).then(() => {
            message.success('删除成功');
            tableChangeRef.current?.({ queryLastPage: list?.length === 1 && total !== 1 });
          });
        },
      });
    },
    [list?.length, toolboxId, total],
  );

  const createTool = useCallback(
    (data: { toolId?: number; isDebug?: boolean; isEdit?: boolean } = {}) => {
      const { toolId, isDebug, isEdit = false } = data;
      if (isModelTool && !isEdit && !isDebug) {
        setCreatModelToolBoxVisable(true);
      } else {
        navigate(routesMap.toolEdit.path, { query: { toolId, toolboxId, isDebug, toolboxType } });
      }
    },
    [navigate, routesMap.toolEdit.path, toolboxId, isModelTool, toolboxType],
  );

  const updateStatus = useCallback(
    (val, toolId) => {
      updateTool({ toolboxId, toolId, enabled: val }).then(() => {
        tableChangeRef.current?.({});
      });
    },
    [toolboxId],
  );

  const getToolBoxDetail = useCallback(() => {
    toolboxId &&
      getToolboxDetail({ toolboxId })
        .then(({ data }) => {
          setCurrentToolBox(data);
        })
        .catch((err) => {
          setDetailError(err);
        });
  }, [setCurrentToolBox, toolboxId]);

  const onCreateBox = useCallback(
    (id, type) => {
      console.log('type', type);
      setCreateToolBoxVis(false);
      getToolBoxDetail();
    },
    [getToolBoxDetail],
  );

  const handleOk = () => {
    setCreatModelToolBoxVisable(false);
    navigate(routesMap.toolEdit.path, { query: { toolboxId, toolboxType, toolUseCase } });
  };

  // 小模型选择改变
  const onModelRadioChange = (e: any) => {
    setToolUseCase(e.target.value);
  };

  useEffect(() => {
    getToolBoxDetail();
    return () => {
      setDetailError(undefined);
    };
  }, [getToolBoxDetail, setCurrentToolBox, toolboxId]);

  const columns = [
    {
      title: '工具',
      dataIndex: 'name',
      width: '25%',
      render: (val, { desc, toolUseCase }) => (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {!!isModelTool && (
            <div
              style={{
                borderRadius: 6,
                border: '1px solid rgba(0, 0, 0, 0.10)',
                display: 'inline-flex',
                alignItems: 'center',
                minWidth: 36,
                height: 36,
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              {toolUseCase === TypeToolUseCaseEunm.intent ? (
                <IconYitu size={20} color="#5555F2" />
              ) : (
                <IconXiangsici size={20} color="#0BAFE5" />
              )}
            </div>
          )}
          <div style={{ display: 'inline-block' }}>
            <Ellipsis lines={1} tooltipProps={{ mouseEnterDelay: 1 }}>
              <div>{val}</div>
            </Ellipsis>
            <Ellipsis lines={1} tooltipProps={{ mouseEnterDelay: 1 }}>
              <div style={{ color: '#bfbfbf', fontSize: 12 }}>{desc}</div>
            </Ellipsis>
          </div>
        </div>
      ),
    },
    {
      title: '输入参数',
      dataIndex: 'params',
      render: (val) =>
        isModelTool ? (
          <Tag>query</Tag>
        ) : val?.length > 0 ? (
          <>
            <Tag>
              <Ellipsis width={120} style={{ verticalAlign: 'bottom' }} tooltipProps={{ mouseEnterDelay: 1 }}>
                {val[0]}
              </Ellipsis>
            </Tag>
            {val.length > 1 ? `等${val.length}个` : ''}
          </>
        ) : (
          <></>
        ),
    },
    {
      title: '调试状态',
      dataIndex: 'debugStatus',
      render: (val) => (val ? <Badge status="success" text="成功" /> : <Badge status="error" text="失败" />),
    },
    { title: 'Agent引用数', dataIndex: 'agentBindCount' },
    { title: '工作流引用数', dataIndex: 'workflowBindCount' },
    { title: '创建时间', dataIndex: 'createTime', render: (val) => formatDate(val) },
    {
      title: '启用',
      dataIndex: 'enabled',
      render: (val, record) => <Switch checked={val} onChange={(val) => updateStatus(val, record.toolId)} />,
    },
    {
      title: '操作',
      dataIndex: 'ope',
      render: (_, record) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(0,0,0,0.45)' }}>
          <span className="AiAgent-link" style={{ display: 'inline-flex' }}>
            <Bianji
              onClick={() =>
                createTool({
                  toolId: record.toolId,
                  toolUseCase: isModelTool ? record.toolUseCase : undefined,
                  isEdit: true,
                })
              }
              style={{ marginRight: 12 }}
              color="currentColor"
              size={16}
            />
          </span>
          <PlayCircleOutlined
            onClick={() => createTool({ toolId: record.toolId, isDebug: true })}
            style={{ marginRight: 12, fontSize: 16 }}
            className="AiAgent-link"
          />
          <span className="AiAgent-link" style={{ display: 'inline-flex' }}>
            <Shanchu onClick={() => onDelete(record)} color="currentColor" size={16} />
          </span>
        </span>
      ),
    },
  ];

  const CreateButton = useMemo(
    () => (
      <Button type="primary" onClick={() => createTool()} disabled={total >= globalConfig?.toolLimit}>
        创建工具
      </Button>
    ),
    [createTool, globalConfig?.toolLimit, total],
  );

  return !currentToolBox ? (
    detailError ? (
      <>
        <Breadcrumbs />
        <ContentWrapper>
          <Empty description={detailError.message || '获取工具组详情出错'} />
        </ContentWrapper>
      </>
    ) : (
      <Spin />
    )
  ) : (
    <>
      <Breadcrumbs currentText={name} extra={CreateButton} />
      <ContentWrapper>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ToolboxIcon toolboxType={toolboxType} style={{ marginRight: 16 }} />
          <div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{name}</span>
              <span className="AiAgent-link">
                <Bianji
                  style={{ marginLeft: 8, verticalAlign: 'text-bottom' }}
                  onClick={() => setCreateToolBoxVis(true)}
                  size={16}
                  color="currentColor"
                />
              </span>
            </div>

            <Ellipsis lines={1} style={{ color: '#fff' }} tooltipProps={{ mouseEnterDelay: 1 }}>
              <div style={{ color: '#00000073' }}>{desc}</div>
            </Ellipsis>
          </div>
        </div>
        <Divider style={{ margin: '16px 0' }} />
        <RequestTable
          rowKey={'toolId'}
          params={{ toolboxId }}
          columns={columns}
          request={getToolList}
          noDataNode={
            <Empty
              description={<div color="rgba(0, 0, 0, 0.45)">暂无{isModelTool ? '小模型' : 'API'}工具</div>}
              style={{ height: 'calc(100% - 100px)' }}
            >
              {CreateButton}
            </Empty>
          }
          getTableChange={(fn) => {
            tableChangeRef.current = fn;
          }}
          getRes={(res) => {
            setTableRes(res);
          }}
          pagination={false}
        />
      </ContentWrapper>
      <CreateToolbox
        open={createToolBoxVis}
        onCancel={() => setCreateToolBoxVis(false)}
        onOk={onCreateBox}
        initData={currentToolBox}
      />

      {creatModelToolBoxVisable ? (
        <Modal
          title="创建工具"
          open={creatModelToolBoxVisable}
          onOk={handleOk}
          onCancel={() => setCreatModelToolBoxVisable(false)}
          maskClosable={false}
          // width={400}
          destroyOnClose
        >
          <div style={{ marginBottom: 10 }}>请选择小模型工具应用场景</div>
          <Radio.Group onChange={onModelRadioChange} value={toolUseCase}>
            <Radio value={TypeToolUseCaseEunm.intent}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <IconYitu size={18} color="#5555F2" style={{ marginRight: 8 }} /> 意图匹配
              </span>
              <Paragraph style={{ color: '#999', marginTop: 5 }}>
                场景举例：可通过该工具判断访客咨询意图是售前商品问题（询问商品价格、材质等），还是售后商品问题（询问商品如何使用、如何保养等）。通过该工具输出的“意图”，调用不同知识库进行应答。
              </Paragraph>
            </Radio>
            <Radio value={TypeToolUseCaseEunm.similar}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <IconXiangsici size={18} color="#0BAFE5" style={{ marginRight: 8 }} /> 相似词匹配
              </span>
              <Paragraph style={{ color: '#999', marginTop: 5 }}>
                场景举例：可将访客原声中提及的“商品名”通过该工具输出为该商品的“标准商品名称”。通过该“标准词”作为调用商品库API接口的标准入参，获取对应的商品信息。
              </Paragraph>
            </Radio>
          </Radio.Group>
        </Modal>
      ) : null}
    </>
  );
};

export default ToolList;
