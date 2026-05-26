import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Empty, Spin, Steps } from 'antd';
import { useRouter } from '@ysf/ys-router';
import classNames from 'classnames';
import { getToolDetail, getToolboxDetail } from '@/api';
import { CurrentToolBoxState } from '@/model';
import Breadcrumbs from '@/components/Breadcrumbs';
import ContentWrapper from '@/components/ContenWrapper';
import { ToolboxTypeEnum, TypeToolUseCaseEunm } from '@/constants';
import { StepContentClassName, intentSteps, similarWordsSteps, steps, useInitPageData } from './utils';
import { CurrentToolState, CurrentToolStepState } from './model';
import './index.less';

const CreateTool: React.FC = () => {
  const [current, setCurrent] = useRecoilState(CurrentToolStepState);
  const [currentTool, setCurrentTool] = useRecoilState(CurrentToolState);
  const [currentToolBox, setCurrentToolBox] = useRecoilState(CurrentToolBoxState);
  const { toolId, toolboxId, isDebug, toolboxType, toolUseCase } = useInitPageData();
  const { navigate, routesMap } = useRouter();
  const [toolDetailErrMsg, setToolDetailErrMsg] = useState();
  const isModelTool = toolboxType === ToolboxTypeEnum.modelTool;
  const realStepConfig = isModelTool
    ? toolUseCase === TypeToolUseCaseEunm.similar
      ? similarWordsSteps
      : intentSteps
    : steps;

  const items = realStepConfig.map((item) => ({
    key: item.key,
    title: item.title,
  }));

  const onEditTool = useCallback(() => {
    navigate(routesMap.tools.path, { query: { toolboxId, toolboxType } });
  }, [navigate, routesMap.tools.path, toolboxId, toolboxType]);

  useEffect(() => {
    if (toolId) {
      getToolDetail({ toolId, toolboxId })
        .then(({ data }) => setCurrentTool(data))
        .catch(({ message }) => {
          setToolDetailErrMsg(message || '获取工具详情失败');
        });
    } else {
      setCurrentTool(undefined);
    }

    return () => {
      setCurrentTool(undefined);
      setToolDetailErrMsg(undefined);
    };
  }, [setCurrentTool, toolId, toolboxId]);

  useEffect(() => {
    if (toolboxId && !currentToolBox) {
      getToolboxDetail({ toolboxId }).then(({ data }) => setCurrentToolBox(data));
    }
  }, [currentToolBox, setCurrentToolBox, toolboxId]);

  useEffect(() => {
    const stepsLength = toolboxType === ToolboxTypeEnum.modelTool ? similarWordsSteps.length - 1 : steps.length - 1;
    isDebug ? setCurrent(stepsLength) : setCurrent(0);
  }, [isDebug, toolboxType, setCurrent]);

  return (
    <>
      <Breadcrumbs
        customText={[{ index: 1, text: currentToolBox?.name, onClick: onEditTool }]}
        currentText={toolId ? '编辑工具' : '创建工具'}
      />
      {/* 有ToolId但是没请求到数据时显示Spin */}
      {toolId && !currentTool ? (
        <>
          {toolDetailErrMsg ? (
            <ContentWrapper className="CreateTool">
              <Empty description={toolDetailErrMsg} />
            </ContentWrapper>
          ) : (
            <Spin />
          )}
        </>
      ) : (
        <ContentWrapper className="CreateTool">
          <Steps current={current} items={items} />
          <div className={classNames({ [StepContentClassName]: true, modeltool: isModelTool })}>
            {realStepConfig[current]?.content}
          </div>
        </ContentWrapper>
      )}
    </>
  );
};

export default CreateTool;
