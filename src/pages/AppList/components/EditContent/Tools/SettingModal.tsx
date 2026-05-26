import React, { useCallback, useEffect, useImperativeHandle, useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Modal, Spin, Switch, Table, Tooltip } from 'antd';
import { useMemoizedFn, useRequest } from 'ahooks';
import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import cloneDeep from 'lodash/cloneDeep';
import { ToolParamsTypeEnum, VARIABLE_TYPE_ALIAS_MAP } from '@/constants';
import {
  updateOriginalParamsFromTreeData3,
  updateTreeNodeVisible,
} from '@/pages/AppList/components/EditContent/Tools/utils';

import type { AppsNS } from '@/types/Apps';
import isEmpty from 'lodash/isEmpty';
import useAgentHistory from '../History/useAgentHistory';

export interface SettingModalRef {
  open: (toolItem: any) => void;
  close: () => void;
}
interface DataType {
  name: string;
  desc: string;
  visible?: boolean;
  type: ToolParamsTypeEnum;
  value: string;
  children?: DataType[];
}

interface ToolResponseParams extends DataType {
  subParams?: DataType[];
}

interface SettingModalProps {
  onSuccess?: (toolItem: AppsNS.ToolType) => void;
  title?: string;
  globalScheduleSet?: boolean;
  paramsSet?: boolean;
}

