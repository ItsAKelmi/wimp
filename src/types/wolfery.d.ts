interface WolferyApp {
  getModule(mod: string): unknown;
  getModule(mod: 'mute'): {
    isMutedChar: (charId: string) => boolean;
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
}

export declare global {
  interface Window {
    app: WolferyApp;
    WIMPPatches: string;
  }
}
