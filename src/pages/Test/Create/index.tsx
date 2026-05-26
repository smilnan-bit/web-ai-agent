import React, { useRef, useState } from 'react';
import { Button, Divider, Steps } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useRouter } from '@ysf/ys-router';
import type { StepRefType, TestTaskType } from '../type';
import BasicInfo from './BasicInfo';
import Upload from './Upload';
import './index.less';
import Cost from './Cost';

const Create = () => {
  const [taskData, setTaskData] = useState<Partial<TestTaskType>>();
  const [current, setCurrent] = useState<number>(0);
  const { navigate, routesMap } = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const stepSubmitRef = useRef<StepRefType>();
  const stepProps = { taskData, setTaskData, ref: stepSubmitRef };
  const stepsConfig = [
    {
      title: '选择测评对象',
      content: <BasicInfo {...stepProps} />,
    },
    {
      title: '上传测评数据',
      content: <Upload {...stepProps} />,
    },
    { title: '确认测评任务', content: <Cost {...stepProps} /> },
  ];
  const onNext = () => {
    const { validateValues } = stepSubmitRef.current;
    if (validateValues) {
      setLoading(true);
      validateValues()
        .then(() => {
          if (current < stepsConfig.length - 1) {
            setCurrent(current + 1);
          } else {
            navigate(routesMap.test.path);
          }
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="TestCreate">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 64,
          background: '#fff',
          padding: '0 24px',
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 500 }}>
          <LeftOutlined
            style={{ marginRight: 8 }}
            className="AiAgent-link"
            onClick={() => navigate(routesMap.test.path)}
          />
          创建测评任务
        </span>
        <span>
          <Button style={{ marginRight: 8 }} onClick={() => setCurrent((pre) => pre - 1)} disabled={current === 0}>
            上一步
          </Button>
          <Button type="primary" onClick={onNext} loading={loading}>
            {current === stepsConfig.length - 1 ? '开始测评' : '下一步'}
          </Button>
        </span>
      </div>
      <div style={{ padding: 16, height: 'calc(100% - 64px)' }}>
        <div style={{ background: '#fff', borderRadius: 4, height: '100%' }}>
          <Steps
            current={current}
            items={stepsConfig.map((item) => ({
              title: item.title,
            }))}
            style={{ width: 520, padding: '20px 0', margin: '0 auto' }}
          />
          <Divider style={{ margin: 0 }} />
          {stepsConfig[current]?.content}
        </div>
      </div>
    </div>
  );
};

export default Create;
