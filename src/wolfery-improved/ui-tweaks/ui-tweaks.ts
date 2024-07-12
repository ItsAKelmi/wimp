export function hideNav() {
  const charLog = unsafeWindow?.app?.getModule('charLog');
  const origNav = charLog.getOverlays().get('nav');
  charLog.removeOverlay('nav');
  return () => charLog.addOverlay(origNav);
}
