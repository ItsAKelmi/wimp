import { stylesheet } from './style.module.css';
import { default as cssDimCommon } from './css-tweaks/dim-common.css';
import { default as cssDimInactive } from './css-tweaks/dim-inactive.css';
import { default as cssDimWhileTyping } from './css-tweaks/dim-while-typing.css';
import { default as cssPrivateHilight } from './css-tweaks/private-hilight.css';
import { default as cssGrowConsoleDesktop } from './css-tweaks/grow-console-desktop.css';
import { default as cssGrowConsoleMobile } from './css-tweaks/grow-console-mobile.css';
import { SETTINGS } from './common';
export function rebuildStyles() {
  let style = document.querySelector('#wimp-styles');

  if (!style) {
    style = document.createElement('style');
    style.id = 'wimp-styles';
    document.head.appendChild(style);
  }

  const dimInactiveControlled = GM_getValue(SETTINGS.DIM_INACTIVE, false),
    dimInactiveWhileTyping = GM_getValue(SETTINGS.DIM_TYPING, false),
    focusMessageDot = GM_getValue(SETTINGS.FOCUS_MESSAGE_DOT, false),
    focusMessageUnderline = GM_getValue(
      SETTINGS.FOCUS_MESSAGE_UNDERLINE,
      false,
    ),
    growConsoleDesktop = GM_getValue(SETTINGS.GROW_CONSOLE_DESKTOP, false),
    growConsoleMobile = GM_getValue(SETTINGS.GROW_CONSOLE_MOBILE, false);
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
  if (growConsoleDesktop) {
    stylesText += cssGrowConsoleDesktop;
  }
  if (growConsoleMobile) {
    stylesText += cssGrowConsoleMobile;
  }

  if (focusMessageDot || focusMessageUnderline) {
    const charFocus = unsafeWindow?.app?.getModule('charFocus');
    for (const ctrlId in charFocus.settings) {
      const focus = charFocus.settings[ctrlId].focus.props;
      for (const charId in focus) {
        const { color } = focus[charId];
        if (color) {
          stylesText += `\n.wimp-f-${ctrlId}-${charId} {
        --wimp-focus-color: ${color};
        ${focusMessageDot ? '--wimp-focus-dot-display: inline-block;' : ''}
        ${focusMessageUnderline ? '--wimp-focus-underline-thickness: 2px;' : ''}
        }`;
        }
      }
    }
  }

  const hilightMessageType = GM_getValue(SETTINGS.HILIGHT_MESSAGE_TYPE, false);
  if (hilightMessageType) stylesText += cssPrivateHilight;

  style.textContent = stylesText;
}
