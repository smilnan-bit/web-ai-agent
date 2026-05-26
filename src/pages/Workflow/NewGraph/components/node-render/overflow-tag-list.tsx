/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { type ReactNode, useLayoutEffect, useRef, useState } from 'react';

import classnames from 'classnames';

import { Dropdown, IconButton, Tooltip } from '@douyinfe/semi-ui';
import { IconGengduo } from '../../nodes/icons';

export interface TagProps {
  key?: string;
  icon?: ReactNode;
  label?: ReactNode;
  tooltip?: ReactNode;
}

export interface OverflowTagListProps<T extends TagProps = TagProps> {
  /* tag 列表 */
  value?: T[];
  enableTooltip?: boolean;
  tagItemRenderer?: (tagData: T) => ReactNode;
  dropdownClassName?: string;
  disableMore?: boolean;
}

const TAG_ITEM_IDENTIFIER_CLASS = 'tag-item-wrapper';

const defaultTagItemRenderer = (tag: TagProps): ReactNode => {
  const { icon, label = '' } = tag;
  return (
    <div tw="flex items-center text-[rgba(15,21,40,0.82)] gap-[4px] max-w-full">
      {icon ? <span tw="flex flex-grow flex-shrink-0 text-[14px] text-[rgba(55,67,106,0.38)]">{icon}</span> : null}
      <span tw="text-[14px] leading-5 overflow-hidden text-ellipsis whitespace-nowrap">{label}</span>
    </div>
  );
};

export function OverflowTagList<T extends TagProps = TagProps>({
  value = [],
  enableTooltip,
  tagItemRenderer,
  dropdownClassName,
  disableMore,
}: OverflowTagListProps<T>) {
  const renderTags = (tags: T[], prefix = '') =>
    tags.map((tag, index) => {
      const { tooltip } = tag;
      const uniqueKey = `tag-${index}`;
      const tagItemContent = tagItemRenderer?.(tag) || defaultTagItemRenderer(tag);
      const tagItem = (
        <div key={`${prefix}${uniqueKey}`} className={classnames(TAG_ITEM_IDENTIFIER_CLASS)} tw="max-w-full">
          {tagItemContent}
        </div>
      );
      if (!tooltip || !enableTooltip) {
        return tagItem;
      }
      return (
        <Tooltip
          key={`tooltip-${prefix}${uniqueKey}`}
          content={<div tw="text-[rgba(15,21,40, 0.82)] text-[14px] max-h-[500px] overflow-y-auto">{tooltip}</div>}
          style={{ backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
        >
          {tagItem}
        </Tooltip>
      );
    });

  const tagListRef = useRef<HTMLDivElement | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useLayoutEffect(() => {
    if (!tagListRef.current) {
      return;
    }
    const listWidth = tagListRef.current?.clientWidth ?? 0;
    const tags = Array.from(tagListRef.current.getElementsByClassName(TAG_ITEM_IDENTIFIER_CLASS)) as HTMLElement[];
    if (!tags?.length) {
      setShowOverlay(false);
    } else {
      const lastTag = tags[tags.length - 1];
      const right = lastTag.offsetWidth + lastTag.offsetLeft;
      setShowOverlay(right > listWidth);
    }
  }, [value]);

  return (
    <div ref={tagListRef} tw="relative overflow-hidden flex gap-1.5 items-center">
      {renderTags(value, 'main-')}
      {showOverlay ? (
        <div key="overlay" tw="pointer-events-none absolute top-0 right-0 bottom-0 flex items-center">
          <div tw="w-[93px] h-full bg-gradient-to-r from-transparent to-[rgba(252,252,255,1)] from-0% to-[78%]"></div>
          {!disableMore && (
            <Dropdown
              position="bottomRight"
              render={
                <div
                  key="dropdown-content"
                  className={classnames({
                    [dropdownClassName as string]: dropdownClassName,
                  })}
                  tw="w-[230px] p-1.5 gap-1.5 flex flex-row flex-wrap max-h-[500px] overflow-y-auto"
                >
                  {renderTags(value, 'dropdown-')}
                </div>
              }
            >
              <div tw="pointer-events-auto text-[0px] w-[20px] h-[20px] bg-[rgba(252,252,255,1)] flex items-center justify-center">
                <div tw="rounded-[4px] text-[14px] w-full h-full leading-[20px] flex items-center justify-center cursor-pointer  hover:bg-[rgb(242, 244, 247)]">
                  <IconGengduo tw="text-[rgba(15,21,40,0.62)]" />
                </div>
              </div>
            </Dropdown>
          )}
        </div>
      ) : null}
    </div>
  );
}
