import { useEffect, useState } from 'react';
import { flattenSubParams } from '@/utils';

// 获取ComplicateParams组件中的最大的paramId
export const useMaxParamId = (paramsData) => {
  const [maxParamId, setMaxParamId] = useState(0);

  useEffect(() => {
    const allParams = flattenSubParams(paramsData);
    const maxId = allParams?.reduce((acc, cur) => {
      const id = isNaN(Number(cur?.id)) ? 0 : Number(cur.id);
      return id > acc ? id : acc;
    }, 0);
    setMaxParamId(maxId);
  }, [paramsData]);
  return { maxParamId, setMaxParamId };
};
