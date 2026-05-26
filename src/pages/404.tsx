import { Button, Result } from 'antd';
import { useNavigate } from '@ysf/ys-router';
import React from 'react';

const NoFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="对不起, 当前访问的页面不存在"
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          首页
        </Button>
      }
    />
  );
};

export default NoFoundPage;
