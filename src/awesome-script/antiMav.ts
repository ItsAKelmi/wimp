import type { ConsoleState } from '../types/wolfery';
import { SETTINGS } from './common';

export function hookCommandStyle() {
  const con = unsafeWindow.app.getModule('console');

  con.model.on('change', hookEditorState);

  return () => {
    con.model?.off('change', hookEditorState);
    con.model?.state?.off('change', updatePrivateStyle);
  };
}

function hookEditorState(prev, next /*namespace, _*/) {
  console.log(next);

  if (!next.state) return;
  next.state.on('change', updatePrivateStyle);
}

function updatePrivateStyle(old, next /*namespace, _*/) {
  if (!next.doc) {
    document.body.classList.remove('wimp-private');
    document.body.classList.remove('wimp-whisper');
    document.body.classList.remove('wimp-message');
    return;
  }
  const first = next.doc.match(firstRE)?.[1];

  if (!first || !privateCommands.includes(first)) {
    document.body.classList.remove('wimp-private');
    document.body.classList.remove('wimp-whisper');
    document.body.classList.remove('wimp-message');
    return;
  }

  if (msgCommands.includes(first)) {
    document.body.classList.add('wimp-message');
  } else {
    document.body.classList.add('wimp-whisper');
  }
  document.body.classList.add('wimp-private');
}

let prev = '';
export function hijackEnter() {
  const con = unsafeWindow.app?.getModule('console');
  const oldHandler = con.keymapModel['Enter'];
  if (oldHandler === enterHandler) return () => void 0;

  con.addKeymap('Enter', enterHandler);

  return () => {
    con.addKeymap('Enter', oldHandler);
  };
}

const punctuationRE = /^.+[."~?!]$/s;

const enterHandler = {
  run(consoleState: ConsoleState) {
    const val = consoleState.doc;
    console.log(consoleState, 'Enter', val);

    // False will allow the lower-stacked handlers to run
    if (prev === val) return false;
    if (checkRules(consoleState)) return false;

    const charLog = unsafeWindow.app?.getModule('charLog');
    charLog.logInfo(
      unsafeWindow.app?.getModule('player').getActiveChar(),
      'Are you sure you meant to send that? Press enter again to send anyway.',
      { noMenu: true },
    );
    prev = val;
    // True will keep other handlers from running
    return true;
  },
};

const firstRE = /^\s*(\w+|[>:])/;
const mavCommands = [':', '>', 'pose', 'say', 'ooc'];
const msgCommands = ['m', 'p', 'msg', 'page', 'message'];
const privateCommands = [...msgCommands, 'w', 'wh', 'whisper'];
function checkRules(consoleState: ConsoleState) {
  const val = consoleState.doc;
  const first = val.match(firstRE)?.[1];

  // If command does not fulfill punctuation requirements...
  const shouldCheckMav =
    GM_getValue(SETTINGS.REQUIRE_PUNCTUATION_END) &&
    mavCommands.includes(first);
  const shouldCheckMsg =
    GM_getValue(SETTINGS.REQUIRE_PUNCTUATION_END_MSG) &&
    privateCommands.includes(first);
  console.log('antimav', shouldCheckMav, shouldCheckMsg, first);
  if ((shouldCheckMav || shouldCheckMsg) && !punctuationRE.test(val)) {
    // Not a well formed command.
    return false;
  }

  return true;
}
