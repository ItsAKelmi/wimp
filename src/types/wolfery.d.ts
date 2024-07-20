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
    close(id: string): unknown;
    collection: ModAppCollection<{ id: string }>;
    open: (opt: {
      title?: string;
      content: string | ModappElement | ((close: () => void) => ModappElement);
      autoclose?: number;
      type?: 'success' | 'info' | 'warn'; // Warn is undocumented
      closeOn: 'click' | 'button' | 'none';
    }) => function;
    openError: (msg: string) => function;
  };
  getModule(mod: 'playerTabs'): {
    removeTab: (string) => void;
    addTab: (tab: {
      id: string;
      sortOrder: number;
      tabFactory: (click: () => void) => ModappElement;
      factory: () => { title: string; component: ModappElement };
      title?: string;
    }) => this;
  };
  getModule(mod: 'charLog'): CharLog;
  getModule(mod: 'charFocus'): CharFocus;
  getModule(mod: 'player'): {
    getActiveChar(): CharModel;
    getPlayer(): {
      id: string;
    };
  };
  getModule(mod: 'console'): {
    removeKeymap(key: string): unknown;
    addKeymap(
      key: string,
      binding: { run: (consoleState: ConsoleState) => boolean },
    ): void;
    keymapModel: {
      [key: string]: { run: (consoleState: ConsoleState) => boolean };
    };
    model: {
      state: null | ConsoleState;
      on(
        eventName: 'change',
        handler: (
          p: Partial<ConsoleState>, //????
          n: ConsoleState,
          namespace?: string,
        ) => void,
      ): void;
      off(
        eventName: 'change',
        handler: (
          p: Partial<ConsoleState>, //????
          n: ConsoleState,
          namespace?: string,
        ) => void,
      ): void;
    };
  };
  getModule(mod: 'pageChar'): {
    addTool(tool: {
      id: string;
      sortOrder: number;
      componentFactory: (ctrl, char) => ModappElement;
      filter?: (ctrl, char) => bool;
      className?: number | undefined;
    }): this;
    removeTool(toolId: string): this;
  };

  getModule(mod: 'charPages'): {
    openPage(
      ctrlId: string,
      charId: string,
      pageFactory: (
        ctrl,
        char,
        state,
        close,
      ) => { title: string; component: ModappElement; onClose: () => void },
      onClose?: () => void,
    ): () => void;
  };

  getModule(mod: 'api'): {
    get(id: string): Promise;
    call(id: string, method: string, data: object): Promise;
    // set(id: string, method: string, data: object): Promise;
  };

  getModule(mod: 'layout'): {
    currentLayout: string;
  };
}

interface ModappElement {
  render: (div: HTMLElement) => void;
  unrender: () => void;
}

interface CharModel {
  surname: string;
  id: string;
  name: string;
  call(method: string, params: object): unknown;
}

export interface ConsoleState {
  doc: string;
  getCtrlId(): string;
  on(
    type: 'change',
    handler: (
      p: Partial<ConsoleState>, //????
      n: ConsoleState,
      namespace?: string,
    ) => void,
  ): void;
  off(
    type: 'change',
    handler: (
      p: Partial<ConsoleState>, //????
      n: ConsoleState,
      namespace?: string,
    ) => void,
  ): void;
}

interface ModAppCollection<T extends { id: string }> {
  get(id: string): T;
  get length(): number;
  atIndex(idx: number): T;
}

export interface CharLog {
  getOverlays(): ModAppCollection<{
    id: string;
    sortOrder: number;
    componentFactory: () => void;
  }>;
  addOverlay(origNav: {
    id: string;
    sortOrder: number;
    componentFactory: () => void;
  }): unknown;
  removeOverlay(arg0: string): unknown;
  getEventComponentFactory(type: string): unknown;
  addEventComponentFactory(
    type: string,
    factory: unknown | ((charId: string, ev: unknown) => unknown),
  ): this;
  removeEventComponentFactory(type: string): this;
  logInfo(
    char: CharModel,
    msg: string | LocaleString,
    opt?: {
      time?: Date;
      noMenu?: boolean;
    },
  ): void;
  logError(
    char: CharModel,
    err: object,
    opt?: {
      time?: Date;
      noMenu?: boolean;
    },
  ): void;
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
