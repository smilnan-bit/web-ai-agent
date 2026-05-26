import React, { Fragment, useEffect, useState } from 'react';
import { Button } from 'antd';
import { DownloadButton } from '@ysf/download-center';
import { getBatchResult } from '@/utils';
import { toolInitDownload } from '@/api';
import { DownloadAllTypeEnum } from '@/constants';
import './index.less';
const modulePrefix = 'm-batch-table';

interface BatchTableProps {
  disabledDelAll?: boolean;
  renderTable: (params: any) => React.ReactNode;
  showBatch?: boolean;
  onExit: () => void;
  onExport?: (selectedRowKeys: string[], selectAll: boolean) => void;
  onDelete?: (selectedRowKeys: string, selectAll: boolean) => void;
  btns?: React.ReactNode | React.ReactNode[];
  ids: string[] | number[];
  showRestNum?: boolean;
  isExporting?: boolean;
  pageSize?: number;
  current: number;
  totalNum: number;
  onRef?: (ref: any) => void;
  downloadType?: string;
  otherDownloadParams?: Record<string, any>;
}

const compareIds = (a: string[] | number[], b: string[]) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

const BatchTable: React.FC<BatchTableProps> = (props) => {
  const {
    ids,
    renderTable,
    showBatch,
    onDelete,
    onRef,
    btns,
    showRestNum = false,
    disabledDelAll = false,
    pageSize = 50,
    current,
    totalNum,
    isExporting,
    downloadType,
    otherDownloadParams = {},
  } = props;

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  // 当前页全部选中
  const [selectPageAll, setSelectPageAll] = useState<boolean>(false);
  // 全部选中
  const [selectAll, setSelectAll] = useState<boolean>(false);

  // 清空批量操作
  const clearBatchOperation = () => {
    setSelectedRowKeys([]);
    setSelectPageAll(false);
    setSelectAll(false);
  };

  useEffect(() => {
    onRef && onRef({ clearBatchOperation });
  }, []);

  useEffect(() => {
    if (!compareIds(ids, selectedRowKeys)) {
      setSelectedRowKeys([]);
      setSelectPageAll(false);
      setSelectAll(false);
    }
  }, [ids]);

  // 删除
  const handleDelete = () => {
    onDelete && onDelete(selectedRowKeys.join(','), selectAll);
  };

  // 退出批量
  const handleExit = () => {
    setSelectedRowKeys([]);
    setSelectPageAll(false);
    setSelectAll(false);
    props.onExit && props.onExit();
  };

  return (
    <div>
      {renderTable({
        showBatch,
        height: showBatch ? 40 : 0,
        rowSelection: showBatch
          ? {
              selectedRowKeys,
              onChange: (selectedRowKeys: string[]) => {
                if (showRestNum) {
                  const { selectPageAll, selectAllFlag } = getBatchResult(
                    selectedRowKeys.length,
                    current,
                    pageSize,
                    totalNum,
                    selectAll,
                  );
                  setSelectedRowKeys(selectedRowKeys);
                  setSelectAll(selectAllFlag);
                  setSelectPageAll(selectPageAll);
                } else {
                  setSelectedRowKeys(selectedRowKeys);
                }
              },
            }
          : null,
      })}
      {showBatch && (
        <div className={`${modulePrefix}-panel`}>
          {showRestNum ? (
            <Fragment>
              <span>已选中{selectAll ? totalNum : selectedRowKeys.length}项</span>
              {selectPageAll && !selectAll && (
                <span
                  onClick={() => {
                    setSelectAll(true);
                  }}
                >
                  选中剩余{totalNum - selectedRowKeys.length}项
                </span>
              )}
              {selectAll && (
                <span
                  onClick={() => {
                    setSelectAll(false);
                  }}
                >
                  取消
                </span>
              )}
            </Fragment>
          ) : (
            <span>当前已选择 {selectedRowKeys.length} 项</span>
          )}
          <div className={`${modulePrefix}-panel-operation`}>
            {btns || (
              <>
                {onDelete ? (
                  <Button
                    type="primary"
                    onClick={handleDelete}
                    disabled={selectedRowKeys.length < 1 || (disabledDelAll && selectAll)}
                  >
                    删除
                  </Button>
                ) : null}
                {downloadType && (
                  <DownloadButton
                    downloadRequest={toolInitDownload}
                    downloadParams={{
                      type: downloadType,
                      downloadTaskParam: {
                        ids: selectAll ? undefined : selectedRowKeys,
                        downloadType: selectAll ? DownloadAllTypeEnum.all : DownloadAllTypeEnum.notAll,
                        ...otherDownloadParams,
                      },
                    }}
                    disabled={selectedRowKeys.length < 1}
                    loading={isExporting}
                  >
                    导出
                  </DownloadButton>
                )}
                <Button onClick={handleExit}>退出批量</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchTable;
