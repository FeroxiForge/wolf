

# Wheel Of Lost Fortune (WOLF)

WOLF (Wheel Of Lost Fortune) is a JavaScript browser game inspired by Rust's Bandit Camp Big Wheel.

**Live game:** [https://rust.penthux.net/index.php?p=wolf](https://rust.penthux.net/index.php?p=wolf)

## Description

WOLF is a browser-based game created for entertainment purposes only and released under the MIT License. See `LICENSE` for details.

Scrap is the in-game currency. Your balance is stored locally in your browser using `localStorage` and persists between visits in the same browser and website origin.

If you run out of Scrap, you can manually reset your balance to the starting amount of 12 Scrap using the instructions below.

Scrap has no real-world monetary value.

## How to Play

You begin with **12 Scrap**. Choose one or more numbers, place your bets, spin the wheel, and hope Lady Luck is on your side.

### 1. Place Your Bets

The wheel contains five possible numbers:

- `1`
- `3`
- `5`
- `10`
- `20`

Choose one or more numbers and place your bets using the controls beside each number.

- **🔼 Increase your bet** — increase the stake on that number by 1 Scrap.
- **🔽 Decrease your bet** — decrease the stake on that number by 1 Scrap.
- **❌ Clear your bet** — remove the stake on that number.

Your total stake across all numbers cannot exceed your current Scrap balance. You must place at least one bet before you can spin the wheel.

### 2. Spin the Wheel

When you're ready, press **PLAY NOW!** to spin the wheel.

If the wheel lands on a number you backed, your winning stake is returned, along with winnings equal to that number multiplied by your winning stake.

**Example:** If you bet 2 Scrap on `5` and the wheel lands on `5`, you receive your 2-Scrap stake back plus 10 Scrap in winnings — a total payout of 12 Scrap.

Any other stakes placed on losing numbers are lost.

### 3. Manage Your Bets

- **RESET ALL** — clear all your current bets without changing your Scrap balance.
- **❌** — clear an individual bet while leaving your other bets in place.

After each spin, your bets are cleared automatically so you can decide what to do next.

### 4. Keep an Eye on Your Scrap

Your current balance is displayed as **TOTAL SCRAP**, and the combined value of your active bets is displayed as **YOUR BET**.

Your Scrap balance is saved in your browser. Reloading the page, closing the browser, shouting at the wheel, or blaming Feroxi Forge will not restore Scrap you've lost.

If you lose everything, congratulations! You're officially broke. It's time to get grinding for more Scrap so you can lose it all over again.

WOLF uses imaginary Scrap only. There is no real money, no worldly value, and no prizes. There is absolutely no reason to take any of this seriously.

## Reset Your Scrap Back to 12

WOLF stores your Scrap balance in browser `localStorage` under this key:

```
feroxi_wolf_scrap
```

The balance is stored separately for each website origin. Make sure you run the reset command on the same WOLF website where you want your balance reset.

### 1. Open WOLF

Use the appropriate address:

- **Live website:** [https://rust.penthux.net/index.php?p=wolf](https://rust.penthux.net/index.php?p=wolf)
- **Local network:** [http://kron.penthux.lan/rust/?p=wolf](http://kron.penthux.lan/rust/?p=wolf)

### 2. Open the Browser Developer Tools

In most browsers, press:

```
F12
```

Alternatively, press:

```
Ctrl + Shift + I
```

### 3. Open the Console

Select the **Console** tab in the developer tools.

### 4. Reset Your Scrap

Enter this exact command into the console:

```
localStorage.setItem("feroxi_wolf_scrap", "12");
```

Press **Enter**.

This sets your stored WOLF balance to exactly 12 Scrap.

### 5. Reload the Page

Reload WOLF normally by pressing:

```
Ctrl + R
```

Your balance should now display:

```
TOTAL SCRAP: 12
YOUR BET: 0
```

You're back in business!

### Why Refreshing Alone Doesn't Reset Your Scrap

WOLF deliberately saves your Scrap balance in `localStorage`. When the game loads, its `LoadScrap()` function reads the saved value and uses it if it is a valid, non-negative integer.

That means a stored balance of `0` is perfectly valid. Reloading the page simply loads that same zero balance again.

WOLF automatically restores the starting balance of 12 only when the stored value is missing, invalid, or negative.

In other words, if your stored balance is zero, the game quite correctly concludes that you're broke. Refreshing won't bail you out.

### Alternative: Start as Though You've Never Played Before

If you want WOLF to behave as though you have never played before, you can remove the stored balance instead.

In the browser console, enter:

```
localStorage.removeItem("feroxi_wolf_scrap");
```

Press **Enter**, then reload the page.

Because the storage entry is now missing, WOLF will initialise a fresh balance of 12 Scrap.

**For a straightforward reset, use the first command** — `localStorage.setItem("feroxi_wolf_scrap", "12");` — to set your balance directly to 12.

## Running the Game

WOLF is a browser-based game built with HTML, CSS, and JavaScript.

- Open `index.html` in a web browser to run the game locally.
- Alternatively, publish the repository using GitHub Pages.

Keep the referenced assets at their expected paths so that relative URLs continue to resolve.

## File Locations

- `index.html` — game markup and entry point
- `css/feroxi.css` — existing Feroxi Forge stylesheet
- `js/feroxi_wolf.js` — WOLF game logic
- `avhub/audio/` — sound effects referenced by the JavaScript
- `htm/font/` — font assets referenced by the stylesheet
- `img/icons/` — icon assets
- `img/marks/` — marks and logo assets
- `img/bkgd/` — background images

Keep the directory structure and filenames intact when adding or updating assets, unless you also update the paths that reference them.

## License

WOLF is released under the MIT License. See the `LICENSE` file for the full licence text.

