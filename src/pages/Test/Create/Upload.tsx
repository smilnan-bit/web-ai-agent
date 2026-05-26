import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import Uploader from '@ysf/uploader';
import { UploadOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useRecoilValue } from 'recoil';
import { GlobalConfigState } from '@/model';
import { nosConfig } from '@/constants';
import { fetchUploadNosToken } from '@/api/common';
import { addCostTask, getTestTaskCost } from '@/api';
import { CountingStatusEnum, type StepItemProps, type StepRefType } from '../type';

const maxSize = 100;
const Upload: React.ForwardRefRenderFunction<StepRefType, StepItemProps> = ({ taskData, setTaskData }, parentRef) => {
  const globalConfig = useRecoilValue(GlobalConfigState) || {};
  const intervalRef = React.useRef<any>();

  const pollGetCost = async (taskToken: string, nosKey: string) =>
    // eslint-disable-next-line compat/compat
    new Promise((resolve, reject) => {
      intervalRef.current = setInterval(() => {
        getTestTaskCost({ agentId: taskData.agentId, taskToken })
          .then(({ data, message }) => {
            if (data?.countingStatus === CountingStatusEnum.finished) {
              clearInterval(intervalRef.current);
              setTaskData((prev) => ({ ...prev, ...data, nosKey }));
              resolve(data);
            }
            if (data?.countingStatus !== CountingStatusEnum.counting) {
              // 其他状态都停止轮询
              clearInterval(intervalRef.current);
              reject(new Error(message));
            }
          })
          .catch((err) => {
            clearInterval(intervalRef.current);
            reject(err);
          });
      }, 1000);
    });

  const getCost = async () => {
    const url = taskData.fileList?.[0]?.url;
    if (!url) {
      message.error('请上传文件');
      throw new Error('请上传文件');
    }
    const start = url.lastIndexOf('/');
    const nosKey = url.slice(start + 1);
    const nosKeyDecode = decodeURIComponent(nosKey);
    try {
      const { data: taskToken } = await addCostTask({ agentId: taskData.agentId, nosKey: nosKeyDecode });
      await pollGetCost(taskToken, nosKeyDecode);
    } catch (err: any) {
      const errmessage = err.message || '获取费用失败，请稍后重试';
      throw new Error(errmessage);
    }
  };

  useImperativeHandle(parentRef, () => ({
    validateValues: getCost,
  }));

  useEffect(() => {
    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Uploader
      type="other"
      accept=".xls,.xlsx"
      maxSize={maxSize}
      tip={''}
      tokenRequest={fetchUploadNosToken}
      suffixValidate
      onChange={(fileList) => {
        setTaskData((prev) => ({ ...prev, fileList: fileList?.length ? fileList : [] }));
      }}
      fileList={taskData?.fileList}
      className={`TestCreate-Upload ${taskData?.fileList?.length ? 'hidden' : ''}`}
      dragUpload={true}
      {...nosConfig}
    >
      <UploadOutlined style={{ fontSize: 20, color: '#337EFF' }} />
      <div style={{ fontSize: 16, margin: '14px 0' }}>点击上传或拖拽文档到这里</div>
      <div style={{ textAlign: 'left', color: 'rgba(0, 0, 0, 0.25)' }}>
        <div>
          请使用模版上传测试数据；
          <a
            href="https://res.qiyukf.net/storage/6b79d155-2558-432d-84fd-2826541632da.xlsx?download=Agent测评数据模版.xlsx"
            onClick={(e) => e.stopPropagation()}
          >
            点击下载Agent测评数据模版
          </a>
        </div>
        <div>仅支持上传xls、xlsx格式文件；</div>
        <div>文件大小不得超过100M；</div>
        <div>最多上传{globalConfig.evaluationTaskUploadRowsLimit}条数据</div>
      </div>
    </Uploader>
  );
};
const UploadWrapper = forwardRef<StepRefType, StepItemProps>(Upload);

export default UploadWrapper;
