import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

// @ts-expect-error - Module resolution issue with exports subpath
import { useInjector, useEditor } from '@flowgram.ai/coze-editor/react';
// @ts-expect-error - Module resolution issue with exports subpath
import type { EditorAPI } from '@flowgram.ai/coze-editor/preset-prompt';
// @ts-expect-error - Module resolution issue with exports subpath
import { astDecorator } from '@flowgram.ai/coze-editor';

import { getLibraryInfoByBlockInfo, getLibraryStatus } from './utils';
import { getLibraryBlockInfoFromTemplate } from './utils';
import { TemplateParser } from '../TemplateParser';
import { LibraryBlockWidgetType } from './LibraryBlockWidgetType';
import './index.less';
import type { AppsNS } from '@/types/Apps';
import type { ILibraryList } from '../type';
import { LibraryConfig } from '../utils';

const templateParser = new TemplateParser({ mark: 'InputSlot' });
function useLatest<T>(value: T) {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}
interface LibraryBlockWidgetProps {
  readonly?: boolean;
  className?: string;
  onAddLibrary?: (library: AppsNS.ILibraryItem, pos?: { from: number; to: number }) => void;
  onRename?: (pos: { from: number; to: number }) => void;
  disabledTooltips?: boolean;
  librarys: ILibraryList[];
}

export const LibraryBlockWidget = (props: LibraryBlockWidgetProps) => {
  const ref = useLatest(props);
  const editor = useEditor<EditorAPI>();
  const injector = useInjector();

  useLayoutEffect(
    () =>
      injector.inject([
        astDecorator.whole.of((cursor, state) => {
          const { librarys, readonly = false, className, onRename, disabledTooltips } = ref.current;
          if (templateParser.isOpenNode(cursor.node, state)) {
            const open = cursor.node;
            const close = templateParser.findCloseNode(open, state);

            if (close) {
              const openTemplate = state.sliceDoc(open.from, open.to);
              const contentFrom = open.to;
              const contentTo = close.from;
              const content = state.sliceDoc(contentFrom, contentTo);
              const dataInfo = getLibraryBlockInfoFromTemplate({
                template: openTemplate,
                templateParser,
              });
              const libraryStatus = dataInfo ? getLibraryStatus({ librarys, blockInfo: dataInfo }) : 'disabled';
              const libraryInfo = dataInfo ? getLibraryInfoByBlockInfo({ librarys, blockInfo: dataInfo }) : null;
              return [
                {
                  type: 'replace',
                  widget: new LibraryBlockWidgetType({
                    blockDataInfo: dataInfo,
                    libraryItem: libraryInfo,
                    readonly,
                    content: libraryInfo && dataInfo ? libraryInfo[LibraryConfig[dataInfo.type].nameKey] : content,
                    className,
                    hightlight: libraryStatus === 'existing',
                    libraryStatus,
                    onAddLibrary(library) {
                      if (typeof ref.current.onAddLibrary === 'function') {
                        ref.current.onAddLibrary(library, {
                          from: open.from,
                          to: close.to,
                        });
                      }
                    },
                    range: {
                      left: open.to,
                      right: close.from,
                    },
                    onRename,
                    disabledTooltips,
                  }),
                  atomicRange: true,
                  from: open.from,
                  to: close.to,
                },
              ];
            }
          }
        }),
        templateParser.markInfoField,
      ]),
    [injector],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor?.updateWholeDecorations();
  }, [editor, props.librarys]);

  return null;
};
