import { JSX } from 'solid-js/jsx-runtime';
import { render } from 'solid-js/web';

export enum SETTINGS {
  DIM_INACTIVE = 'dimInactiveControlled',
  DIM_TYPING = 'dimInactiveWhileTyping',
  FOCUS_MESSAGE_DOT = 'focusMessageDot',
  FOCUS_MESSAGE_UNDERLINE = 'focusMessageUnderline',
  REQUIRE_PUNCTUATION_END = 'requirePunctuationEnd',
  REQUIRE_PUNCTUATION_END_MSG = 'requirePunctuationEndMsg',
  HILIGHT_MESSAGE_TYPE = 'hilightMessageType',
  EXPECTED_VERSION_OVERRIDE = 'EXPECTED_VERSION_OVERRIDE',
}

// Maps JSX Elements to Modapp Elements
export function j2m(renderer: () => JSX.Element) {
  return {
    render: (div) => render(renderer, div),
    unrender: () => void 0,
  };
}
