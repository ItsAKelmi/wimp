import { createSignal } from 'solid-js';
// import { render } from 'solid-js/web';
// global CSS
// import globalCss from './style.css';
// CSS modules
import styles from './style.module.css';
import { SETTINGS } from './common';

export const SettingsButton = (click: () => undefined) => {
  return (
    <button onClick={() => click()} class={styles.settingsBtn}>
      🐺
    </button>
  );
};

// == dimInactiveControlled ==
function updateDimInactiveControlled(value: boolean) {
  GM_setValue(SETTINGS.DIM_INACTIVE, value);
}
const [dimInactiveControlled, setDimInactiveControlled] = createSignal(
  GM_getValue(SETTINGS.DIM_INACTIVE, false),
);
GM_addValueChangeListener(
  SETTINGS.DIM_INACTIVE,
  (name, oldValue, newValue: boolean) =>
    setDimInactiveControlled(() => newValue),
);

// == dimInactiveWhileTyping ==
function updateDimInactiveWhileTyping(value: boolean) {
  GM_setValue(SETTINGS.DIM_TYPING, value);
}
const [dimInactiveWhileTyping, setDimInactiveWhileTyping] = createSignal(
  GM_getValue(SETTINGS.DIM_TYPING, false),
);
GM_addValueChangeListener(
  SETTINGS.DIM_TYPING,
  (name, oldValue, newValue: boolean) =>
    setDimInactiveWhileTyping(() => newValue),
);

// == focusMessageDot ==
function updateFocusMessageDot(value: boolean) {
  GM_setValue(SETTINGS.FOCUS_MESSAGE_DOT, value);
}
const [focusMessageDot, setFocusMessageDot] = createSignal(
  GM_getValue(SETTINGS.FOCUS_MESSAGE_DOT, false),
);
GM_addValueChangeListener(
  SETTINGS.FOCUS_MESSAGE_DOT,
  (name, oldValue, newValue: boolean) => setFocusMessageDot(() => newValue),
);

// focusMessageUnderline
function updateFocusMessageUnderline(value: boolean) {
  GM_setValue(SETTINGS.FOCUS_MESSAGE_UNDERLINE, value);
}
const [focusMessageUnderline, setFocusMessageUnderline] = createSignal(
  GM_getValue(SETTINGS.FOCUS_MESSAGE_UNDERLINE, false),
);
GM_addValueChangeListener(
  SETTINGS.FOCUS_MESSAGE_UNDERLINE,
  (name, oldValue, newValue: boolean) =>
    setFocusMessageUnderline(() => newValue),
);

export function Settings() {
  return (
    <div class={styles.settings}>
      <h3 class="margin-bottom-m">Anti-MAV</h3>
      <p>Character selector</p>
      <label class={styles.checkbox}>
        <input
          type="checkbox"
          checked={dimInactiveControlled()}
          onChange={(e) => updateDimInactiveControlled(e.currentTarget.checked)}
        />
        <span>Dim inactive characters above the command box</span>
      </label>
      <label class={styles.checkbox}>
        <input
          type="checkbox"
          checked={dimInactiveWhileTyping()}
          onChange={(e) =>
            updateDimInactiveWhileTyping(e.currentTarget.checked)
          }
        />
        <span>Hilight active character while focused on the command box</span>
      </label>
      <h3>Focus</h3>
      <p>Messages and whispers</p>
      <label class={styles.checkbox}>
        <input
          type="checkbox"
          checked={focusMessageDot()}
          onChange={(e) => updateFocusMessageDot(e.currentTarget.checked)}
        />
        <span>Add a focus colored dot in front of recipients names</span>
      </label>
      <label class={styles.checkbox}>
        <input
          type="checkbox"
          checked={focusMessageUnderline()}
          onChange={(e) => updateFocusMessageUnderline(e.currentTarget.checked)}
        />
        <span>Add a focus colored underlining of recipients names</span>
      </label>
    </div>
  );
}
