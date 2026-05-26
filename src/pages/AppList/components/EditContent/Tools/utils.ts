export const batchUpdateParamVisibility = (originalParams, updates) => {
  // updates 格式: [{ value: 'object.object_boolean', visible: false }, ...]

  const clonedParams = JSON.parse(JSON.stringify(originalParams));

  // 递归更新函数
  function updateNodeByPath(params, targetPath, newVisible) {
    if (!params || !Array.isArray(params)) return false;

    const pathArray = targetPath.split('.');

    function findAndUpdate(currentParams, pathIndex) {
      if (pathIndex >= pathArray.length) return false;

      const currentName = pathArray[pathIndex];

      for (const param of currentParams) {
        if (param.name === currentName) {
          // 找到目标节点
          if (pathIndex === pathArray.length - 1) {
            param.visible = newVisible;
            return true;
          } else if (param.subParams) {
            return findAndUpdate(param.subParams, pathIndex + 1);
          }
        }
      }

      return false;
    }

    return findAndUpdate(params, 0);
  }

  // 批量更新
  for (const update of updates) {
    const success = updateNodeByPath(clonedParams, update.value, update.visible);
    if (!success) {
      console.warn(`未找到路径为 "${update.value}" 的参数节点`);
    }
  }

  return clonedParams;
};

export const updateParamVisibility = (originalParams, targetValue, newVisible) => {
  // 参数验证
  if (!Array.isArray(originalParams)) {
    throw new Error('originalParams 必须是数组');
  }

  if (typeof targetValue !== 'string' || !targetValue.trim()) {
    throw new Error('targetValue 必须是非空字符串');
  }

  if (typeof newVisible !== 'boolean') {
    throw new Error('newVisible 必须是布尔值');
  }

  // 深拷贝
  const clonedParams = JSON.parse(JSON.stringify(originalParams));
  const pathArray = targetValue.split('.');

  // 查找并更新节点
  function findAndUpdateNode(params, depth = 0) {
    if (depth >= pathArray.length) return null;

    const currentName = pathArray[depth];

    for (const param of params) {
      if (param.name === currentName) {
        // 找到目标节点
        if (depth === pathArray.length - 1) {
          const oldVisible = param.visible;
          param.visible = newVisible;

          return {
            success: true,
            node: param,
            path: targetValue,
            oldValue: oldVisible,
            newValue: newVisible,
          };
        } else if (param.subParams && Array.isArray(param.subParams)) {
          return findAndUpdateNode(param.subParams, depth + 1);
        } else {
          return {
            success: false,
            error: `节点 "${currentName}" 没有子参数，无法继续查找路径 "${pathArray.slice(depth + 1).join('.')}"`,
          };
        }
      }
    }

    return {
      success: false,
      error: `在第 ${depth + 1} 层未找到名为 "${currentName}" 的节点`,
    };
  }

  const result = findAndUpdateNode(clonedParams);

  if (!result || !result.success) {
    console.warn(`更新失败: ${result?.error || '未知错误'}`);
    return originalParams; // 返回原数据
  }

  console.log(`成功更新节点 "${targetValue}": ${result.oldValue} -> ${result.newValue}`);
  return clonedParams;
};

