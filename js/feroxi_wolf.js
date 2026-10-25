/*!
 * Feroxi Forge - rust.penthux.net - Wheel Of Lost Fortune [WOLF]
 *
 * 2026-10-10 v1.0.1 - Shikkoka - rust.penthux.net [working js prototype]
 * 2026-10-18 v2.1.7 - AarokZ - FREELANCE [new engine c/w sfx]
 * 2026-10-21 v2.3.2 - Exaga - Penthux.NET [buttons + spin rules/timings]
 * 2026-10-21 v2.3.3 - Koordex - Penthux.NET [instructions clean-up]
 *
 * Copyright (c) 2026 Penthux.NET (rust.penthux.net)
 *
 * SPDX-License-Identifier: MIT
 * Released under MIT License: https://rust.penthux.net/LICENSE
 *
 * Browser-side game logic for Feroxi Forge Wheel Of Lost Fortune [WOLF].
 * Scrap is stored locally in the user's browser. WOLF idea based on Rust
 * Bandit Camp's "Big Wheel" gambling game in Rust.
 *
 */


/* WOLF settings */
const WOLF_STARTING_SCRAP = 12;
const WOLF_STORAGE_KEY = "feroxi_wolf_scrap";
const WOLF_SPIN_MS = 10000;
const WOLF_RATCHET_MS = 9500;
const WOLF_SLOWDOWN_START_MS = 8000;
const WOLF_SFX_DIR = "./avhub/audio/";
const WOLF_RATCHET_SFX = WOLF_SFX_DIR + "ratchet-clicking.mp3";
const WOLF_SLOWDOWN_SFX = WOLF_SFX_DIR + "wheel-spin-click-slow-down.mp3";

/* 25 wheel sectors: 12 x 1, 6 x 3, 4 x 5, 2 x 10, 1 x 20 */
const WOLF_SECTORS = [1,3,1,10,1,3,1,5,1,5,3,1,10,1,3,1,5,1,3,1,20,1,3,1,5];

const WOLF_COLOURS = {
  1: "--wolf-number-1",
  3: "--wolf-number-3",
  5: "--wolf-number-5",
  10: "--wolf-number-10",
  20: "--wolf-number-20"
};

const WOLF_TEXT_COLOURS = {
  1: "--wolf-number-text",
  3: "--wolf-sector-text-3",
  5: "--wolf-light-text",
  10: "--wolf-light-text",
  20: "--wolf-light-text"
};


