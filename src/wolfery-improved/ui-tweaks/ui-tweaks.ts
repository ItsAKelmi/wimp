export function hideNav() {
  const charLog = unsafeWindow?.app?.getModule('charLog');
  const overlays = charLog.getOverlays();

  // Patch up missing sort orders
  for (let i = 0; i < overlays.length; i++) {
    const item = overlays.atIndex(i);
    if (item.sortOrder) continue;
    item.sortOrder = 1000 + i;
  }

  const origNav = overlays.get('nav');
  charLog.removeOverlay('nav');
  return () => {
    charLog.addOverlay(origNav);
  };
}
