function surroundSelectionWith(text: string | string[]) {
  if (!Array.isArray(text)) text = [text, text];
  const sel = document.getSelection();
  const range = sel.getRangeAt(0);
  const content = range.extractContents();
  const textContent = content.textContent;

  if (textContent.startsWith(text[0]) && textContent.endsWith(text[1])) {
    range.insertNode(
      document.createTextNode(
        `${textContent.slice(text[0].length, textContent.length - text[1].length)}`,
      ),
    );
  } else {
    range.insertNode(
      document.createTextNode(`${text[0]}${textContent}${text[1]}`),
    );
  }
}

const keymaps = {
  'ctrl-i': () => {
    surroundSelectionWith('_');
    return true;
  },
  'ctrl-b': () => {
    surroundSelectionWith('**');
    return true;
  },
  'ctrl-o': () => {
    surroundSelectionWith(['((', '))']);
    return true;
  },
};

export function applyFormatKeybinds() {
  const con = unsafeWindow.app?.getModule('console');

  for (const k of Object.keys(keymaps)) {
    con.addKeymap(k, {
      run: keymaps[k],
    });
  }

  return () => {
    for (const k of Object.keys(keymaps)) {
      con.removeKeymap(k);
    }
  };
}
