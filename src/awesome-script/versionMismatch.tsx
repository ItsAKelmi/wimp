export function VersionMismatchToast({
  click,
  expectedVersion,
  gotVersion,
  onLoadAnyway,
}: {
  click: () => void;
  expectedVersion: string;
  gotVersion: string;
  onLoadAnyway: () => void;
}) {
  return (
    <div>
      <p>
        The game has been updated, but the installed version of WIMP has not
        been tested with this version. You can click the button below to load
        anyway and ignore this warning. If you run into any problems, check the
        forums for update info and try disabling the extension before reporting
        a bug.
      </p>
      <p>
        The version of the game is {gotVersion}, but the addon has been tested
        for {expectedVersion}.
      </p>
      <div
        style={{
          width: '100%',
          display: 'flex',
          'justify-content': 'space-evenly',
        }}
      >
        <button onclick={onLoadAnyway} class="btn medium">
          Load anyway
        </button>
        <button onclick={click} class="btn medium secondary">
          Close
        </button>
      </div>
    </div>
  );
}
