//! 20-Radoslav-Mango.js

const symbols = ["a.png", "b.png", "c.png", "d.png", "e.png", "scatter.gif"];
const rows = 5; // редове
const cols = 3; // барабани
let freeSpinsActive = false;
let freeSpinsRemaining = 0;
let totalFreeSpinWin = 0;
let balance = 100;
let currentBet = 1;

const slot = document.getElementById("slot");
const statusDiv = document.getElementById("status");
const spinButton = document.getElementById("spinButton");
const betButton = document.createElement("button");
betButton.textContent = "Промени залог (1/2/5)";
let betOptions = [1, 2, 5];
let betIndex = 0;

const audioThree = new Audio("sounds/3match.mp3");
const audioFour = new Audio("sounds/4match.mp3");
const audioFive = new Audio("sounds/5match.mp3");
const freeSpinMusic = new Audio("sounds/freespins.mp3");
freeSpinMusic.loop = true;

function setupGrid() {
  slot.innerHTML = "";
  for (let r = 0; r < rows; r++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "slot-row";
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "reel";
      cell.id = `reel-${r}-${c}`;
      rowDiv.appendChild(cell);
    }
    slot.appendChild(rowDiv);
  }
}

function getRandomSymbol(allowScatter = true) {
  const availableSymbols = allowScatter ? symbols : symbols.filter(s => s !== "scatter.gif");
  return availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
}

function animateReels() {
  const reels = document.querySelectorAll(".reel");
  reels.forEach(reel => {
    reel.classList.add("spinning");
    setTimeout(() => reel.classList.remove("spinning"), 500);
  });
}

function spinReels() {
  if (!freeSpinsActive && balance < currentBet) {
    alert("Недостатъчен баланс!");
    return;
  }

  stopAllSounds();

  if (!freeSpinsActive) {
    balance -= currentBet;
  }

  animateReels();

  const spinResult = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (let c = 0; c < cols; c++) {
    let scatterPlaced = false;
    let scatterRow = Math.floor(Math.random() * rows);
    for (let r = 0; r < rows; r++) {
      let symbol;
      if (!scatterPlaced && r === scatterRow && Math.random() < 0.3 && !freeSpinsActive) {
        symbol = "scatter.gif";
        scatterPlaced = true;
      } else {
        symbol = getRandomSymbol(!freeSpinsActive);
        while (symbol === "scatter.gif") {
          symbol = getRandomSymbol(false);
        }
      }
      const reelCell = document.getElementById(`reel-${r}-${c}`);
      reelCell.innerHTML = `<img src="images/${symbol}" class="symbol">`;
      spinResult[r][c] = symbol;
    }
  }

  handleResult(spinResult);
}

function countScatters(grid) {
  let count = 0;
  grid.forEach(row => {
    row.forEach(sym => {
      if (sym === "scatter.gif") count++;
    });
  });
  return count;
}

function showVideo(src, callback, finalWinText = null, loop = false) {
  const video = document.createElement("video");
  video.src = src;
  video.autoplay = true;
  video.controls = false;
  video.loop = loop;
  video.style.position = "fixed";
  video.style.top = "0";
  video.style.left = "0";
  video.style.width = "100vw";
  video.style.height = "100vh";
  video.style.zIndex = "1000";
  video.addEventListener("click", () => {
    if (loop) {
      document.body.removeChild(video);
      if (finalWinText) alert(finalWinText);
      callback && callback();
    } else {
      if (video.paused) video.play();
      else {
        video.pause();
        video.currentTime = video.duration;
      }
    }
  });
  if (!loop) {
    video.onended = () => {
      document.body.removeChild(video);
      if (finalWinText) alert(finalWinText);
      callback && callback();
    };
  }
  document.body.appendChild(video);
}

function stopAllSounds() {
  audioThree.pause(); audioThree.currentTime = 0;
  audioFour.pause(); audioFour.currentTime = 0;
  audioFive.pause(); audioFive.currentTime = 0;
  freeSpinMusic.pause(); freeSpinMusic.currentTime = 0;
}

function handleResult(grid) {
  const scatters = countScatters(grid);
  let win = 0;
  let winningRows = [];

  for (let r = 0; r < rows; r++) {
    const line = grid[r];
    if (line.every(s => s === line[0] && s !== "scatter.gif")) {
      win += currentBet * 5;
      winningRows.push(r);
    }
  }

  winningRows.forEach(r => {
    document.querySelectorAll(`.slot-row:nth-child(${r + 1}) .reel`).forEach(el => {
      el.style.boxShadow = "0 0 10px 5px #0ff";
      setTimeout(() => el.style.boxShadow = "", 1000);
    });
  });

  if (win >= currentBet * 15) {
    audioFive.play();
  } else if (win >= currentBet * 10) {
    audioFour.play();
  } else if (win > 0) {
    audioThree.play();
  }

  if (freeSpinsActive) {
    totalFreeSpinWin += win;
    freeSpinsRemaining--;
    updateStatus(`Фрее врътки: ${freeSpinsRemaining} | Печалба: ${totalFreeSpinWin} лв.`);
    if (freeSpinsRemaining <= 0) {
      showVideo("videos/bonus-end.mp4", () => {
        balance += totalFreeSpinWin;
        updateStatus(`Край на фрее врътки. Обща печалба: ${totalFreeSpinWin} лв. | Баланс: ${balance} лв.`);
        totalFreeSpinWin = 0;
        freeSpinsActive = false;
      }, `Фрее врътки приключиха. Обща печалба: ${totalFreeSpinWin} лв.`, true);
    } else {
      setTimeout(spinReels, 1000);
    }
  } else {
    balance += win;
    if (scatters >= 3) {
      freeSpinsActive = true;
      freeSpinsRemaining = 20;
      updateStatus("СПЕЧЕЛИ 20 ФРЕЕ СПИНС!");
      const freeSpinLabel = document.createElement("div");
      freeSpinLabel.textContent = "20 ФРЕЕ СПИНС!";
      freeSpinLabel.style.position = "absolute";
      freeSpinLabel.style.bottom = "20px";
      freeSpinLabel.style.left = "50%";
      freeSpinLabel.style.transform = "translateX(-50%)";
      freeSpinLabel.style.fontSize = "32px";
      freeSpinLabel.style.color = "gold";
      freeSpinLabel.style.fontWeight = "bold";
      freeSpinLabel.style.zIndex = "2000";
      freeSpinLabel.style.textShadow = "2px 2px 5px black";
      document.body.appendChild(freeSpinLabel);
      setTimeout(() => freeSpinLabel.remove(), 3000);
      showVideo("videos/freespins-intro.mp4", () => {
        freeSpinMusic.play();
        setTimeout(spinReels, 500);
      });
      return;
    }
  }

  updateStatus(`Печалба: ${win} лв. | Баланс: ${balance} лв.`);
}

function updateStatus(text) {
  statusDiv.innerText = text;
}

spinButton.addEventListener("click", () => {
  if (!freeSpinsActive) {
    spinReels();
  }
});

betButton.addEventListener("click", () => {
  betIndex = (betIndex + 1) % betOptions.length;
  currentBet = betOptions[betIndex];
  alert(`Нов залог: ${currentBet} лв.`);
});

document.body.appendChild(betButton);

setupGrid();
updateStatus(`Баланс: ${balance} лв. | Залог: ${currentBet} лв.`);
