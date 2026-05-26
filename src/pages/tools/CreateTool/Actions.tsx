import React, { useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Button } from 'antd';
import { useRouter } from '@ysf/ys-router';
import { ToolDebugStatusEnum, ToolboxTypeEnum } from '@/constants';
import { useQueryLocationSearch } from '@/utils/other';
import type { ToolNS } from '@/types/Tools';
import { CurrentToolState, CurrentToolStepState } from './model';
import { StepActionClassName, similarWordsSteps, steps } from './utils';

const Actions: React.FC<{ similarList?: ToolNS.SimilarWordsListItem[]; validateData?: () => Promise<void> }> = ({
  similarList,
  validateData,
}) => {
  const [current, setCurrent] = useRecoilState(CurrentToolStepState);
  const currentToolValue = useRecoilValue(CurrentToolState);
  const { navigate, routesMap } = useRouter();
  const { toolboxId, toolboxType } = useQueryLocationSearch();
  const [nextButtonLoading, setNextButtonLoading] = useState(false);

  const isModelTool = toolboxType === ToolboxTypeEnum.modelTool;
  const stepsLength = isModelTool ? similarWordsSteps.length - 1 : steps.length - 1;

  const next = async () => {
    try {
      setNextButtonLoading(true);
      await validateData?.();
      setNextButtonLoading(false);

      setCurrent((pre) => (pre >= stepsLength ? stepsLength : pre + 1));
    } catch (err) {
      setNextButtonLoading(false);
    }
  };

  const prev = () => {
    setCurrent((pre) => (pre <= 0 ? 0 : pre - 1));
  };

  const onFinish = useCallback(() => {
    navigate(routesMap.tools.path, { query: { toolboxId, toolboxType } });
  }, [navigate, routesMap.tools.path, toolboxId, toolboxType]);

  return (
    <div className={StepActionClassName}>
      {current > 0 && (
        <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
          上一步
        </Button>
      )}
      {current < stepsLength && (
        <Button
          type="primary"
          onClick={next}
          disabled={isModelTool && similarList?.length === 0}
          loading={nextButtonLoading}
        >
          保存并继续
        </Button>
      )}
      {current === stepsLength && (
        <Button
          type="primary"
          disabled={[ToolDebugStatusEnum.fail, undefined].includes(currentToolValue?.debugStatus)}
          onClick={onFinish}
        >
          完成
        </Button>
      )}
    </div>
  );
};

export default Actions;
