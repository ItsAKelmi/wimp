import './meta.js?userscript-metadata';
import './app';
import { observe } from '@violentmonkey/dom';
import { render } from 'solid-js/web';
import { Settings, SettingsButton } from './Settings';
import { stylesheet } from './style.module.css';
import { default as cssDimCommon } from './css-tweaks/dim-common.css';
import { default as cssDimInactive } from './css-tweaks/dim-inactive.css';
import { default as cssDimWhileTyping } from './css-tweaks/dim-while-typing.css';

const expectedVersion = '1.58.1';
let version = undefined;
unsafeWindow.WIMPPatches = '';
const style = document.createElement('style');

function fixMutes() {
  unsafeWindow.app.getModule('mute').isMutedChar = function (charId: string) {
    const player = this.module.player.getPlayer();
    const playerId = player.id;
    return !!(
      charId &&
      (player?.mutedChars.props[charId] ||
        player?.mutedChars.props[playerId + charId])
    );
  };
  unsafeWindow.WIMPPatches += 'mute.isMutedChar;';
}

GM_addValueChangeListener('dimInactiveControlled', () => rebuildStyles());
GM_addValueChangeListener('dimInactiveWhileTyping', () => rebuildStyles());

function rebuildStyles() {
  const dimInactiveControlled = GM_getValue('dimInactiveControlled', false),
    dimInactiveWhileTyping = GM_getValue('dimInactiveWhileTyping', false);
  let stylesText = stylesheet;
  if (dimInactiveControlled) {
    stylesText += cssDimInactive;
  }
  if (dimInactiveWhileTyping) {
    stylesText += cssDimWhileTyping;
  }
  if (dimInactiveControlled || dimInactiveWhileTyping) {
    stylesText += cssDimCommon;
  }
  style.textContent = stylesText;
}

function applyMods() {
  unsafeWindow?.app?.getModule('toaster').open({
    content: 'Wolfery Improved: Applying mods...',
    autoclose: 2000,
    closeOn: 'click',
  });

  console.info('Applying WIMP mods...');
  // Insert styles
  observe(document.body, () => {
    const node = document.querySelector('.console-controlledchar');
    if (node) {
      rebuildStyles();
      document.head.appendChild(style);
      console.info('...applied WIMP style element.');
      return true;
    }
  });

  // Apply mutefix
  const foo = setInterval(() => {
    if (unsafeWindow?.app?.getModule('mute')) {
      fixMutes();
      console.info('...patched mutes for version 1.58.1');
      clearInterval(foo);
    }
  }, 100);

  unsafeWindow?.app?.getModule('playerTabs').addTab({
    id: 'wimp',
    title: 'WIMP Settings',
    sortOrder: 9999,
    tabFactory: (click) => ({
      render: (div) => render(() => SettingsButton(click), div),
      unrender: () => void 0,
    }),
    factory: () => ({
      component: {
        title: 'WIMP Settings',
        render: (div) => render(Settings, div),
        unrender: () => void 0,
      },
    }),
  });

  if (expectedVersion !== version) {
    unsafeWindow?.app
      ?.getModule('toaster')
      .openError(
        `WIMP: version mismatch, expected ${expectedVersion} got ${version}`,
      );
  }
}

const foo = setInterval(() => {
  // Checking that expected modules have finished initializing...
  const maybeCharLog = unsafeWindow?.app?.getModule('charLog');
  const maybePlayer = unsafeWindow?.app?.getModule('player');
  const maybeToaster = unsafeWindow?.app?.getModule('toaster');
  const maybeVersion = unsafeWindow?.app
    ?.getModule('info')
    ?.getClient()?.version;
  if (maybeCharLog && maybePlayer && maybeVersion && maybeToaster) {
    // charLog = maybeCharLog;
    // player = maybePlayer;
    version = maybeVersion;
    applyMods();
    clearInterval(foo);
  }
}, 100);
