import formatText from './wolfery-lib/formatText';
import fullname from './wolfery-lib/fullname';
import { poseSpacing } from './wolfery-lib/poseSpacing';
import styles from './style.module.css';

interface Target {
  id: string;
  name: string;
  surname: string;
}

interface BaseEvent {
  id: string;
  time: number;
  char: {
    id: string;
    name: string;
    surname: string;
  };
  target: Target;
  targets: Target[];
  msg: string;
  pose?: boolean;
  ooc?: boolean;
  sig: string;
  mod?: {
    targeted?: boolean;
    // Below are from formatText usage
    triggers?: Array<object>;
    em?: object;
    strong?: object;
    ooc?: object;
    cmd?: object;
    sup?: object;
    sub?: object;
    strikethrough?: object;
  };
}

export interface WhisperEvent extends BaseEvent {
  type: 'whisper';
}

export interface MessageEvent extends BaseEvent {
  type: 'message';
}

function FocusedName({
  char,
  ctrlId,
}: {
  char: { id: string; name: string };
  ctrlId: string;
}) {
  return (
    <span class={`wimp-f-${ctrlId}-${char.id} ${styles['focus--label']}`}>
      {char.name}
    </span>
  );
}

export function WhisperEvent(ev: WhisperEvent, ctrlId: string) {
  return BaseEvent(ev, ctrlId, 'Whisper', ' whispers, "');
}

export function MessageEvent(ev: MessageEvent, ctrlId: string) {
  return BaseEvent(ev, ctrlId, 'Message', ' writes, "');
}

function BaseEvent(
  { ooc, target, targets = [], pose, msg, mod, char }: BaseEvent,
  ctrlId: string,
  action: string,
  defaultPose: string,
) {
  const maybeOoc = ooc ? ' ooc' : '';
  const allTargets = [target, ...targets];
  const last = allTargets.pop();
  let targetNames;
  if (allTargets.length > 0) {
    targetNames = allTargets.map((t, i, all) => (
      <span>
        <FocusedName char={t} ctrlId={ctrlId} />
        {i < all.length - 1 ? ', ' : ' '}
      </span>
    ));
    targetNames.push(
      <span>
        and <FocusedName char={last} ctrlId={ctrlId} />
      </span>,
    );
  } else {
    targetNames = [
      <span>
        <FocusedName char={last} ctrlId={ctrlId} />
      </span>,
    ];
  }

  return (
    <div>
      <div class="charlog--fieldset">
        <div class="charlog--fieldset-label">
          <span>
            {`${action}${maybeOoc} to `}
            {...targetNames}
          </span>
        </div>
        <span class="charlog--char">{char.name}</span>
        <span class={ooc ? 'charlog--ooc' : 'charlog--comm'}>
          {pose ? poseSpacing(msg) : defaultPose}
          <span
            class="common--formattext"
            innerHTML={formatText(msg, mod)}
          ></span>
        </span>
      </div>
    </div>
  );
}

export function getTooltipText({
  target,
  targets = [],
}: WhisperEvent | MessageEvent) {
  const allTargets = [target, ...targets];
  return allTargets.map(fullname).join(', ');
}
