interface WolferyApp {
  getModule(mod: string): unknown;
  getModule(mod: 'mute'): {
    isMutedChar: (charId: string) => boolean;
    toggleMuteChar: (
      charId: string,
      muteChar?: boolean | undefined,
    ) => Promise<unknown>;
  };
  getModule(mod: 'info'): {
    getClient: () => { version: string };
  };
  getModule(mod: 'toaster'): {
    open: (opt: {
      title?: string;
      content: string;
      autoclose?: number;
      closeOn: 'click' | 'button' | 'none';
    }) => function;
    openError: (msg: string) => function;
  };
  getModule(mod: 'playerTabs'): {
    addTab: (tab: {
      id: string;
      sortOrder: number;
      tabFactory: function;
      factory: function;
      title?: string;
    }) => this;
  };
  getModule(mod: 'charLog'): CharLog;
  getModule(mod: 'charFocus'): CharFocus;
}

export interface CharLog {
  getEventComponentFactory(type: string): function;
  addEventComponentFactory(
    type: string,
    factory: (charId: string, ev: unknown) => unknown,
  ): this;
  removeEventComponentFactory(type: string): this;
}

export interface CharFocus {
  getFocusCharColors(ctrlId: string): {
    char: { id: string }; // Actually Character Model
    hex: string;
    color: string;
  }[];
  _updateStyle(): void;
  settings: {
    [ctrlId: string]: {
      focus: { props: { [charId: string]: { color: string } } };
    };
  };
}

export declare global {
  interface Window {
    app: WolferyApp;
    WIMPPatches: string;
  }
}
