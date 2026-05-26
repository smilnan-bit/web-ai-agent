import React, { useContext } from 'react';
import { SidebarContext } from '../../context';
import tw from 'twin.macro';

const FloatLayout = ({
  children,
  headerComp,
  bottomComp,
  rightComp,
  rightMostComp,
}: {
  children: React.ReactNode;
  headerComp?: React.ReactNode;
  bottomComp?: React.ReactNode;
  rightComp?: React.ReactNode;
  rightMostComp?: React.ReactNode;
}) => {
  const { showLeftPanel } = useContext(SidebarContext);
  return (
    <div tw="pointer-events-none absolute z-10 top-0 left-0 right-0 bottom-3 flex flex-col">
      <div tw="w-full pointer-events-auto mb-3">{headerComp}</div>
      <div tw="flex flex-1 w-full h-[calc(100% - 68px)] gap-3 overflow-hidden px-3">
        <div
          css={[tw`flex w-full min-w-0 flex-col flex-shrink flex-grow-0`, showLeftPanel && tw`pointer-events-auto`]}
          id="leftPanelRoot"
        >
          <div css={[tw`relative overflow-hidden flex-grow-0 flex-shrink w-full h-full`, showLeftPanel && tw`hidden`]}>
            {children}
          </div>
          {/* 底部面板，优先级比主区域高，默认高度为 0，一旦有高度会挤压主面板 */}
          <div
            css={[tw`relative flex-grow flex-shrink-0 w-full min-h-0 pointer-events-auto`, showLeftPanel && tw`hidden`]}
          >
            {bottomComp}
          </div>
        </div>
        {/* 右侧区域（节点编辑/试运行面板），默认宽度为 0，一旦有宽度就会挤压左侧 */}
        <div tw="flex-grow flex-shrink-0 min-w-0 pointer-events-auto">{rightComp}</div>
        {/* 最右侧区域（发布记录面板），优先级最高，默认宽度为 0，一旦有宽度就会挤压左侧 */}
        {rightMostComp && <div tw="flex-grow flex-shrink-0 min-w-0 pointer-events-auto">{rightMostComp}</div>}
      </div>
    </div>
  );
};

export default React.memo(FloatLayout);
