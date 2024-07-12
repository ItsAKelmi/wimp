import { Show } from 'solid-js';
import { CharFocus, CharLog } from '../../types/wolfery';
import { rebuildStyles } from '../rebuildStyles';
import styles from '../style.module.css';
import { j2m } from '../common';
import { getTooltipText } from '../WhisperEvent';

declare module 'solid-js' {
  // eslint-disable-next-line
  namespace JSX {
    interface CustomEvents {
      //      click: (ev: MouseEvent) => void;
      click: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
    }
  }
}

export function applyRequestEventReplacement(
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

  const origLeadRequestFactory =
    charLog.getEventComponentFactory('leadRequest');
  charLog.removeEventComponentFactory('leadRequest');
  charLog.addEventComponentFactory(
    'leadRequest',
    (charId, ev: RequestEventProps) => {
      console.debug('WIMP leadRequestFactory', charId, ev);
      return {
        ...j2m(() => LeadRequestEvent(ev, charId)),
        canHighlight: true,
        getTooltipText,
      };
    },
  );
  const origFollowRequestFactory =
    charLog.getEventComponentFactory('followRequest');
  charLog.removeEventComponentFactory('followRequest');
  charLog.addEventComponentFactory(
    'followRequest',
    (charId, ev: RequestEventProps) => {
      console.debug('WIMP followRequestFactory', charId, ev);
      return {
        ...j2m(() => FollowRequestEvent(ev, charId)),
        canHighlight: true,
        getTooltipText,
      };
    },
  );
  const origSummonRequestFactory = charLog.getEventComponentFactory('summon');
  charLog.removeEventComponentFactory('summon');
  charLog.addEventComponentFactory(
    'summon',
    (charId, ev: RequestEventProps) => {
      console.debug('WIMP summonRequestFactory', charId, ev);
      return {
        ...j2m(() => SummonRequestEvent(ev, charId)),
        canHighlight: true,
        getTooltipText,
      };
    },
  );
  const origJoinRequestFactory = charLog.getEventComponentFactory('join');
  charLog.removeEventComponentFactory('join');
  charLog.addEventComponentFactory('join', (charId, ev: RequestEventProps) => {
    console.debug('WIMP joinRequestFactory', charId, ev);
    return {
      ...j2m(() => JoinRequestEvent(ev, charId)),
      canHighlight: true,
      getTooltipText,
    };
  });
  console.info('WIMP', '...replaced request component factories');
  return () => {
    charLog.removeEventComponentFactory('leadRequest');
    charLog.removeEventComponentFactory('followRequest');
    charLog.removeEventComponentFactory('summon');
    charLog.removeEventComponentFactory('join');
    charLog.addEventComponentFactory('leadRequest', origLeadRequestFactory);
    charLog.addEventComponentFactory('followRequest', origFollowRequestFactory);
    charLog.addEventComponentFactory('summon', origSummonRequestFactory);
    charLog.addEventComponentFactory('join', origJoinRequestFactory);
    console.info('WIMP', '...undid request factory replacement');
  };
}

interface MinCharModel {
  id: string;
  name: string;
  surname: string;
}
interface RequestEventProps {
  char: MinCharModel;
  target: MinCharModel;
  time: number;
}
function LeadRequestEvent(
  { char, target, time }: RequestEventProps,
  ctrlId: string,
) {
  return RequestEvent(
    {
      title: 'Lead',
      action: 'lead',
      callback: (e) => acceptLead(e, char.id, ctrlId),
    },
    { char, target, time },
    ctrlId,
  );
}
function FollowRequestEvent(
  { char, target, time }: RequestEventProps,
  ctrlId: string,
) {
  return RequestEvent(
    {
      title: 'Follow',
      action: 'follow',
      callback: (e) => acceptFollow(e, char.id, ctrlId),
    },
    { char, target, time },
    ctrlId,
  );
}
function SummonRequestEvent(
  { char, target, time }: RequestEventProps,
  ctrlId: string,
) {
  return RequestEvent(
    {
      title: 'Summon',
      action: 'summon',
      callback: (e) => acceptSummon(e, char.id, ctrlId),
    },
    { char, target, time },
    ctrlId,
  );
}
function JoinRequestEvent(
  { char, target, time }: RequestEventProps,
  ctrlId: string,
) {
  return RequestEvent(
    {
      title: 'Join',
      action: 'join',
      callback: (e) => acceptJoin(e, char.id, ctrlId),
    },
    { char, target, time },
    ctrlId,
  );
}

function RequestEvent(
  requestData: {
    title: string;
    action: string;
    callback: (
      e: MouseEvent & { currentTarget: HTMLButtonElement; target: Element },
    ) => void;
  },
  { char, target, time }: RequestEventProps,
  ctrlId: string,
) {
  const disabled = Date.now() - time > 1000 * 60 * 5;
  return (
    <div>
      <div class={`${styles.requestFieldset} charlog--fieldset`}>
        <div class="charlog--fieldset-label">
          <span>{requestData.title} request</span>
        </div>
        <div>
          <span
            class={`wimp-f-${ctrlId}-${char.id} ${styles['focus--label']} charlog--char`}
          >
            {char.name}
          </span>{' '}
          wants to {requestData.action}&nbsp;
          <span
            class={`wimp-f-${ctrlId}-${target.id} ${styles['focus--label']} charlog--char`}
          >
            {target.name}
          </span>
        </div>
        <Show when={target.id === ctrlId}>
          <div class={`${styles.acceptRequestBtn} charlog--pad-small`}>
            <button
              disabled={disabled}
              type="button"
              class="btn small primary"
              //@ts-expect-error TS version or something messes up the definition in JSX.EventHandler
              on:click={requestData.callback}
            >
              Accept
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}

function acceptAction(
  method: string,
  ev: MouseEvent & { currentTarget: HTMLButtonElement },
  charId: string,
  ctrlId: string,
) {
  const playerChar = unsafeWindow.app?.getModule('player')?.getActiveChar();
  if (ctrlId !== playerChar.id) return;
  playerChar.call(method, {
    charId,
  });
  ev.currentTarget.disabled = true;
}

const acceptLead = acceptAction.bind(null, 'follow');
const acceptFollow = acceptAction.bind(null, 'lead');
const acceptJoin = acceptAction.bind(null, 'summon');
const acceptSummon = acceptAction.bind(null, 'join');
