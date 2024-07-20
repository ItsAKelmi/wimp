import { onCleanup, Show } from 'solid-js';
import styles from '../style.module.css';
import { render } from 'solid-js/web';
import { j2m } from '../common';

// Documentation at https://www.datamuse.com/api/
const APIURL = 'https://api.datamuse.com/words';

async function getWordDefinitions(word: string) {
  const reqUrl = new URL(APIURL);
  reqUrl.searchParams.set('sp', word);
  reqUrl.searchParams.set('qe', 'sp');
  reqUrl.searchParams.set('md', 'dp');
  reqUrl.searchParams.set('max', '1');
  const req = await fetch(reqUrl);
  const json = await req.json();
  return json?.[0]?.defs?.map((str: string) => str?.split?.('\t')) ?? [];
}

async function getWordsLike(needle: string) {
  const reqUrl = new URL(APIURL);
  reqUrl.searchParams.set('ml', needle);
  if (!needle.includes(' ')) reqUrl.searchParams.set('qe', 'ml');
  reqUrl.searchParams.set('md', 'dp');
  reqUrl.searchParams.set('max', '6');
  const req = await fetch(reqUrl);
  const json = await req.json();
  return json?.map((s) => ({
    ...s,
    defs: s?.defs?.map((str: string) => str?.split?.('\t')) ?? [],
  }));
}

function defineSelection() {
  const selection = unsafeWindow?.getSelection();
  if (selection.type !== 'Range') return;
  const text = selection.toString().trim();
  getWordDefinitions(text)
    .then((definitions: string[]) => {
      if (definitions.length) {
        unsafeWindow?.app?.getModule('toaster').open({
          title: `Define: ${text}`,
          content: j2m(() =>
            definitions.slice(0, 5).map((d) => (
              <p>
                {d[0]}. {d[1]}
              </p>
            )),
          ),
          closeOn: 'button',
        });
      } else {
        unsafeWindow?.app?.getModule('toaster').open({
          title: `Define: ${text}`,
          content: 'No definitions found',
          closeOn: 'click',
          autoclose: 2000,
        });
      }
    })
    .catch(() => {
      unsafeWindow?.app?.getModule('toaster').open({
        type: 'warn',
        title: `Define: ${text}`,
        content: 'Error while fetching data',
        closeOn: 'click',
        autoclose: 2000,
      });
    });
}
function wordsLikeSelection(): void {
  const selection = unsafeWindow?.getSelection();
  if (selection.type !== 'Range') return;
  const text = selection.toString().trim();
  getWordsLike(text)
    .then((words) => {
      if (words.length) {
        unsafeWindow?.app?.getModule('toaster').open({
          title: `Words like: ${text}`,
          content: j2m(() =>
            words.map(({ word, defs: d }) => (
              <>
                <h4>{word}</h4>
                <Show
                  when={d.length > 0}
                  fallback={<p>No definitions found</p>}
                >
                  <p>
                    {d[0][0]}. {d[0][1]}
                  </p>
                </Show>
              </>
            )),
          ),
          closeOn: 'button',
        });
      } else {
        unsafeWindow?.app?.getModule('toaster').open({
          title: `Words like: ${text}`,
          content: 'No results found',
          closeOn: 'click',
          autoclose: 2000,
        });
      }
    })
    .catch(() => {
      unsafeWindow?.app?.getModule('toaster').open({
        type: 'warn',
        title: `Words like: ${text}`,
        content: 'Error while fetching data',
        closeOn: 'click',
        autoclose: 2000,
      });
    });
}

function isChildOf(el: HTMLElement | Node, classNames: string | string[]) {
  if (!Array.isArray(classNames)) classNames = [classNames];
  if (!el.parentElement) return false;
  if (
    classNames.some((className) =>
      el.parentElement?.classList?.contains(className),
    )
  )
    return true;
  return isChildOf(el.parentElement, classNames);
}