const SettingBlock = ({
  title,
  tip,
  children,
}: { title: string; tip?: React.ReactNode; children: React.ReactNode }) => {
  return (
    <div tw="[:not(:first-of-type)]:mt-[40px]">
      <div tw="mb-3">
        <span tw="font-bold">{title}</span>
        {tip && (
          <Tooltip title={tip}>
            <InfoCircleOutlined style={{ marginLeft: 4, color: '#8c8c8c' }} />
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
};

const SettingModal: React.ForwardRefRenderFunction<SettingModalRef, SettingModalProps> = (
  { onSuccess, title = '工具', paramsSet = true, globalScheduleSet = false },
  ref,
) => {
  const [open, setOpen] = React.useState(false);
  const [dataSource, setDataSource] = React.useState<DataType[]>([]);
  const [originalData, setOriginalData] = React.useState<any>({});
  const [expandedRowKeys, setExpandedRowKeys] = React.useState<string[]>([]);
  const [globalSchedule, setGlobalSchedule] = React.useState<boolean>(false);
  const { isHistoryMode } = useAgentHistory();

  const tranverseAllKeys = (data) => {
    let keys: string[] = [];
    data.forEach((item) => {
      if (item.children && item.children.length > 0) {
        keys.push(item.value);
        keys = keys.concat(tranverseAllKeys(item.children));
      }
    });
    return keys;
  };
  const paramDataToTreeData = useCallback((params, parentValue = '') => {
    return params?.map(({ name, type, subParams, desc, visible, id }) => {
      const value = `${parentValue ? `${parentValue}.` : ''}${name}`; // 把上级名字也传服务端 一级.二级.三级
      return {
        name,
        value,
        desc,
        type,
        visible: !!visible,
        children: subParams && type !== ToolParamsTypeEnum.array ? paramDataToTreeData(subParams, value) : null,
      };
    });
  }, []);

  useImperativeHandle(ref, () => {
    return {
      open: (toolItem) => {
        const { cardConfig } = toolItem || {};
        const { outputParams = [], workflowGlobalScheduling } = cardConfig || {};
        setOriginalData(toolItem);
        const formatData = paramDataToTreeData(outputParams);
        setDataSource(formatData);
        setGlobalSchedule(workflowGlobalScheduling);
        const expandKeys: string[] = tranverseAllKeys(formatData);
        setExpandedRowKeys(expandKeys);
        setOpen(true);
      },
      close: () => {
        setOpen(false);
      },
    };
  });

  useEffect(() => {
    if (!open) {
      setDataSource([]);
      setExpandedRowKeys([]);
      setOriginalData({});
    }
  }, [open]);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOk = useMemoizedFn(() => {
    const extractParams = (data) => {
      return data.map(({ name, value, visible, children, type, desc }) => {
        const param: ToolResponseParams = {
          name,
          visible,
          type,
          desc,
          value,
        };
        if (children && children.length > 0) {
          param.subParams = extractParams(children);
        }
        return param;
      });
    };

    const params = extractParams(dataSource);
    const { outputParams, ...rest } = originalData?.cardConfig || {};

    const updatedOriginalParams = updateOriginalParamsFromTreeData3(outputParams || [], params);

    const newCardConfig = {
      ...rest,
      ...(paramsSet && !isEmpty(updatedOriginalParams) ? { outputParams: updatedOriginalParams } : {}),
      workflowGlobalScheduling: globalSchedule,
    };

    onSuccess &&
      onSuccess({
        ...originalData,
        cardConfig: newCardConfig,
      });
  });

  const handleChangeSelect = useMemoizedFn((record) => {
    const visible = !record.visible;

    const mapData = cloneDeep(dataSource);

    // 先更新目标节点及其子节点
    // let newData = updateTargetNode(dataSource, record, visible);
    // newData = propagateUpwardsStrict(newData);

    const newData = updateTreeNodeVisible(mapData, record, visible);

    setDataSource(newData);
  });

  const handledExpandedRowKeys = useCallback((expandedKeys) => {
    setExpandedRowKeys(expandedKeys as string[]);
  }, []);

  const columns: ColumnsType<DataType> = useMemo(
    () => [
      {
        title: '参数名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        render: (text) => (
          <>
            <Tooltip title={text}>{text || '--'}</Tooltip>
          </>
        ),
      },
      {
        title: '参数描述',
        dataIndex: 'desc',
        key: 'desc',
        ellipsis: true,
        render: (text) => (
          <>
            <Tooltip title={text}>{text || '--'}</Tooltip>
          </>
        ),
      },
      {
        title: '参数类型',
        dataIndex: 'type',
        key: 'type',
        render: (text) => VARIABLE_TYPE_ALIAS_MAP[text],
      },
      {
        title: () => (
          <span>
            返回大模型
            <Tooltip title="若关闭，则对应参数不会返回給大模型。">
              <ExclamationCircleOutlined style={{ marginLeft: 4, color: '#BFBFBF' }} />
            </Tooltip>
          </span>
        ),
        dataIndex: 'visible',
        key: 'visible',
        render: (_, record) => {
          return (
            <Switch checked={record?.visible} onClick={() => handleChangeSelect(record)} disabled={isHistoryMode} />
          );
        },
      },
    ],
    [isHistoryMode],
  );
  return open ? (
    <Modal open={open} title={`${title}设置`} onCancel={handleCancel} width={720} onOk={handleOk}>
      {globalScheduleSet && (
        <SettingBlock
          title="工作流全局调度"
          tip={
            <>
              开启后，支持LLM根据用户意图进行工作流的全局调度，实现工作流节点的灵活跳转。
              <br />
              比如：当工作流已完成用户“手机号”和“家庭地址”的信息采集后，在工作流还未结束的情况下，若用户突然说“啊前面的手机号我说错了”，则会触发工作流全局调度能力，系统会立即将工作流跳转回负责采集“用户手机号”的对话节点，重新和用户进行手机号的采集任务。
            </>
          }
        >
          <Switch
            checked={globalSchedule}
            onChange={() => setGlobalSchedule(!globalSchedule)}
            tw="block"
            disabled={isHistoryMode}
          />
        </SettingBlock>
      )}
      {paramsSet && (
        <SettingBlock title={`${title}输出变量设置`}>
          <Table<DataType>
            columns={columns}
            dataSource={dataSource}
            rowKey={'value'}
            pagination={false}
            expandedRowKeys={expandedRowKeys}
            onExpandedRowsChange={handledExpandedRowKeys}
            scroll={{ y: 600 }}
          />
        </SettingBlock>
      )}
    </Modal>
  ) : null;
};

export default React.forwardRef(SettingModal);
