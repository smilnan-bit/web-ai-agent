import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Modal, Table, Tooltip, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useRecoilValue } from 'recoil';
import classNames from 'classnames';
import type { ColumnsType } from 'antd/es/table';
import type { ToolNS } from '@/types/Tools';
import { formatDate } from '@/utils';
import Operations from '@/components/Operations';
import BatchTable from '@/components/BatchTable';
import { IconBianji, IconShanchu } from '@/assets/icons';
import { fetchSimilarWordsDelete, fetchSimilarWordsImport, fetchSimilarWordsList, fetchWordDetail } from '@/api';
import { TypeToolUseCaseEunm } from '@/constants';
import ImportModal from '@/components/ImportModal';
import { CurrentToolState } from '../model';
import Actions from '../Actions';
import './index.less';
import EditWord from './EditWord';

const PAGE_SIZE = 50;

const modulePrefix = 'm-words-similar';

const WordsSimilar = () => {
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE);
  const [totalNum, setTotalNum] = useState<number>(0);
  const [list, setList] = useState<ToolNS.SimilarWordsListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showBatch, setShowBatch] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const currentToolValue = useRecoilValue(CurrentToolState);
  const { toolId, toolUseCase } = currentToolValue || {};
  const [importModalVisible, setImportModalVisible] = useState<boolean>(false);
  const [editData, setEditData] = useState(null);
  const [editIntentVis, setEditIntentVis] = useState(false);
  const batchTableRef = useRef(null);
  const isIntent = toolUseCase === TypeToolUseCaseEunm.intent;

  // 获取相似词列表
  const getSimilarList = useCallback(async () => {
    setIsLoading(true);
    fetchSimilarWordsList({ toolId, limit: pageSize, offset: (current - 1) * pageSize })
      .then((res) => {
        const { list = [], total = 0 } = res?.data || {};
        if (list.length === 0 && total > 0 && current > 1) {
          // 最后一页数量为0，重新请求前一页
          setCurrent(current - 1);
        } else {
          setList(list);
          setTotalNum(total);
        }
      })
      .catch((err) => {
        console.log('err', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [toolId, current, pageSize]);

  useEffect(() => {
    if (toolId) {
      getSimilarList();
    }
  }, [toolId, getSimilarList]);

  // 批量删除
  const handleBatchDelete = (ids, selectAll) => {
    const standardIds = ids.split(',').map((it) => parseInt(it));
    const deleteParams: { toolId: string | number; standardIds?: number[] } = { toolId };
    if (!selectAll) deleteParams.standardIds = standardIds;
    Modal.confirm({
      title: '确认删除吗？删除后不可恢复。',
      onOk: () => {
        fetchSimilarWordsDelete(deleteParams)
          .then((res) => {
            message.success('删除成功');
            // 刷新列表
            getSimilarList();
            batchTableRef.current.clearBatchOperation();
          })
          .catch((err) => {
            console.log('err', err);
          });
      },
    });
  };

  // 列表翻页
  const handleTableChange = ({ current, pageSize }, filters, { order, columnKey }) => {
    setCurrent(current);
    setPageSize(pageSize);
  };

  // 编辑相似词
  const handleClickEdit = async (word) => {
    const { data } = await fetchWordDetail({ id: word.standardId, toolId });
    setEditData(data);
    setEditIntentVis(true);
  };

  // 删除相似词
  const handleClickDelete = (id) => {
    Modal.confirm({
      title: '确认要删除吗？',
      content: '删除后将无法恢复，请谨慎选择。',
      onOk: () => {
        fetchSimilarWordsDelete({ toolId, standardIds: [id] })
          .then((res) => {
            message.success('删除成功');
            // 刷新列表
            getSimilarList();
          })
          .catch((err) => {
            console.log('err', err);
          });
      },
    });
  };

  // 开始导入相似词
  const handleStartImport = ({ key }, successCb, failedCb) => {
    const newKey = decodeURIComponent(key);
    fetchSimilarWordsImport({ toolId, key: newKey })
      .then((res) => {
        if (typeof successCb === 'function') {
          successCb(res?.data);
        }
      })
      .catch((json) => {
        if (typeof failedCb === 'function') {
          failedCb(json);
        }
      });
  };

  // 导入相似词成功
  const handleImportSuccess = () => {
    setCurrent(1);
    getSimilarList();
  };

  // 取消导入
  const handleCancelImport = () => {
    setImportModalVisible(false);
  };

  const columns: ColumnsType<ToolNS.SimilarWordsListItem> = [
    {
      title: isIntent ? '意图' : '标准词',
      dataIndex: 'standard',
      key: 'standard',
      width: '20%',
      ellipsis: true,
      render: (val) => val || '--',
    },
    {
      title: isIntent ? '意图问法数量' : '相似词数量',
      dataIndex: 'similarExpressions',
      key: 'similarExpressions',
      width: '30%',
      ellipsis: true,
      render: (val) => val?.length || 0,
    },
    {
      title: '更新人',
      dataIndex: 'updateStaffName',
      key: 'updateStaffName',
      width: '10%',
      ellipsis: true,
      render: (value) => value || '--',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: '16%',
      ellipsis: true,
      render: (val) => formatDate(val) || '--',
    },
    {
      title: '创建人',
      dataIndex: 'createStaffName',
      key: 'createStaffName',
      width: '10%',
      ellipsis: true,
      render: (value) => value || '--',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: '16%',
      ellipsis: true,
      render: (val) => formatDate(val) || '--',
    },
    {
      title: '操作',
      key: 'operation',
      width: '120px',
      render: ({ standardId, standard, similarExpressions }) => {
        return (
          <div className={classNames(`${modulePrefix}-operation`, { disabled: showBatch })}>
            <IconBianji
              className="icon-setting"
              onClick={(e) => {
                if (showBatch) return; // 批量操作禁止编辑
                e.stopPropagation();
                handleClickEdit({ standardId, standard, similarExpressions });
              }}
            />
            <IconShanchu
              className="icon-setting"
              onClick={(e) => {
                e.stopPropagation();
                if (showBatch) return; // 批量操作禁止单个删除
                handleClickDelete(standardId);
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className={modulePrefix}>
      {editIntentVis ? (
        <EditWord
          onReturn={() => {
            setEditIntentVis(false);
            getSimilarList();
          }}
          initData={editData}
          toolUseCase={toolUseCase}
        />
      ) : (
        <>
          <Operations
            style={{ marginBottom: 20 }}
            left={
              <div>
                配置{isIntent ? '意图及意图问法' : '标准词相似词'}
                {
                  <Tooltip
                    title={
                      isIntent ? (
                        <>
                          <div>请输入访客意图及对应的意图问法（能够代表访客意图的访客问题/关键词）。</div>
                          <div>比如：</div>
                          <div style={{ marginLeft: 12 }}>
                            <div>- 意图：售前商品咨询</div>
                            <div>- 意图问法：材质、颜色、价格</div>
                            <div>- 意图：投诉</div>
                            <div>- 意图问法：我要投诉、质量太差了、叫你们经理来</div>
                          </div>
                          <div>输入的意图问法越多，意图匹配的准确度越高。</div>
                        </>
                      ) : (
                        <div>
                          <div>请输入标准词和相似词。</div>
                          <br />
                          <div>比如：</div>
                          <div>-标准词：网易七鱼客服系统</div>
                          <div>-相似词：七鱼、网易七鱼、七鱼客服系统</div>
                          <br />
                          <div>-标准词：SW-2486984</div>
                          <div>-相似词：四十周年纪念款、小黄人同款、6986手表</div>
                          <br />
                          <p>输入的相似词越多，关键词匹配的准确度越高。</p>
                        </div>
                      )
                    }
                  >
                    <QuestionCircleOutlined style={{ marginLeft: 8, color: '#00000073' }} />
                  </Tooltip>
                }
              </div>
            }
            right={
              <>
                <Button
                  className="filter-item"
                  type="primary"
                  disabled={showBatch}
                  onClick={() => {
                    editData && setEditData(null);
                    setEditIntentVis(true);
                  }}
                >
                  添加
                </Button>
                <Button className="filter-item" disabled={showBatch} onClick={() => setShowBatch(true)}>
                  批量操作
                </Button>
                <Button className="filter-item" disabled={showBatch} onClick={() => setImportModalVisible(true)}>
                  导入
                </Button>
              </>
            }
          />
          <BatchTable
            showRestNum={true}
            current={current}
            totalNum={totalNum}
            isExporting={isExporting}
            pageSize={pageSize}
            // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
            onRef={(node) => (batchTableRef.current = node)}
            ids={list.map((it) => it.standardId)}
            showBatch={showBatch}
            downloadType={'SYNONYM_OR_INTENTION_DOWNLOAD'}
            otherDownloadParams={{ toolId }}
            onDelete={handleBatchDelete}
            onExit={() => setShowBatch(false)}
            renderTable={({ height, rowSelection }) => (
              <Table
                rowKey="standardId"
                className={`${modulePrefix}-table`}
                columns={columns}
                dataSource={list}
                loading={isLoading}
                pagination={{
                  total: totalNum,
                  current,
                  pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '30', '40', '50', '100'],
                  showTotal: () => {
                    return `每页显示${pageSize}条，共 ${Math.ceil(totalNum / pageSize)} 页，共${totalNum} 条`;
                  },
                }}
                onChange={handleTableChange}
                rowSelection={rowSelection}
                onRow={({ standardId, standard, similarExpressions }) => ({
                  onClick: (event) => {
                    if (showBatch) return; // 批量操作禁止编辑
                    handleClickEdit({ standardId, standard, similarExpressions });
                  },
                })}
                scroll={{
                  x: 100,
                  y: `calc(100vh - ${showBatch ? '520' : '450'}px)`,
                }}
              />
            )}
          />
          <Actions similarList={list} />
          {/* 导入相似词 */}
          {importModalVisible ? (
            <ImportModal
              type="document"
              extraInfo={{
                title: isIntent ? '意图导入' : '相似词导入',
                tplName: `下载${isIntent ? '意图' : '相似词'}导入模板`,
                tplUrl: isIntent
                  ? `https://res.qiyukf.net/storage/7efec4ac-96ee-4df0-bb51-1c3e4a914cb5.xlsx?download=意图导入模板.xlsx`
                  : `https://res.qiyukf.net/storage/5d260f60-27c1-41a7-a6b4-dcd279d0b48b.xlsx?download=相似词导入模板.xlsx`,
              }}
              open={importModalVisible}
              handleImport={handleStartImport}
              onSuccess={handleImportSuccess}
              onCancel={handleCancelImport}
            />
          ) : null}
        </>
      )}
    </div>
  );
};
export default WordsSimilar;