export const updateOriginalParamsFromTreeData = (originalParams, treeData, options) => {
  const { enableLogging = true, validateStructure = true, onUpdate = null } = options || {};

  const clonedParams = JSON.parse(JSON.stringify(originalParams));
  const updateLog = [];

  // 验证树形数据结构
  const validateTreeData = (treeNodes) => {
    if (!Array.isArray(treeNodes)) {
      throw new Error('treeData必须是数组');
    }

    const validateNode = (node, path = '') => {
      if (!node.hasOwnProperty('value') || !node.hasOwnProperty('visible')) {
        throw new Error(`节点 ${path} 缺少必要属性: value 或 visible`);
      }

      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child, index) => {
          validateNode(child, `${path}[${index}]`);
        });
      }
    };

    treeNodes.forEach((node, index) => {
      validateNode(node, `root[${index}]`);
    });
  };

  // 收集所有需要更新的信息
  const collectUpdates = (treeNodes, updates = []) => {
    if (!treeNodes || !Array.isArray(treeNodes)) return updates;

    for (const node of treeNodes) {
      updates.push({
        value: node.value,
        visible: node.visible,
        name: node.name,
        desc: node.desc,
        type: node.type,
      });

      if (node.children && Array.isArray(node.children)) {
        collectUpdates(node.children, updates);
      }
    }

    return updates;
  };

  // 应用更新到原始数据
  const applyUpdate = (params, targetValue, newVisible) => {
    const pathArray = targetValue.split('.');

    const update = (currentParams, depth = 0) => {
      if (depth >= pathArray.length) return null;

      const currentName = pathArray[depth];

      for (let i = 0; i < currentParams.length; i++) {
        const param = currentParams[i];

        if (param.name === currentName) {
          if (depth === pathArray.length - 1) {
            const oldVisible = param.visible;
            param.visible = newVisible;

            return {
              success: true,
              path: targetValue,
              oldValue: oldVisible,
              newValue: newVisible,
              nodeId: param.id || `${param.name}_${param.type}_${param.deep}`,
            };
          } else if (param.subParams) {
            return update(param.subParams, depth + 1);
          } else {
            return {
              success: false,
              error: `路径 ${targetValue} 在节点 ${currentName} 处中断，该节点没有子参数`,
            };
          }
        }
      }

      return {
        success: false,
        error: `在第${depth + 1}层未找到名为 ${currentName} 的节点`,
      };
    };

    return update(params);
  };

  try {
    // 验证输入数据
    if (validateStructure) {
      validateTreeData(treeData);
    }

    // 收集更新信息
    const updates = collectUpdates(treeData);

    // 执行批量更新
    for (const update of updates) {
      const result = applyUpdate(clonedParams, update.value, update.visible);

      updateLog.push({
        ...update,
        result,
      });

      // 调用回调函数
      if (onUpdate && result.success) {
        onUpdate(result);
      }
    }

    // 输出日志
    if (enableLogging) {
      const successUpdates = updateLog.filter((log) => log.result.success);
      const failedUpdates = updateLog.filter((log) => !log.result.success);

      console.group('🔄 参数更新结果');
      console.log(`总计: ${updates.length} 个节点, 成功: ${successUpdates.length}, 失败: ${failedUpdates.length}`);

      if (successUpdates.length > 0) {
        console.group('✅ 成功更新的节点');
        successUpdates.forEach((log) => {
          console.log(`${log.value}: ${log.result.oldValue} → ${log.result.newValue}`);
        });
        console.groupEnd();
      }

      if (failedUpdates.length > 0) {
        console.group('❌ 更新失败的节点');
        failedUpdates.forEach((log) => {
          console.error(`${log.value}: ${log.result.error}`);
        });
        console.groupEnd();
      }

      console.groupEnd();
    }

    return clonedParams;
  } catch (error) {
    console.error('更新参数时发生错误:', error);
    return originalParams;
  }
};

export const updateOriginalParamsFromTreeData2 = (originalParams, treeData) => {
  const clonedParams = JSON.parse(JSON.stringify(originalParams));

  // 一次性构建所有映射关系
  const buildMappings = (params) => {
    const pathToNodeMap = new Map(); // value路径 -> 节点引用
    const idToNodeMap = new Map(); // id -> 节点引用

    const traverse = (currentParams, parentPath = '') => {
      if (!currentParams || !Array.isArray(currentParams)) return;

      for (const param of currentParams) {
        const currentPath = parentPath ? `${parentPath}.${param.name}` : param.name;

        // 建立路径映射
        pathToNodeMap.set(currentPath, param);

        // 建立ID映射
        if (param.id) {
          idToNodeMap.set(param.id, param);
        }

        // 递归处理子参数
        if (param.subParams && Array.isArray(param.subParams)) {
          traverse(param.subParams, currentPath);
        }
      }
    };

    traverse(params);

    return { pathToNodeMap, idToNodeMap };
  };

  // 扁平化收集所有更新操作
  const flattenUpdates = (treeNodes, updates = []) => {
    if (!treeNodes || !Array.isArray(treeNodes)) return updates;

    for (const node of treeNodes) {
      updates.push({
        value: node.value,
        visible: node.visible,
      });

      if (node.subParams && Array.isArray(node.subParams)) {
        flattenUpdates(node.subParams, updates);
      }
    }

    return updates;
  };

  // 构建映射和收集更新
  const { pathToNodeMap } = buildMappings(clonedParams);
  const updates = flattenUpdates(treeData);

  // 批量执行更新
  let successCount = 0;
  for (const update of updates) {
    const targetNode = pathToNodeMap.get(update.value);

    if (targetNode) {
      targetNode.visible = update.visible;
      successCount++;
    } else {
      console.warn(`路径 "${update.value}" 未找到对应节点`);
    }
  }

  console.log(`🎯 批量更新完成: ${successCount}/${updates.length} 个节点更新成功`);

  return clonedParams;
};

export const updateOriginalParamsFromTreeData3 = (originalParams, treeData) => {
  // 深拷贝原始数据，保持完整结构
  const clonedParams = JSON.parse(JSON.stringify(originalParams));

  // 递归更新函数
  const updateParams = (originalNodes, treeNodes) => {
    if (!originalNodes || !treeNodes || !Array.isArray(originalNodes) || !Array.isArray(treeNodes)) {
      return;
    }

    // 遍历原始数据的每个节点
    for (let i = 0; i < originalNodes.length; i++) {
      const originalNode = originalNodes[i];

      // 在treeData中找到对应的节点（通过name匹配）
      const treeNode = treeNodes.find((node) => node.name === originalNode.name);

      if (treeNode) {
        // 更新visible属性
        originalNode.visible = treeNode.visible;

        // 如果都有子参数，递归更新
        if (originalNode.subParams && treeNode.subParams) {
          updateParams(originalNode.subParams, treeNode.subParams);
        }
      }
    }
  };

  // 开始更新
  updateParams(clonedParams, treeData);

  return clonedParams;
};

