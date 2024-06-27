import './meta.js?userscript-metadata';
import './app';

unsafeWindow.WIMPPatches = '';
function fixMutes() {
  unsafeWindow.app.getModule('mute').isMutedChar = function (charId: string) {
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
const foo = setInterval(() => {
  if (unsafeWindow?.app?.getModule('mute')) {
    fixMutes();
    clearInterval(foo);
  }
}, 100);
