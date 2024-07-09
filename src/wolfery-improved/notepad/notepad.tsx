import { Show, createSignal } from 'solid-js';
import { CharModel } from '../../types/wolfery';
import { j2m } from '../common';
import styles from '../style.module.css';
import formatText from '../wolfery-lib/formatText';

export function registerNotepadTool() {
  const pageChar = unsafeWindow?.app?.getModule('pageChar');
  const charPages = unsafeWindow?.app?.getModule('charPages');

  pageChar.addTool({
    id: 'wimp-notepad',
    sortOrder: 990,
    componentFactory: (ctrl, char) =>
      j2m(() =>
        NotesButton(() => {
          charPages.openPage(ctrl.id, char.id, (ctrl, char, state, close) => ({
            component: j2m(() => NotesPage({ ctrl, char })),
            title: 'Notes',
            onClose: close,
          }));
        }),
      ),
  });

  return () => pageChar.removeTool('wimp-notepad');
}

export const NotesButton = (click: () => void) => {
  return (
    <button onClick={() => click()} class={styles.notepadBtn}>
      📝
    </button>
  );
};

const [value, setValue] = createSignal<undefined | string>();
const [edit, setEdit] = createSignal(false);
const [textRef, setTextRef] = createSignal<HTMLTextAreaElement>();
function NotesPage({ char }: { ctrl: CharModel; char: CharModel }) {
  const playerId = unsafeWindow?.app?.getModule('player')?.getPlayer()?.id;
  if (playerId) {
    unsafeWindow?.app
      ?.getModule('api')
      .get(`note.player.${playerId}.note.${char.id}`)
      .then(({ text } = { text: '' }) => {
        setValue(text);
      });
  }
  return (
    <div class={styles.notepad}>
      <div>
        <h3>
          {char.name} {char.surname}
        </h3>
        <button
          type="button"
          class="iconbtn small"
          onClick={() => setEdit(!edit())}
        >
          <i aria-hidden="true" class="fa fa-pencil"></i>
        </button>
      </div>

      <Show when={!!value() && !edit()}>
        <p innerHTML={formatText(value(), {})}>...</p>
      </Show>
      <Show when={!value() && !edit()}>
        <p class={styles.placeholder}>No note set for this character yet.</p>
      </Show>
      <Show when={edit()}>
        <textarea ref={setTextRef} value={value()}></textarea>
        <button
          type="button"
          class="btn medium primary"
          onClick={() => saveNote(playerId, char.id)}
        >
          Save
        </button>
      </Show>
    </div>
  );
}

function saveNote(playerId, characterId) {
  const element = textRef();
  element.disabled = true;
  const value = element.value;
  const api = unsafeWindow?.app?.getModule('api');
  const resId = `note.player.${playerId}.note.${characterId}`;
  api
    .call(resId, 'set', { text: value })
    .then(() => api.get(resId))
    .then(({ text } = { text: '' }) => {
      // For some reason, fetching the data doesn't work
      // immediately after saving every time.
      if (text !== value) {
        setTimeout(() => {
          api.get(resId).then(({ text } = { text: '' }) => {
            setValue(text);
            setEdit(false);
          });
        }, 200);
      } else {
        setValue(text);
        setEdit(false);
      }
    });
}
