import React, { useEffect, useState } from 'react';
import { diffChars, diffLines, diffWords } from 'diff';
import { useRecoilValue } from 'recoil';
import { CurrentAppState } from '@/model';

import './index.less';
import { TemplateParser } from '../PromptInput/TemplateParser';

const templateParser = new TemplateParser({ mark: 'InputSlot' });

const DiffDemo = () => {
  const { prompt: currentPrompt = '', prePrompt: lastDraftPrompt = '' } = useRecoilValue(CurrentAppState) || {};
  const [diffResult, setDiffResult] = useState([]);
  // 执行diff对比
  const performDiff = () => {
    const lastSimplePrompt = templateParser.convertTemplateToSimplifiedFormat(lastDraftPrompt);
    const currentComplicatePrompt = templateParser.convertTemplateToSimplifiedFormat(currentPrompt);
    const diff = diffChars(lastSimplePrompt, currentComplicatePrompt);

    // 交换相邻的added和removed项目的顺序（与原代码逻辑一致）
    for (let i = 0; i < diff.length; i++) {
      if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
        const swap = diff[i];
        diff[i] = diff[i + 1];
        diff[i + 1] = swap;
      }
    }

    setDiffResult(diff);
  };

  // 当文本或diff类型改变时，自动执行对比

  // 渲染diff结果
  const renderDiffResult = () => {
    return diffResult.map((part, index) => {
      //替换某些富文本样式为普通文本

      if (part.removed) {
        return <del key={index}>{part.value}</del>;
      } else if (part.added) {
        return <ins key={index}>{part.value}</ins>;
      } else if (part.chunkHeader) {
        return (
          <span key={index} className="chunk-header">
            {part.value}
          </span>
        );
      } else {
        return <React.Fragment key={index}>{part.value}</React.Fragment>;
      }
    });
  };

  useEffect(() => {
    performDiff();
  }, [currentPrompt, lastDraftPrompt]);

  return (
    <div className="diff-container">
      <pre id="result">{renderDiffResult()}</pre>
    </div>
  );
};

export default DiffDemo;
