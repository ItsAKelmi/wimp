export function hideNav() {
  const charLog = unsafeWindow?.app?.getModule('charLog');
  const origNav = charLog.getOverlays()['nav'];
  charLog.removeOverlay('nav');
  return () => charLog.addOverlay(origNav);
}
