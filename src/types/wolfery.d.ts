interface WolferyApp {
  getModule(mod: string): unknown;
  getModule(mod: 'mute'): {
    isMutedChar: (charId: string) => boolean;
  };
}

export declare global {
  interface Window {
    app: WolferyApp;
    WIMPPatches: string;
  }
}
