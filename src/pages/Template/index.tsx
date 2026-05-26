import React, { useCallback, useEffect, useState } from 'react';
import './index.less';
import { IconSearch_line } from '@/assets/icons';
import { Button, Input, type InputRef, Empty, Tooltip } from 'antd';
import type { TamplaceTabsEnum } from '@/pages/Template/constants';
import { useRouter } from '@ysf/ys-router';
import { useMemoizedFn, useRequest } from 'ahooks';
import { getAgentCategoryList, getAgentList } from '@/api/template';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { currentTemplateAgentState } from '@/pages/Template/modal';
import { GlobalConfigState } from '@/model';
import { cleanObject } from '@/utils';

const Template: React.FC = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const inputRef = React.useRef<InputRef>(null);

  const [activeTab, setActiveTab] = useState<number | null>(null);

  const setCurrentAgent = useSetRecoilState(currentTemplateAgentState);

  const { navigate, routesMap } = useRouter();

  const [tabList, setTabList] = useState<Array<{ categoryName: string; categoryId: number; key: TamplaceTabsEnum }>>(
    [],
  );

  const [searchValue, setSearchValue] = useState<string>('');

  const [agentList, setAgentList] = useState<Array<Record<string, any>>>([]);

  const globalConfig = useRecoilValue(GlobalConfigState);

  const { run: fetchAgentList } = useRequest(getAgentList, {
    manual: true,
    onSuccess: (res) => {
      const { data } = res || {};
      setAgentList(data || []);
    },
  });

  const { run: fetchAgentCategoryList } = useRequest(getAgentCategoryList, {
    manual: true,
    onSuccess: (res) => {
      const { data } = res || {};
      const { categoryList } = data || {};

      const formatCategoryList = [{ categoryName: '全部', categoryId: null }, ...categoryList];
      const id = formatCategoryList?.[0]?.categoryId;
      fetchAgentList();
      setTabList(formatCategoryList || []);
      setActiveTab(id);
    },
  });

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback((e) => {
    if (
      e.relatedTarget &&
      (e.relatedTarget.className.includes('ant-btn') || e.relatedTarget.className.includes('ant-btn-primary'))
    ) {
      return;
    }
    setIsSearchFocused(false);
  }, []);

  const handleSearch = useMemoizedFn(() => {
    const value = inputRef.current?.input?.value;
    fetchAgentList(cleanObject({ categoryId: activeTab, agentName: value || '' }));
    setSearchValue(value || '');
  });

  const handleButtonClick = useMemoizedFn((e) => {
    e.stopPropagation();
    e.preventDefault();
    handleSearch();
  });

  const handleKeyDown = useMemoizedFn((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isSearchFocused) {
      handleSearch();
    }
  });

  const handleTabClick = useMemoizedFn((key: number) => {
    setActiveTab(key);
    fetchAgentList(cleanObject({ categoryId: key, agentName: searchValue }));
  });

  // 点击试用
  const handleGoTryAgent = useMemoizedFn((id, agent) => {
    setCurrentAgent(agent);
    navigate(routesMap.templateTry.path, { query: { appId: id } });
  });

  useEffect(() => {
    fetchAgentCategoryList();
  }, []);

  return (
    <div className={'template-warp'}>
      <div className={'template-header'}>
        <div tw={'p-[24px 0] text-center text-[32px] font-semibold leading-[1.5]'}>
          探索<span className={'template-colorfull'}>智能Agent</span>解决方案
        </div>
        <div tw={'flex justify-center items-center h-[44px] w-[640px] mx-auto'}>
          <Input
            ref={inputRef}
            className={'template-search-input'}
            placeholder="搜索Agent名称"
            prefix={<IconSearch_line />}
            onFocus={handleSearchFocus}
            onKeyDown={handleKeyDown}
            onBlur={handleSearchBlur}
            maxLength={globalConfig.appNameLimit}
            allowClear={isSearchFocused}
            suffix={
              <Button type={'primary'} disabled={!isSearchFocused} onClick={handleButtonClick}>
                搜索
              </Button>
            }
          />
        </div>

        <div tw={'flex justify-center items-center p-[40px 0 16px 0] gap-[8px]'}>
          {(tabList || []).map((tab) => (
            <span
              key={tab?.categoryId}
              tw={'text-[14px] rounded-[20px] cursor-pointer '}
              className={`${activeTab === tab?.categoryId ? 'template-tab-item-active' : 'template-tab-item'}`}
              style={{ padding: '6px 16px' }}
              onClick={() => handleTabClick(tab?.categoryId)}
            >
              {tab?.categoryName}
            </span>
          ))}
        </div>
      </div>

      <div tw={'h-[calc(100vh - 300px)] overflow-auto'}>
        <div tw={'flex flex-wrap gap-[12px] p-[0 16px]'}>
          {(agentList || []).map((agent, index) => {
            // 判断是不是每行的最后一个
            const isLastInRow = (index + 1) % 4 === 0;
            return (
              <div className={'template-agent-card'} tw={'min-w-0 h-[186px] relative'} key={agent?.appId}>
                <div tw={'flex min-w-0'}>
                  <img src={agent?.logoUrl} tw={'w-[50px] h-[50px] mr-[12px] rounded-[8px]'} />
                  <div tw={'flex-1 min-w-0'}>
                    <div tw={'mb-[0] flex justify-between items-center leading-[22px] gap-[20px]'}>
                      <Tooltip placement="topLeft" title={agent?.appName}>
                        <span tw={'text-[#000000D9] font-medium text-[16px] truncate flex-1 min-w-0'}>
                          {agent?.appName}
                        </span>
                      </Tooltip>

                      {agent?.allowCopy ? <span tw={'text-[12px] text-[#0ABF65]'}>免费复制</span> : null}
                    </div>
                    <Tooltip placement="top" title={agent?.templateTagList?.join(', ')}>
                      <div tw={'mb-[0]'}>
                        <div tw={'flex flex-wrap overflow-hidden min-w-0'} style={{ maxHeight: '26px' }}>
                          {(agent?.templateTagList || []).map((tag: string) => (
                            <span
                              key={tag}
                              tw={
                                'p-[0px 8px] bg-[#F2F2F2] leading-[18px] rounded-[4px] mt-[8px] inline-block text-[#00000073] text-[12px] mr-[4px]'
                              }
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Tooltip>
                  </div>
                </div>

                <Tooltip
                  placement={isLastInRow ? 'left' : 'right'}
                  title={agent?.appDesc}
                  getPopupContainer={(triggerNode) =>
                    triggerNode?.parentElement?.parentElement?.parentElement as HTMLElement
                  }
                  arrowPointAtCenter={true}
                  autoAdjustOverflow={false}
                >
                  <p
                    tw={
                      'mt-[12px] mb-[24px] text-[12px] text-[#00000073] line-clamp-2 overflow-hidden overflow-ellipsis leading-[18px]'
                    }
                  >
                    {agent?.appDesc}
                  </p>
                </Tooltip>
                <div
                  tw={
                    'text-[#337EFF] bg-[#337EFF14] text-center p-[7px 0] rounded-[4px] leading-[18px] cursor-pointer hover:bg-[#337EFF] hover:text-white absolute left-[16px] bottom-[16px] w-[90%]'
                  }
                  onClick={() => handleGoTryAgent(agent?.appId, agent)}
                >
                  立即试用
                </div>
              </div>
            );
          })}
          {agentList.length === 0 ? (
            <div className={'template-warp-empty'} tw={'flex-1'}>
              <Empty
                image={'https://res.qiyukf.net/storage/6bfdb5df-9e6f-478d-a091-bebd93a9113d.png'}
                description={<span tw={'text-[14px] text-[#00000040]'}>暂无数据</span>}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Template;