/* WOLF game */
(function() {
  const wolf = document.getElementById("wolf-game");

  if (!wolf) {
    return;
  }

  const svgNS = "http://www.w3.org/2000/svg";
  const wheel = wolf.querySelector("#wolf-wheel");
  const sectors = wolf.querySelector("#wolf-sectors");
  const inputs = Array.from(wolf.querySelectorAll(".wolf-bet-input"));
  const controls = Array.from(wolf.querySelectorAll(".wolf-bet-control"));
  const playButton = wolf.querySelector("#wolf-play");
  const resetButton = wolf.querySelector("#wolf-reset");
  const scrapDisplay = wolf.querySelector("#wolf-total-scrap");
  const betDisplay = wolf.querySelector("#wolf-total-bet");
  const statusDisplay = wolf.querySelector("#wolf-status");
  const subStatusDisplay = wolf.querySelector("#wolf-substatus");

  if (!wheel || !sectors || !playButton || !resetButton || !scrapDisplay || !betDisplay || !statusDisplay || !subStatusDisplay || inputs.length !== 5) {
    return;
  }

  let scrap = LoadScrap();
  let rotation = 0;
  let spinning = false;
  let slowdownTimer = null;
  let finishTimer = null;

  const sectorAngle = 360 / WOLF_SECTORS.length;

  const ratchetSFX = new Audio(WOLF_RATCHET_SFX);
  const slowdownSFX = new Audio(WOLF_SLOWDOWN_SFX);

  ratchetSFX.preload = "auto";
  slowdownSFX.preload = "auto";
  ratchetSFX.volume = 0.75;
  slowdownSFX.volume = 0.50;

  BuildWheel();
  BindControls();
  RefreshGame();


  function LoadScrap() {
    const storedScrap = localStorage.getItem(WOLF_STORAGE_KEY);
    const parsedScrap = Number(storedScrap);

    if (storedScrap === null || !Number.isInteger(parsedScrap) || parsedScrap < 0) {
      localStorage.setItem(WOLF_STORAGE_KEY, String(WOLF_STARTING_SCRAP));
      return WOLF_STARTING_SCRAP;
    }

    return parsedScrap;
  }


  function SaveScrap() {
    localStorage.setItem(WOLF_STORAGE_KEY, String(scrap));
  }


  function PolarPoint(radius, degrees) {
    const radians = degrees * Math.PI / 180;

    return [
      200 + radius * Math.cos(radians),
      200 + radius * Math.sin(radians)
    ];
  }


  function BuildWheel() {
    const wolfStyle = getComputedStyle(wolf);

    WOLF_SECTORS.forEach(function(value, index) {
      const centreAngle = -90 + index * sectorAngle;
      const startAngle = centreAngle - sectorAngle / 2;
      const endAngle = centreAngle + sectorAngle / 2;
      const startPoint = PolarPoint(183, startAngle);
      const endPoint = PolarPoint(183, endAngle);
      const textPoint = PolarPoint(142, centreAngle);

      const sector = document.createElementNS(svgNS, "path");
      sector.setAttribute("d", "M 200 200 L " + startPoint[0].toFixed(3) + " " + startPoint[1].toFixed(3) + " A 183 183 0 0 1 " + endPoint[0].toFixed(3) + " " + endPoint[1].toFixed(3) + " Z");
      sector.setAttribute("fill", wolfStyle.getPropertyValue(WOLF_COLOURS[value]).trim());
      sector.setAttribute("stroke", wolfStyle.getPropertyValue("--wolf-sector-stroke").trim());
      sector.setAttribute("stroke-width", "2");
      sectors.appendChild(sector);

      const sectorText = document.createElementNS(svgNS, "text");
      sectorText.setAttribute("x", textPoint[0].toFixed(2));
      sectorText.setAttribute("y", textPoint[1].toFixed(2));
      sectorText.setAttribute("fill", wolfStyle.getPropertyValue(WOLF_TEXT_COLOURS[value]).trim());
      sectorText.setAttribute("font-size", value >= 10 ? "21" : "24");
      sectorText.setAttribute("font-weight", "900");
      sectorText.setAttribute("font-family", "Arial, sans-serif");
      sectorText.setAttribute("text-anchor", "middle");
      sectorText.setAttribute("dominant-baseline", "middle");
      sectorText.setAttribute("transform", "rotate(" + (centreAngle + 90) + " " + textPoint[0].toFixed(2) + " " + textPoint[1].toFixed(2) + ")");
      sectorText.textContent = value;
      sectors.appendChild(sectorText);
    });
  }

  function CurrentBets() {
    const bets = {};

    inputs.forEach(function(input) {
      const betCell = input.closest(".wolf-bet-cell");
      const outcome = Number(betCell.dataset.outcome);
      const amount = Math.max(0, Math.floor(Number(input.value) || 0));

      bets[outcome] = amount;
    });

    return bets;
  }


  function TotalBet() {
    return Object.values(CurrentBets()).reduce(function(total, amount) {
      return total + amount;
    }, 0);
  }


  function RefreshGame() {
    const totalBet = TotalBet();

    scrapDisplay.textContent = scrap;
    betDisplay.textContent = totalBet;

    playButton.disabled = spinning || totalBet < 1 || totalBet > scrap;
    resetButton.disabled = spinning || totalBet === 0;

    inputs.forEach(function(input) {
      input.disabled = spinning;
    });

    controls.forEach(function(control) {
      control.disabled = spinning;
    });
  }


  function NormalizeBet(input) {
    const amount = Math.max(0, Math.floor(Number(input.value) || 0));

    input.value = amount;

    if (TotalBet() > scrap) {
      const excess = TotalBet() - scrap;

      input.value = Math.max(0, amount - excess);
      statusDisplay.textContent = "You cannot bet more Scrap than you own.";
    }

    RefreshGame();
  }


  function BindControls() {
    inputs.forEach(function(input) {
      input.addEventListener("input", function() {
        NormalizeBet(input);
      });

      input.addEventListener("change", function() {
        NormalizeBet(input);
      });
    });

    wolf.querySelectorAll(".wolf-bet-cell").forEach(function(cell) {
      const input = cell.querySelector(".wolf-bet-input");
      const decrease = cell.querySelector('[data-action="decrease"]');
      const increase = cell.querySelector('[data-action="increase"]');
      const clear = cell.querySelector('[data-action="clear"]');

      decrease.addEventListener("click", function() {
        input.value = Math.max(0, (Number(input.value) || 0) - 1);
        RefreshGame();
      });

      increase.addEventListener("click", function() {
        if (TotalBet() < scrap) {
          input.value = (Number(input.value) || 0) + 1;
        } else {
          statusDisplay.textContent = "That is every last piece of Scrap you own.";
        }

        RefreshGame();
      });

      clear.addEventListener("click", function() {
        input.value = 0;
        RefreshGame();
      });
    });

    resetButton.addEventListener("click", function() {
      inputs.forEach(function(input) {
        input.value = 0;
      });

      statusDisplay.textContent = "All bets cleared.";
      subStatusDisplay.textContent = "Your Scrap balance was not reset.";
      RefreshGame();
    });

    playButton.addEventListener("click", PlayWOLF);
  }


  function RandomNumber(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  }


function StartSFX() {
  StopSFX();

  ratchetSFX.volume = 0.75;
  ratchetSFX.currentTime = 0;
  ratchetSFX.play().catch(function() {});
  slowdownTimer = window.setTimeout(function() {
    ratchetSFX.volume = 0.35;
    slowdownSFX.volume = 0.50;
    slowdownSFX.currentTime = 0;
    slowdownSFX.play().catch(function() {});
    window.setTimeout(function() { ratchetSFX.pause(); ratchetSFX.currentTime = 0; }, WOLF_RATCHET_MS - WOLF_SLOWDOWN_START_MS);
  }, WOLF_SLOWDOWN_START_MS);
}


  function StopSFX() {
    if (slowdownTimer !== null) {
      window.clearTimeout(slowdownTimer);
      slowdownTimer = null;
    }

    ratchetSFX.pause();
    slowdownSFX.pause();
    ratchetSFX.currentTime = 0;
    slowdownSFX.currentTime = 0;
  }


  function PlayWOLF() {
    if (spinning) {
      return;
    }

    const bets = CurrentBets();
    const wager = Object.values(bets).reduce(function(total, amount) {
      return total + amount;
    }, 0);

    if (wager < 1 || wager > scrap) {
      return;
    }

    spinning = true;
    scrap -= wager;
    SaveScrap();
    RefreshGame();

    statusDisplay.textContent = "WOLF is spinning...";
    subStatusDisplay.textContent = wager + " Scrap committed. Good luck, degenerate.";

    const sectorIndex = RandomNumber(0, WOLF_SECTORS.length - 1);
    const result = WOLF_SECTORS[sectorIndex];
    const spinDuration = WOLF_SPIN_MS;
    const fullTurns = RandomNumber(8, 12);
    const targetRotation = ((-sectorIndex * sectorAngle) % 360 + 360) % 360;
    const currentRotation = ((rotation % 360) + 360) % 360;
    const finalTurn = (targetRotation - currentRotation + 360) % 360;

    rotation += fullTurns * 360 + finalTurn;

    wheel.style.transition = "transform " + spinDuration + "ms cubic-bezier(.12,.72,.12,1)";
    StartSFX();

    window.requestAnimationFrame(function() {
      wheel.style.transform = "rotate(" + rotation + "deg)";
    });

    finishTimer = window.setTimeout(function() {
      FinishSpin(result, bets, wager);
    }, spinDuration);
  }


  function FinishSpin(result, bets, wager) {
    const winningBet = bets[result] || 0;
    const payout = winningBet > 0 ? winningBet * (result + 1) : 0;

    if (finishTimer !== null) {
      window.clearTimeout(finishTimer);
      finishTimer = null;
    }

    StopSFX();

    scrap += payout;
    SaveScrap();

    inputs.forEach(function(input) {
      input.value = 0;
    });

    spinning = false;
    RefreshGame();

    if (winningBet > 0) {
      const netResult = payout - wager;

      statusDisplay.textContent = "RESULT: " + result + " - WINNING BET " + winningBet + " - RETURN " + payout + " SCRAP";

      if (netResult >= 0) {
        subStatusDisplay.textContent = "Net result: +" + netResult + " Scrap.";
      } else {
        subStatusDisplay.textContent = "You won that number and still lost " + Math.abs(netResult) + " Scrap overall. WOLF approves.";
      }
    } else {
      statusDisplay.textContent = "RESULT: " + result + " - YOU LOST " + wager + " SCRAP";

      if (scrap > 0) {
        subStatusDisplay.textContent = "Wheel Of Lost Fortune thanks you for your donation.";
      } else {
        subStatusDisplay.textContent = "You are completely skint.";
      }
    }
  }
})();


/* #EOF<*> */
