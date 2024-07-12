import { CharFocus, CharLog } from '../types/wolfery';
import { WhisperEvent, MessageEvent, getTooltipText } from './WhisperEvent';
import { j2m } from './common';
import { rebuildStyles } from './rebuildStyles';

export function applyWhisperMessageReplacements(
  charFocus: CharFocus & {
    _updateStyle: { wimpPatched?: boolean } & (() => void);
  },
  charLog: CharLog,
) {
  if (!charFocus._updateStyle.wimpPatched) {
    // Hook focus updates to style updates
    const oldUpdate = charFocus._updateStyle.bind(charFocus);
    charFocus._updateStyle = () => {
      rebuildStyles();
      oldUpdate();
    };
    charFocus._updateStyle.wimpPatched = true;
    console.info('WIMP', '...hooked focus style updates');
  }

  const origWhisperFactory = charLog.getEventComponentFactory('whisper');
  const origMessageFactory = charLog.getEventComponentFactory('message');
  charLog.removeEventComponentFactory('whisper');
  charLog.removeEventComponentFactory('message');
  charLog.addEventComponentFactory('whisper', (charId, ev: WhisperEvent) => {
    console.debug('WIMP whisperFactory', charId, ev);
    return {
      ...j2m(() => WhisperEvent(ev, charId)),
      canHighlight: true,
      getTooltipText,
    };
  });
  charLog.addEventComponentFactory('message', (charId, ev: MessageEvent) => {
    console.debug('WIMP messageFactory', charId, ev);
    return {
      ...j2m(() => MessageEvent(ev, charId)),
      canHighlight: true,
      getTooltipText,
    };
  });
  console.info('WIMP', '...replaced message and whisper component factories');
  return () => {
    charLog.removeEventComponentFactory('whisper');
    charLog.removeEventComponentFactory('message');
    charLog.addEventComponentFactory('whisper', origWhisperFactory);
    charLog.addEventComponentFactory('message', origMessageFactory);
    console.info('WIMP', '...undid message and whisper replacement');
  };
}
