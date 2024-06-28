import { createSignal } from 'solid-js';
// import { render } from 'solid-js/web';
// global CSS
// import globalCss from './style.css';
// CSS modules
import styles from './style.module.css';

export const SettingsButton = (click: () => undefined) => {
  return (
    <button onClick={() => click()} class={styles.settingsBtn}>
      🐺
    </button>
  );
};

function updateDimInactiveControlled(value: boolean) {
  console.log('Toggled dimInactiveControlled', value);
  GM_setValue('dimInactiveControlled', value);
}

function updateDimInactiveWhileTyping(value: boolean) {
  console.log('Toggled dimInactiveWhileTyping ' + value);
  GM_setValue('dimInactiveWhileTyping', value);
}
const [dimInactiveControlled, setDimInactiveControlled] = createSignal(
  GM_getValue('dimInactiveControlled', false),
);
const [dimInactiveWhileTyping, setDimInactiveWhileTyping] = createSignal(
  GM_getValue('dimInactiveWhileTyping', false),
);

GM_addValueChangeListener(
  'dimInactiveControlled',
  (name, oldValue, newValue: boolean) =>
    setDimInactiveControlled(() => newValue),
);
GM_addValueChangeListener(
  'dimInactiveWhileTyping',
  (name, oldValue, newValue: boolean) =>
    setDimInactiveWhileTyping(() => newValue),
);

export function Settings() {
  return (
    <div class={styles.settings}>
      <h3 class="margin-bottom-m">Anti-MAV</h3>
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
    </div>
  );
}
