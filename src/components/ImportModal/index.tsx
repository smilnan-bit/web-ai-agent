import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProgressProps, StepsProps } from 'antd';
import { Button, Form, Modal, Progress, Steps } from 'antd';
import classnames from 'classnames';
import Uploader from '@ysf/uploader';
import { UploadOutlined } from '@ant-design/icons';
import { IconXiazai } from '@/assets/icons';
import { timestamp2date } from '@/utils';
import { fetchImportPollingTask } from '@/api/tool';
import { fetchUploadNosToken } from '@/api/common';
import { CurrentEnum, ImportStatusEnum, ProgressStatusEnum, StepStatusEnum, nosConfig } from '@/constants';
import './index.less';

const FormItem = Form.Item;
const Step = Steps.Step;

const modulePrefix = 'm-import-modal';

let taskInterval: NodeJS.Timeout = null;

interface ImportModalProps {
  open: boolean;
  type: string;
  accept: string;
  maxSize?: number;
  onChange?: (data: any) => void;
  handleImport: (data: any, importSucc: (taskToken: string) => void, importFail: (err: string) => void) => void;
  onSuccess: () => void;
  onCancel: () => void;
  uploadTips?: string;
  extraInfo?: any;
  subType?: string;
}

const ImportModal: React.FC<ImportModalProps> = ({
  open,
  type,
  accept = '.xls,.xlsx',
  maxSize = 2,
  onChange,
  handleImport,
  onSuccess,
  onCancel,
  uploadTips,
  extraInfo,
}) => {
  const [current, setCurrent] = useState(CurrentEnum.First); // 当前step
  const [percent, setPercent] = useState(0); // 导入进度百分比
  const [total, setTotal] = useState(null); // 总数
  const [progress, setProgress] = useState(0); // 导入数量
  const [succNum, setSuccNum] = useState(0); // 成功数量
  const [failedNum, setFailedNum] = useState(0); // 失败数量
  const [stepStatus, setStepStatus] = useState<StepsProps['status']>(StepStatusEnum.Process); // step状态
  const [progressStatus, setProgressStatus] = useState<ProgressProps['status']>(ProgressStatusEnum.Active); // 进度条状态
  const [errLog, setErrLog] = useState(''); // 错误日志地址
  const [errLogName, setErrLogName] = useState(''); // 错误日志文件名
  const [errMsg, setErrMsg] = useState(''); // 导入过程中的错误信息
  const [url, setUrl] = useState('');
  const [baseInfo, setBaseInfo] = useState({ title: '', tplName: '', tplUrl: '' });

  // 文档导入文案
  const documentBaseInfo = useMemo(
    () => ({
      title: extraInfo?.title || '导入文档',
      tplName: extraInfo?.tplName || '下载文档导入模板',
      tplUrl: extraInfo?.tplUrl,
    }),
    [extraInfo],
  );

  // 停止轮询
  const stopImportPolling = useCallback(() => {
    if (taskInterval) {
      clearInterval(taskInterval);
    }
  }, []);

  const setBaseInfoByType = useCallback(
    (type: string) => {
      if (type === 'document') {
        setBaseInfo(documentBaseInfo);
      }
    },
    [documentBaseInfo],
  );

  useEffect(() => {
    setBaseInfoByType(type);
    return () => {
      stopImportPolling();
    };
  }, [type, setBaseInfoByType, stopImportPolling]);

  useEffect(() => {
    if (!open) {
      setCurrent(CurrentEnum.First);
      setPercent(0);
      setTotal(null);
      setProgress(0);
      setSuccNum(0);
      setFailedNum(0);
      setStepStatus(StepStatusEnum.Process);
      setProgressStatus(ProgressStatusEnum.Active);
      setErrLog('');
      setErrLogName('');
      setErrMsg('');
      setUrl('');

      stopImportPolling();
    }
  }, [open, stopImportPolling]);

  // 取消
  const handleCancel = () => {
    onCancel();
    stopImportPolling();
  };

  // 轮询导入任务
  const onPollingTask = (res: any) => {
    const { data } = res || {};
    const status = Number(data?.status);
    const progress = Number(data?.progress);
    const total = Number(data?.total);
    const percent = Math.floor((progress / (total || 1)) * 100);

    try {
      switch (status) {
        case ImportStatusEnum.Waiting:
          setPercent(percent);
          setProgress(progress);
          setTotal(total);
          setStepStatus(StepStatusEnum.Process);
          setProgressStatus(ProgressStatusEnum.Active);
          break;
        case ImportStatusEnum.Success: {
          const info = JSON.parse(JSON.parse(data.info)[0]);
          const succNum = info.succ;
          const failedNum = info.failed;
          const errorlog = info.errorlog;
          const errorlogName = `导入错误报告 ${timestamp2date(Date.now(), 'yyyy-MM-dd')}.txt`;

          setCurrent(CurrentEnum.Third);
          setSuccNum(succNum);
          setFailedNum(failedNum);
          setProgress(progress);
          setStepStatus(StepStatusEnum.Finish);
          setProgressStatus(ProgressStatusEnum.Success);
          setErrLog(errorlog);
          setErrLogName(errorlogName);

          if (succNum > 0) {
            onSuccess();
          }
          stopImportPolling();
          break;
        }
        case ImportStatusEnum.FailedInfo:
        case ImportStatusEnum.Failed: {
          setStepStatus(StepStatusEnum.Error);
          const errMessage = JSON.parse(data.info)[0] || '未知错误';
          setErrMsg(errMessage);
          stopImportPolling();
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  // 导入成功回调
  const importSucc = async (taskToken: string) => {
    setCurrent(CurrentEnum.Second);
    const checkLoginSuccess = async () => {
      try {
        const res = await fetchImportPollingTask({ taskToken });
        onPollingTask(res);
      } catch (err) {
        console.error(err);
      }
    };

    await checkLoginSuccess();
    taskInterval = setInterval(checkLoginSuccess, 1000);
  };

  // 导入失败回调
  const importFail = () => {
    setStepStatus(StepStatusEnum.Error);
  };

  // 开始导入
  const handleStartImport = () => {
    if (url) {
      const start = url.lastIndexOf('/');
      const nosKey = url.slice(start + 1);
      const data = { key: nosKey };
      handleImport(data, importSucc, importFail);
    }
  };

  // 导入步骤样式
  const step1Cls = classnames('sec-1', { 'z-hide': current !== CurrentEnum.First });
  const step2Cls = classnames('sec-2', { 'z-hide': current !== CurrentEnum.Second });
  const errMsgCls = classnames('err-text', { 'z-hide': !errMsg });
  const progressCls = classnames('progress', { 'z-hide': errMsg });
  const dataCls = classnames('data', { 'z-hide': errMsg });
  const step3Cls = classnames('sec-3', { 'z-hide': current !== CurrentEnum.Third });
  const errTextCls = classnames('err-text', { 'z-hide': !errLog });
  const errUrlCls = classnames('err-url', { 'z-hide': !errLog });

  const footer =
    current === CurrentEnum.First ? (
      <>
        <Button onClick={handleCancel}>取消</Button>
        <Button onClick={handleStartImport} type="primary" disabled={!url}>
          开始导入
        </Button>
      </>
    ) : null;

  const getDownloadTpl = () => (
    <div className="down-item">
      <IconXiazai className="icon-download" />
      <a className="down-link" href={baseInfo.tplUrl} download="filename">
        {baseInfo.tplName}
      </a>
    </div>
  );

  return (
    <Modal
      className={modulePrefix}
      width={600}
      title={baseInfo.title}
      open={open}
      onCancel={handleCancel}
      footer={footer}
      maskClosable={false}
      destroyOnClose
    >
      <Steps current={current} status={stepStatus}>
        <Step title="上传文件" />
        <Step title="导入数据" />
        <Step title="完成" />
      </Steps>

      <section className={step1Cls}>
        <div className="down-tips">1、{'请按照模板格式准备需要导入的数据'}</div>
        <div className="down-action">{getDownloadTpl()}</div>
        <div className="up-tips">2、请选择需要导入的文件</div>
        <Form className="up-action">
          <FormItem className="form-item-up">
            <Uploader
              type="other"
              accept={accept}
              maxSize={maxSize}
              tip={uploadTips || `支持xls、xlsx文件，单个文件不得大于${maxSize}M`}
              tokenRequest={fetchUploadNosToken}
              onChange={(fileList) => {
                if (fileList.length) {
                  setUrl(fileList[0].url);
                  onChange && onChange?.(fileList[0].url);
                } else {
                  setUrl('');
                  onChange && onChange?.(undefined);
                }
              }}
              {...nosConfig}
            >
              <Button type="primary" icon={<UploadOutlined />}>
                上传文件
              </Button>
            </Uploader>
          </FormItem>
        </Form>
      </section>

      <section className={step2Cls}>
        <div className={errMsgCls}>{errMsg}</div>
        <Progress className={progressCls} percent={percent} status={progressStatus} />
        {total === null ? (
          <div className={dataCls}>正在准备数据...</div>
        ) : (
          <div className={dataCls}>{`正在导入 ${progress} / ${total} 条数据`}</div>
        )}
      </section>

      <section className={step3Cls}>
        <div className="result">
          导入完成，共导入
          <span className="z-succ">&nbsp;{succNum}&nbsp;</span>
          条，失败
          <span className="z-err">&nbsp;{failedNum}&nbsp;</span>条
        </div>
        <div className={errTextCls}>下载导入报告，查看失败原因</div>
        <div className={errUrlCls}>
          <a className="down-link" href={errLog} download="filename">
            <IconXiazai className="icon-download" />
            &nbsp;{errLogName}
          </a>
        </div>
      </section>
    </Modal>
  );
};

export default ImportModal;
