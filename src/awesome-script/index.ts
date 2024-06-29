import './meta.js?userscript-metadata';
import { observe } from '@violentmonkey/dom';
import { Settings, SettingsButton } from './Settings';
import { SETTINGS } from './common';
import { fixMutes } from './fixMutes';
import { j2m } from './common';
import { applyWhisperMessageReplacements } from './whisperMessageReplacements';
import { rebuildStyles } from './rebuildStyles';

const expectedVersion = '1.58.1';
let version = undefined;
unsafeWindow.WIMPPatches = '';

GM_addValueChangeListener(SETTINGS.DIM_INACTIVE, () => rebuildStyles());
GM_addValueChangeListener(SETTINGS.DIM_TYPING, () => rebuildStyles());
GM_addValueChangeListener(SETTINGS.FOCUS_MESSAGE_DOT, () => {
  rebuildStyles();
  applyMods();
});
GM_addValueChangeListener(SETTINGS.FOCUS_MESSAGE_UNDERLINE, () => {
  rebuildStyles();
  applyMods();
});

let undoMods = [];
function applyMods() {
  for (const f of undoMods) f();
  undoMods = [];

  const charLog = unsafeWindow?.app?.getModule('charLog');
  const charFocus = unsafeWindow?.app?.getModule('charFocus');
  if (!charLog || !charFocus) {
    unsafeWindow?.app
      ?.getModule('toaster')
      .openError(`WIMP: expected app modules not initialized`);
    return;
  }

  const focusMessageDot = GM_getValue(SETTINGS.FOCUS_MESSAGE_DOT, false),
    focusMessageUnderline = GM_getValue(
      SETTINGS.FOCUS_MESSAGE_UNDERLINE,
      false,
    );
  if (focusMessageDot || focusMessageUnderline) {
    undoMods.push(applyWhisperMessageReplacements(charFocus, charLog));
  }
}

function initializeWimp() {
  unsafeWindow?.app?.getModule('toaster').open({
    content: 'Wolfery Improved: Applying mods...',
    autoclose: 2000,
    closeOn: 'click',
  });

  console.info('WIMP', 'Applying WIMP mods...');
  // Insert styles
  observe(document.body, () => {
    const node = document.querySelector('.console-controlledchar');
    if (node) {
      rebuildStyles();
      console.info('WIMP', '...applied WIMP style element.');
      return true;
    }
  });

  // Apply mutefix
  fixMutes();
  console.info('WIMP', '...patched mutes for version 1.58.1');

  unsafeWindow?.app?.getModule('playerTabs').addTab({
    id: 'wimp',
    sortOrder: 9999,
    tabFactory: (click) => j2m(() => SettingsButton(click)),
    factory: () => ({
      title: 'WIMP Settings',
      component: j2m(Settings),
    }),
  });
  console.info('WIMP', '...injected settings tab');

  if (expectedVersion !== version) {
    unsafeWindow?.app
      ?.getModule('toaster')
      .openError(
        `WIMP: version mismatch, expected ${expectedVersion} got ${version}`,
      );
  }

  applyMods();
}

const foo = setInterval(() => {
  // Checking that expected modules have finished initializing...
  const maybeCharLog = unsafeWindow?.app?.getModule('charLog');
  const maybePlayer = unsafeWindow?.app?.getModule('player');
  const maybeToaster = unsafeWindow?.app?.getModule('toaster');
  const maybeCharFocus = unsafeWindow?.app?.getModule('charFocus');
  const maybeMute = unsafeWindow?.app?.getModule('mute');
  const maybeVersion = unsafeWindow?.app
    ?.getModule('info')
    ?.getClient()?.version;
  if (
    maybeCharLog &&
    maybePlayer &&
    maybeVersion &&
    maybeToaster &&
    maybeCharFocus &&
    maybeMute
  ) {
    // player = maybePlayer;
    version = maybeVersion;
    initializeWimp();
    clearInterval(foo);
  }
}, 100);
