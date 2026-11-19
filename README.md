# Bounce Battle

A FNAF-themed bouncing-ball battle simulator with eleven regular fighters, the Purple Guy boss, unique attacks, Limit Breaks, sequential team battles, sound customization, and portrait MP4 recording.

## Download and play on Windows

[Download Bounce Battle v1.1.0 for Windows](https://github.com/CTD654/bounce-battle/releases/download/v1.1.0/Bounce-Battle-Windows.zip)

1. Download **Bounce-Battle-Windows.zip** from the release assets.
2. Extract the entire ZIP.
3. Open **Bounce Battle.exe** inside the extracted folder.

Runs offline on 64-bit Windows 10/11. No account, browser, Node.js, or installation is needed to play. Keep the EXE and its supporting files together. The app is unsigned; Windows may show an unknown-publisher notice.

## Features

- Freddy, Foxy, Chica, Bonnie, Roxy, Golden Freddy, Nightguard, Endo, Mangle, Toy Chica, and Toy Freddy.
- Boss Battle against Purple Guy, including his Spring Bonnie phase and Golden Freddy’s special matchup abilities.
- Duel mode, sequential team battles with unique fighters on each side, and Boss Battle with a button to send in the next fighter.
- Fighter Stats page with abilities, cooldowns, movement, and Limit Break descriptions.
- Optional Limit Breaks charged by cumulative damage and 1x, 2x, 3x, 5x, and 10x battle speeds.
- Original and detailed sprite styles selectable in Customization.
- Custom sound effects saved locally on each player's computer.
- Record a 9:16 MP4 with sound, bottom health boxes, horizontal cooldowns, numerical timers, and Limit Break charge bars.

## Run or edit the source

Install Node.js LTS and pnpm, then run:

    pnpm install --ignore-scripts
    node node_modules/electron/install.js
    pnpm start

Build the Windows ZIP with `pnpm package`. HTML, CSS, and game JavaScript are in the repository root; `main.cjs` and `runtime.cjs` provide the desktop shell. The game is bundled locally and does not require the hosted website.

Open `index.html` through a local static web server for browser development. Open `stats.html` for the fighter guide. The source files match website version 155. The v1.1.0 Windows download includes this version of the game.

## Project note

This is an unofficial fan project. Five Nights at Freddy's character names and designs belong to their respective owners. Custom sound files are not bundled; each player supplies their own audio.
