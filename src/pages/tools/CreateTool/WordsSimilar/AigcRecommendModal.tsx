import { Button, Modal, Table, Tooltip, message } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ToolUseCaseConfig, type TypeToolUseCaseEunm } from '@/constants';
import { fetchAigcRecommendList, fetchAigcRecommendTaskId } from '@/api';
import '../index.less';

// 定义组件属性接口
interface AigcRecommendModalProps {
  toolId?: string | number; // 工具ID
  standardQuestion?: string; // 标准问题
  showAigcRecommendModal?: boolean; // 控制模态框显示状态
  selfCreatedQusNum?: number; // 用户自创建的相似问题数量
  hasExistedQus?: string[]; // 已存在的相似问题列表
  toggleAigcRecommendModal?: () => void; // 切换模态框显示状态的方法
  addSimilarQus?: (val: any) => void; // 添加相似问题的回调函数
  standardId?: number; // 标准问题ID
  toolUseCase: TypeToolUseCaseEunm; // 工具使用场景类型
  canAddCount?: number; // 可添加的最大问题数量
}

const AigcRecommendModal: React.FC<AigcRecommendModalProps> = (props: AigcRecommendModalProps) => {
  const {
    toolId,
    showAigcRecommendModal,
    standardQuestion,
    selfCreatedQusNum,
    hasExistedQus,
    toggleAigcRecommendModal,
    addSimilarQus,
    standardId,
    toolUseCase,
    canAddCount,
  } = props;
  const [recommondLoading, setRecommondLoadings] = useState(false); // 控制表格加载状态
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 存储选中行的key
  const [selectedRows, setSelectedRows] = useState([]); // 存储选中行的完整数据
  const [aigcRecommendList, setAigcRecommendList] = useState([]); // 存储AIGC推荐的问题列表

  // 引用对象，用于存储过滤后的推荐列表和定时器ID
  const filterResListRef = useRef([]);
  const timerIdRef = useRef(null);

  /**
   * 轮询获取AIGC推荐的相似问题
   * @param taskId - 任务ID
   */
  const getAigcRecommendList = async (taskId) => {
    try {
      const res = await fetchAigcRecommendList({ taskId, toolId, standardId });
      const { data } = res || {};
      const { taskStatus, list } = data || {};
      if (taskStatus === 1) {
        timerIdRef.current = setTimeout(() => getAigcRecommendList(taskId), 2000);
      }
      if (taskStatus === 2) {
        timerIdRef.current && clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
        list.forEach((item) => {
          // 已经加为相似问题的不出现在推荐列表中
          if (!hasExistedQus.includes(item.question)) {
            // 对比已经获取了的推荐列表，去重
            const exist = filterResListRef.current.find((curItem) => curItem.id === item.id);
            if (!exist) {
              filterResListRef.current.push(item);
            }
          }
        });
        setAigcRecommendList([...filterResListRef.current]);
        setRecommondLoadings(false);
      }
      if (taskStatus === 3 || taskStatus === 4) {
        message.error('很抱歉，请求超时，请稍后再试');
        setRecommondLoadings(false);
        timerIdRef.current && clearTimeout(timerIdRef.current);
      }
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * 获取相似问题的任务ID并开始轮询
   */
  const getAigcRecommendTaskId = async () => {
    try {
      setRecommondLoadings(true);
      const params = {
        toolId,
        standard: standardQuestion,
      };
      const { data } = await fetchAigcRecommendTaskId(params);

      // 轮询请求
      getAigcRecommendList(data);
    } catch (e) {
      console.log(e);
      setRecommondLoadings(false);
    }
  };

  // 组件挂载时获取推荐列表，卸载时清除定时器
  useEffect(() => {
    getAigcRecommendTaskId();
    return () => {
      timerIdRef.current && clearTimeout(timerIdRef.current);
    };
  }, []);

  // 点击按钮获取更多相似问题
  const getMoreSimilarQues = () => {
    getAigcRecommendTaskId();
  };

  const handleCancel = () => {
    toggleAigcRecommendModal();
  };

  // 点击加为相似问题
  const addAigcSimilarQus = () => {
    if (selfCreatedQusNum + selectedRows.length > canAddCount) {
      // 自创建相似问题+算法推荐相似问题
      message.warning(`${ToolUseCaseConfig[toolUseCase]?.similarTitle}总数不得超过${canAddCount}`);
      return;
    }
    addSimilarQus(selectedRows);
  };

  /**
   * 表格相关配置
   */
  const columns = [
    {
      title: ToolUseCaseConfig[toolUseCase]?.AIRecommendTitle,
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
    },
  ];

  /**
   * 表格行选择配置
   */
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, newSelectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    },
  };

  /**
   * 处理表格行点击事件
   * 实现行点击选中/取消选中的逻辑
   */
  const onRow = useCallback(
    (record) => {
      return {
        onClick: () => {
          // 点击行选择项
          const selectedRowsMap = {}; // {id, question}
          // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
          selectedRows.forEach((item) => (selectedRowsMap[item.id] = item.question));
          const flag = selectedRowsMap[record.id]; // 是否是已存在的项
          const index = selectedRowKeys.indexOf(record.id); // 若是已存在的项，在数组selectedRowKeys中的位置索引

          if (!flag) {
            // 没存在，勾选上
            setSelectedRowKeys([...selectedRowKeys, record.id]);
            setSelectedRows([...selectedRows, { id: record.id, question: record.question }]);
          } else {
            // 存在的，取消掉
            const newSelectedRowKeys = cloneDeep(selectedRowKeys);
            const newSelectedRows = cloneDeep(selectedRows);
            newSelectedRowKeys.splice(index, 1);
            newSelectedRows.splice(index, 1);
            setSelectedRowKeys(newSelectedRowKeys);
            setSelectedRows(newSelectedRows);
          }
        },
      };
    },
    [selectedRowKeys, selectedRows],
  );

  return (
    <>
      <Modal
        title="智能问法推荐"
        className={'m-aigcRecommendQusModal'}
        width={560}
        open={showAigcRecommendModal}
        onCancel={handleCancel}
        maskClosable={false}
        footer={null}
      >
        <Tooltip title={selectedRowKeys.length ? '' : '请选中内容后再试'} placement="right" arrowPointAtCenter>
          <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={addAigcSimilarQus}>
            {ToolUseCaseConfig[toolUseCase].addAIRecommendBtnTxt}
          </Button>
        </Tooltip>
        <Table
          loading={recommondLoading}
          columns={columns}
          dataSource={aigcRecommendList}
          rowKey="id"
          scroll={{ y: '322px' }}
          rowSelection={rowSelection}
          onRow={onRow}
          pagination={false}
        />
      </Modal>
    </>
  );
};

export default AigcRecommendModal;
