import { useCallback } from 'react';
import { batchUpdateParamVisibility, updateParamVisibility } from '@/pages/AppList/components/EditContent/Tools/utils';

const useParamVisibilityUpdater = () => {
  const updateSingle = useCallback((originalParams, targetValue, newVisible) => {
    return updateParamVisibility(originalParams, targetValue, newVisible);
  }, []);

  const updateMultiple = useCallback((originalParams, updates) => {
    return batchUpdateParamVisibility(originalParams, updates);
  }, []);

  // 切换可见性（true变false，false变true）
  const toggleVisibility = useCallback(
    (originalParams, targetValue) => {
      const clonedParams = JSON.parse(JSON.stringify(originalParams));

      // 先找到当前值
      const pathArray = targetValue.split('.');
      let currentNode = null;

      function findNode(params, depth = 0) {
        if (depth >= pathArray.length) return null;

        const currentName = pathArray[depth];

        for (const param of params) {
          if (param.name === currentName) {
            if (depth === pathArray.length - 1) {
              return param;
            } else if (param.subParams) {
              return findNode(param.subParams, depth + 1);
            }
          }
        }
        return null;
      }

      currentNode = findNode(clonedParams);

      if (currentNode) {
        return updateSingle(originalParams, targetValue, !currentNode.visible);
      }

      return originalParams;
    },
    [updateSingle],
  );

  return {
    updateSingle,
    updateMultiple,
    toggleVisibility,
  };
};
