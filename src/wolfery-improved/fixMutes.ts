// Unfortunately unmuting will still be broken. Despite delivering both forms
// of the target character ID with the update request, the server doesn't
// acknowledge the one with the combination ID and will end up returning
// it again next time.
export function fixMutes() {
  unsafeWindow.app.getModule('mute').isMutedChar = function isMutedChar(
    charId: string,
  ) {
    const player = this.module.player.getPlayer();
    const playerId = player.id;
    return !!(
      charId &&
      (player?.mutedChars.props[charId] ||
        player?.mutedChars.props[playerId + charId])
    );
  };
  unsafeWindow.WIMPPatches += 'mute.isMutedChar;';
}