// 递归设置所有子节点的visible
const setAllChildrenVisible = (node, visibleValue) => {
  const updatedNode = { ...node };

  if (node.children?.length > 0) {
    updatedNode.children = node.children.map((child) => ({
      ...setAllChildrenVisible(child, visibleValue),
      visible: visibleValue,
    }));
  }

  if (node.subParams?.length > 0) {
    updatedNode.subParams = node.subParams.map((child) => ({
      ...setAllChildrenVisible(child, visibleValue),
      visible: visibleValue,
    }));
  }

  return updatedNode;
};

// 检查所有子节点是否都为true
const areAllChildrenVisible = (node) => {
  let hasChildren = false;

  if (node.children?.length > 0) {
    hasChildren = true;
    if (!node.children.every((child) => child.visible === true)) {
      return false;
    }
  }

  if (node.subParams?.length > 0) {
    hasChildren = true;
    if (!node.subParams.every((child) => child.visible === true)) {
      return false;
    }
  }

  return hasChildren; // 有子节点且都为true
};

// 向上传播：设置父节点为true（如果所有子节点都为true）
export const propagateUpwards = (nodes) => {
  return nodes.map((node) => {
    const updatedNode = { ...node };

    // 先递归处理子节点
    if (node.children?.length > 0) {
      updatedNode.children = propagateUpwards(node.children);
    }

    if (node.subParams?.length > 0) {
      updatedNode.subParams = propagateUpwards(node.subParams);
    }

    // 如果当前节点为false，但所有子节点都为true，则设置当前节点为true
    if (!updatedNode.visible && areAllChildrenVisible(updatedNode)) {
      updatedNode.visible = true;
    }

    return updatedNode;
  });
};

// 向上传播：如果所有子节点都为true/fasle 设置父节点为true/false
export const propagateUpwardsStrict = (nodes) => {
  return nodes.map((node) => {
    const updatedNode = { ...node };

    // 先递归处理子节点
    if (node.children?.length > 0) {
      updatedNode.children = propagateUpwardsStrict(node.children);
    }

    if (node.subParams?.length > 0) {
      updatedNode.subParams = propagateUpwardsStrict(node.subParams);
    }

    // 检查所有子节点的visible状态
    const allChildrenVisible = areAllChildrenVisible(updatedNode);
    const allChildrenInvisible =
      (updatedNode.children?.length > 0 && updatedNode.children.every((child) => child.visible === false)) ||
      (updatedNode.subParams?.length > 0 && updatedNode.subParams.every((child) => child.visible === false));

    // 如果所有子节点都为true，设置当前节点为true
    if (allChildrenVisible) {
      updatedNode.visible = true;
    } else if (allChildrenInvisible) {
      // 如果所有子节点都为false，设置当前节点为false
      updatedNode.visible = false;
    }

    return updatedNode;
  });
};

// 主要的更新函数：找到目标节点并设置visible
export const updateTargetNode = (nodes, record, visible) => {
  return nodes.map((item) => {
    if (item.value === record.value) {
      // 找到目标节点，设置visible并处理所有子节点
      console.log(`找到目标节点: ${item.value}, 设置visible为: ${visible}`);
      const updatedItem = {
        ...setAllChildrenVisible(item, visible),
        visible,
      };
      return updatedItem;
    }

    // 递归处理子节点
    const updatedItem = { ...item };

    if (item.children?.length > 0) {
      updatedItem.children = updateTargetNode(item.children, record, visible);
    }

    if (item.subParams?.length > 0) {
      updatedItem.subParams = updateTargetNode(item.subParams, record, visible);
    }

    return updatedItem;
  });
};

export const updateTreeNodeVisible = (dataSource, record, visible) => {
  const updateNodes = (nodes) => {
    return nodes.map((item) => {
      // 找到目标节点，设置其及所有子节点
      if (item.value === record.value) {
        const setAll = (node, value) => ({
          ...node,
          visible: value,
          children: node.children?.map((child) => setAll(child, value)),
          subParams: node.subParams?.map((child) => setAll(child, value)),
        });
        return setAll(item, visible);
      }

      // 递归处理其他节点
      const updatedItem = {
        ...item,
        children: item.children?.length > 0 ? updateNodes(item.children) : item.children,
        subParams: item.subParams?.length > 0 ? updateNodes(item.subParams) : item.subParams,
      };

      // 根据所有子节点状态决定父节点状态
      const allChildren = [...(updatedItem.children || []), ...(updatedItem.subParams || [])];

      if (allChildren.length > 0) {
        const allTrue = allChildren.every((child) => child.visible === true);
        const allFalse = allChildren.every((child) => child.visible === false);

        if (allTrue && !updatedItem.visible) {
          updatedItem.visible = true;
        } else if (allFalse && updatedItem.visible) {
          updatedItem.visible = false;
        }
      }

      return updatedItem;
    });
  };

  return updateNodes(dataSource);
};
