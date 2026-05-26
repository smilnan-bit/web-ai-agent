import type { Root } from 'react-dom/client';
import { WidgetType } from '@codemirror/view';
import cls from 'classnames';
import type { LibraryBlockInfo, LibraryStatus } from '../type';
import type { AppsNS } from '@/types/Apps';
import { isEqual } from 'lodash-es';

interface LibraryBlockWidgetOptions {
  blockDataInfo: LibraryBlockInfo | null;
  libraryItem: AppsNS.ILibraryItem | null;
  content: string;
  hightlight: boolean;
  libraryStatus: LibraryStatus;
  readonly: boolean;
  className?: string;
  onAddLibrary?: (library: AppsNS.ILibraryItem) => void;
  range: {
    left: number;
    right: number;
  };
  onRename?: (pos: { from: number; to: number }) => void;
  disabledTooltips?: boolean;
}

function createElement(name: string, attributes: Record<string, string>, children: (HTMLElement | string)[] = []) {
  const el = document.createElement(name);
  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, value);
  }
  for (const child of children) {
    if (typeof child === 'string') {
      const text = document.createTextNode(child);
      el.appendChild(text);
    } else {
      el.appendChild(child);
    }
  }
  return el;
}
export class LibraryBlockWidgetType extends WidgetType {
  private options: LibraryBlockWidgetOptions | null;
  private container: HTMLSpanElement;
  private root: Root | null;
  private dom: HTMLSpanElement | undefined;
  private mounted: boolean;

  constructor(options: LibraryBlockWidgetOptions | null) {
    super();
    this.options = options;
    this.container = document.createElement('span');
    this.root = null;
    this.mounted = false;
  }
  eq(widget: LibraryBlockWidgetType): boolean {
    const { onAddLibrary, onRename, ...prevOptions } = this.options ?? {};
    const { onAddLibrary: nextOnAddLibrary, onRename: nextOnRename, ...nextOptions } = widget.options ?? {};
    return isEqual(prevOptions, nextOptions);
  }

  toDOM() {
    if (!this.options) {
      return this.container;
    }

    if (this.root) {
      this.destroy();
    }

    if (!this.mounted) {
      // Synchronized rendering to avoid jitter
      this.renderLibraryBlock(this.options);
      this.mounted = true;
    }

    return this.container;
  }

  renderLibraryBlock(options: LibraryBlockWidgetOptions) {
    const dom = createElement(
      'span',
      {
        class: cls('library-block-container', options.className, { 'opacity-70': !options.hightlight }),
      },
      [
        createElement('img', {
          src: options.blockDataInfo?.icon || '',
          class: cls('library-block-icon', {
            'opacity-70': !options.hightlight,
          }),
        }),
        createElement(
          'span',
          {
            class: 'library-block-content',
          },
          [options.content],
        ),
      ],
    );

    this.dom = dom;
    this.container.appendChild(dom);
  }

  destroy() {
    this.mounted = false;

    if (this.root) {
      /**
       * Fix React warning: Attempted to synchronously unmount a root while React was already rendering
       * https://stackoverflow.com/questions/73043828/how-to-unmount-something-created-with-createroot-properly
       */
      setTimeout(() => {
        this.root?.unmount();
      }, 0);
      this.root = null;
    }

    if (this.dom) {
      this.dom.remove();
      this.dom = undefined;
    }

    this.options = null;
  }
}
