import { children, createSignal, onCleanup } from 'solid-js';
// import { render } from 'solid-js/web';
// global CSS
// import globalCss from './style.css';
// CSS modules
import styles from './style.module.css';
import { SETTINGS } from './common';

export const SettingsButton = (click: () => void) => {
  return (
    <button onClick={() => click()} class={styles.settingsBtn}>
      🐺
    </button>
  );
};

function SettingCheckbox({ settingKey, children: inner }) {
  const [value, setValue] = createSignal(GM_getValue(settingKey, false));
  const listener = GM_addValueChangeListener(
    settingKey,
    (name, oldValue, newValue: boolean) => setValue(() => newValue),
  );

  onCleanup(() => GM_removeValueChangeListener(listener));

  const ch = children(() => inner);
  return (
    <label class={styles.checkbox}>
      <input
        type="checkbox"
        checked={value()}
        onChange={(e) => GM_setValue(settingKey, e.currentTarget.checked)}
      />
      <span>{ch()}</span>
    </label>
  );
}

export function Settings() {
  return (
    <div class={styles.settings}>
      <h3>Reloads</h3>
      <p>Some of these options require a reload of the page to enable.</p>
      <h3>Anti-MAV</h3>
      <fieldset>
        <SettingCheckbox settingKey={SETTINGS.DIM_INACTIVE}>
          Dim inactive characters
        </SettingCheckbox>
        <SettingCheckbox settingKey={SETTINGS.DIM_TYPING}>
          Hilight active character while focused on the command box
        </SettingCheckbox>
        <SettingCheckbox settingKey={SETTINGS.HILIGHT_MESSAGE_TYPE}>
          Change command box look if a private message is being written
        </SettingCheckbox>
      </fieldset>
      <fieldset>
        <legend>
          Warn if trying to send a something that doesn't end with
          <span title='one of .?!"~'> punctuation</span>...
        </legend>
        <SettingCheckbox settingKey={SETTINGS.REQUIRE_PUNCTUATION_END}>
          When sending it to a room
        </SettingCheckbox>
        <SettingCheckbox settingKey={SETTINGS.REQUIRE_PUNCTUATION_END_MSG}>
          When whispering or messaging
        </SettingCheckbox>
      </fieldset>

      <h3>Focus</h3>
      <fieldset>
        <legend>Decorate recipients names with a...</legend>
        <SettingCheckbox settingKey={SETTINGS.FOCUS_MESSAGE_DOT}>
          Focus colored dot
        </SettingCheckbox>
        <SettingCheckbox settingKey={SETTINGS.FOCUS_MESSAGE_UNDERLINE}>
          Focus colored underlining
        </SettingCheckbox>
      </fieldset>
    </div>
  );
}