function DatamuseBtn({
  title = 'Define',
  callback = () => defineSelection(),
  triggerWithin = ['charlog--comm', 'charlog--ooc'],
  scrollContainerQuery = '.charlog',
  allowSpaces = false,
}) {
  let el: HTMLDivElement;
  let currentScrollElement: HTMLElement;
  let scrollBounds: DOMRect;
  let currentSelectionText: string;
  let currentNode: Node;
  let currentOffset: number;
  let pending = false;
  const onSelectionChange = () => {
    if (pending) return;
    pending = true;
    unsafeWindow.requestAnimationFrame(() => {
      const sel = document.getSelection();

      if (
        !currentScrollElement ||
        sel.toString() !== currentSelectionText ||
        sel.anchorNode !== currentNode ||
        sel.anchorOffset !== currentOffset
      ) {
        currentSelectionText = sel.toString();
        currentNode = sel.anchorNode;
        currentOffset = sel.anchorOffset;

        if (
          sel.type !== 'Range' ||
          !isChildOf(sel.anchorNode, triggerWithin) ||
          (!allowSpaces && sel.toString().trim().includes(' '))
        ) {
          if (currentScrollElement) {
            currentScrollElement.removeEventListener(
              'scroll',
              onSelectionChange,
            );
            currentScrollElement = undefined;
          }
          el.style.display = 'none';
          pending = false;
          return;
        }

        const newScrollElement: HTMLElement =
          unsafeWindow.document.querySelector(
            `${scrollContainerQuery} .simplebar-content-wrapper`,
          );

        // Weird UI state
        if (!newScrollElement) return;

        if (currentScrollElement !== newScrollElement) {
          currentScrollElement?.removeEventListener(
            'scroll',
            onSelectionChange,
          );
          currentScrollElement = newScrollElement;
          currentScrollElement.addEventListener('scroll', onSelectionChange);
          scrollBounds = currentScrollElement.getBoundingClientRect();
        }
      }

      const selBox = sel.getRangeAt(0).getClientRects()[0];
      if (!scrollBounds)
        scrollBounds = currentScrollElement.getBoundingClientRect();
      if (
        // Only vertical scrolling on Wolfery for now
        scrollBounds.top <= selBox.top &&
        scrollBounds.bottom >= selBox.bottom
      ) {
        el.style.display = 'block';
        el.style.left = `${selBox.left + selBox.width / 2}px`;
        el.style.top = `${selBox.top - selBox.height - 6}px`;
        el.style.width = `${selBox.width}px`;
        el.style.height = `${selBox.height}px`;
      } else {
        el.style.display = 'none';
      }
      pending = false;
    });
  };

  unsafeWindow?.document.addEventListener('selectionchange', onSelectionChange);
  onCleanup(() => {
    unsafeWindow?.document.removeEventListener(
      'selectionchange',
      onSelectionChange,
    );
    if (currentScrollElement)
      currentScrollElement.removeEventListener('scroll', onSelectionChange);
  });
  return (
    <div class={styles['wimp-dm-define']} ref={el}>
      <button onclick={callback}>{title}</button>
    </div>
  );
}

export function applyDatamuse() {
  if (unsafeWindow.app?.getModule('layout').currentLayout !== 'desktop') {
    console.info(
      'WIMP',
      '...skipping Datamuse init because not in desktop layout',
    );
    return () => void 0;
  }

  const con = unsafeWindow.app?.getModule('console');
  con.addKeymap('alt-d', {
    run: () => {
      wordsLikeSelection();
      return true;
    },
  });

  con.addKeymap('Escape', {
    run: () => {
      const toaster = unsafeWindow?.app?.getModule('toaster');

      const c = toaster.collection;
      if (!c.length) return false;

      const lastId = c.atIndex(c.length - 1).id;
      toaster.close(lastId);

      return true;
    },
  });

  const el = unsafeWindow?.document.createElement('div');
  unsafeWindow?.document.body.appendChild(el);
  render(
    () => (
      <>
        <DatamuseBtn />
        <DatamuseBtn
          triggerWithin={['console-editor']}
          scrollContainerQuery=".console--layoutdesktop"
          title="Search"
          allowSpaces={true}
          callback={() => wordsLikeSelection()}
        />
      </>
    ),
    el,
  );

  return () => {
    con.removeKeymap('Escape');
    con.removeKeymap('alt-d');
    unsafeWindow?.document.body.removeChild(el);
  };
}
