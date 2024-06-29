import { JSX } from 'solid-js/jsx-runtime';
import { render } from 'solid-js/web';

export enum SETTINGS {
  DIM_INACTIVE = 'dimInactiveControlled',
  DIM_TYPING = 'dimInactiveWhileTyping',
  FOCUS_MESSAGE_DOT = 'focusMessageDot',
  FOCUS_MESSAGE_UNDERLINE = 'focusMessageUnderline',
}

// Maps JSX Elements to Modapp Elements
export function j2m(renderer: () => JSX.Element) {
  return {
    render: (div) => render(renderer, div),
    unrender: () => void 0,
  };
}
