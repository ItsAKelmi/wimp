import './meta.js?userscript-metadata';
import { observe } from '@violentmonkey/dom';
import { Settings, SettingsButton } from './Settings';
import { SETTINGS } from './common';
import { fixMutes } from './fixMutes';
import { j2m } from './common';
import { applyWhisperMessageReplacements } from './whisperMessageReplacements';
import { rebuildStyles } from './rebuildStyles';
import { hijackEnter, hookCommandStyle } from './antiMav';
import { VersionMismatchToast } from './versionMismatch';

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
GM_addValueChangeListener(
  SETTINGS.REQUIRE_PUNCTUATION_END,
  (a, b, newValue) => {
    applyMods();
    if (newValue) unsafeWindow.location.reload();
  },
);
GM_addValueChangeListener(
  SETTINGS.REQUIRE_PUNCTUATION_END_MSG,
  (a, b, newValue) => {
    applyMods();
    if (newValue) unsafeWindow.location.reload();
  },
);
GM_addValueChangeListener(SETTINGS.HILIGHT_MESSAGE_TYPE, (a, b, newValue) => {
  rebuildStyles();
  applyMods();
  if (newValue) unsafeWindow.location.reload();
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

  const requirePunctuationEnd =
    GM_getValue(SETTINGS.REQUIRE_PUNCTUATION_END, false) ||
    GM_getValue(SETTINGS.REQUIRE_PUNCTUATION_END_MSG, false);
  if (requirePunctuationEnd) {
    undoMods.push(hijackEnter());
  }

  undoMods.push(hookCommandStyle());
}

function compareMinorVersion(a, b) {
  a = a.split('.');
  b = b.split('.');
  return a.length > 1 && b.length > 1 && a[0] === b[0] && a[1] === b[1];
}
function initializeWimp() {
  const expectedVersionOverride = GM_getValue(
    SETTINGS.EXPECTED_VERSION_OVERRIDE,
    false,
  );
  if (expectedVersion !== version && expectedVersionOverride !== version) {
    unsafeWindow?.app?.getModule('toaster').open({
      title: 'WIMP Version Mismatch',
      closeOn: 'button',
      type: compareMinorVersion(version, expectedVersion) ? 'info' : 'warn',
      content: (click) =>
        j2m(() =>
          VersionMismatchToast({
            click,
            expectedVersion,
            gotVersion: version,
            onLoadAnyway: () => {
              GM_setValue(SETTINGS.EXPECTED_VERSION_OVERRIDE, version);
              window.location.reload();
              initializeWimp();
              click();
            },
          }),
        ),
    });
    return;
  }

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

  const playerTabs = unsafeWindow?.app?.getModule('playerTabs');
  playerTabs.removeTab('wimp');
  playerTabs.addTab({
    id: 'wimp',
    sortOrder: 9999,
    tabFactory: (click) => j2m(() => SettingsButton(click)),
    factory: () => ({
      title: 'WIMP Settings',
      component: j2m(Settings),
    }),
  });
  console.info('WIMP', '...injected settings tab');

  applyMods();
}

const foo = setInterval(() => {
  // Checking that expected modules have finished initializing...
  const maybeCharLog = unsafeWindow?.app?.getModule('charLog');
  const maybePlayer = unsafeWindow?.app?.getModule('player');
  const maybeToaster = unsafeWindow?.app?.getModule('toaster');
  const maybeCharFocus = unsafeWindow?.app?.getModule('charFocus');
  const maybeMute = unsafeWindow?.app?.getModule('mute');
  const maybeConsole = unsafeWindow?.app?.getModule('console');
  const maybeVersion = unsafeWindow?.app
    ?.getModule('info')
    ?.getClient()?.version;
  if (
    maybeCharLog &&
    maybePlayer &&
    maybeVersion &&
    maybeToaster &&
    maybeCharFocus &&
    maybeMute &&
    maybeConsole
  ) {
    // player = maybePlayer;
    version = maybeVersion;
    initializeWimp();
    clearInterval(foo);
  }
}, 100);
