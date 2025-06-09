# Wolfery Improved - Wolfery Is Moddable, Probably
Public WIMP repo

This is a Wolfery extension suite.

## Why?

Why not just develop these into [the client itself](https://github.com/mucklet/mucklet-client) first? Good question! I want to do exploratory
development for myself. I find that it’s easier to figure out the kinks and rough corners in
features when I get to use them for a little bit. For me, this is easier through this mod. This
doesn’t mean that these couldn’t become actual features in Wolfery client directly — if that
happens, I’ll remove them from the mod as long as the official implementation covers the need
completely.
The target audience is power users, but I’m sure newbies will also get some use out of some of
these features. Speaking of features... without further ado.

## The features
The current set of features includes:
- Options to avoid accidental enter hits when a message is half-done
- Options to style the chat box according to the message type being sent (public/private)
- Options to show focus colors as dots or underlining on private and addressed messages
-   Additionally, this option shows _all_ the message recipients by name, instead of the default "Foobar + 3 others"
- A fully rendered notepad tab that lets you read your notes for characters using the site's formatting markup.
- Hiding redundant UI elements
- Growing the chat box automatically to accommodate larger messages
- Keybinds for applying formatting quickly
- Quotes and dialogue that stands out and is easier to read
- Alternative keybinds to reply to a message via the exclamation mark or the period

Additionally, there are some new commands added:
- `export` lets you export the chat log from a specific date onwards without scrolling back, or export your full log from the very beginning
- `age` lets you check the ages of characters around you so you can accommodate new players more easily

And of course there's more to come.

## Installation
You need a userscript execution extension installed in your browser. I’ve tested this with
[ViolentMonkey](https://violentmonkey.github.io/get-it/) on Firefox, which is available on both desktop and Android Firefox at least.
Other userscript addons like Greasemonkey or Tampermonkey may also work, but I haven’t tested those.
After you install the browser extension, all you need to do is visit the download url for the mod
and your userscript platform of choice should ask you to install it.

## [Download the latest version](https://github.com/ItsAKelmi/wimp/releases/latest/download/wolfery-improved.user.js)

### But wait, what about updates?
I’ve got you covered. If the game updates, the mod will let you know that it’s not been tested
with that version. It’s most likely that everything will keep working fine, but just in case, it gives
you a chance to hop off the train and does not load any modifications until you acknowledge
that you want to keep it running in the new game version too.

### The fine print
The mod will refuse to load on any accounts with high-privileged roles. I don't want that liability.
