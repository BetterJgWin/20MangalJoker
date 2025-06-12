const symbols = ["animeto.jpg", "bika.jpg", "prascho.jpg", "zaeka.jpg"];

updateDisplayedBet();
localStorage.removeItem('balance');
let balance = localStorage.getItem('balance') || 1000;
updateBalance();

function updateBalance() {
  document.getElementById('balance').textContent = `Баланс: ${balance} лв.`;
  localStorage.setItem('balance', balance);
}

function showJackpotVideo() {
  const container = document.getElementById("jackpot-video-container");
  const video = document.getElementById("jackpot-video");

  container.style.display = "flex";
  video.currentTime = 0;
  video.play();

  // Премахваме събитие ако е добавено преди
  container.onclick = null;

  // Добавяме обработчик за клик
  container.onclick = () => {
    video.pause();
    container.style.display = "none";
  };
}


function spin() {

  const denom = parseFloat(document.getElementById("denomination").value);
  const bet = parseInt(document.getElementById("bet").value);
  const totalBet = denom * bet;

  if (balance < totalBet) {
    alert("Недостатъчен баланс!");
    return;
  }
  balance -= totalBet;
  updateBalance();

  [winSmall, winMedium, winJackpot].forEach(a => {
    a.pause();
    a.currentTime = 0;
  });

  spinSound.currentTime = 0;
  spinSound.play();

  const cols = document.querySelectorAll('.slot-column');
  const middleRowSymbols = [];

  cols.forEach(col => {
    col.innerHTML = '';
    for (let j = 0; j < 3; j++) {
      const sym = document.createElement('img');
      sym.className = 'slot-symbol spin-symbol'; // 🎬 анимация

      const randSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      sym.src = `assets/${randSymbol}`;

      if (j === 1) {
        middleRowSymbols.push(randSymbol);
      }

      col.appendChild(sym);
    }
  });

  // 🔚 Спиране на spinSound и проверка за печалба
  setTimeout(() => {
  spinSound.pause();
  spinSound.currentTime = 0;
  checkWin(middleRowSymbols, totalBet); // 🔁 добавен totalBet
}, 1000);
}

function updateDisplayedBet() {
  const denom = parseFloat(document.getElementById("denomination").value);
  const bet = parseInt(document.getElementById("bet").value);
  const totalBet = denom * bet;
  document.getElementById("total-bet-display").textContent = `Залог: ${totalBet.toFixed(2)} лв.`;
}



function drawWinningBoxes(elements) {
  const container = document.querySelector('.slot-container');
  if (!elements || elements.length === 0) return;

  const containerRect = container.getBoundingClientRect();

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();

    const box = document.createElement('div');
    box.className = 'win-box';

    box.style.position = 'absolute';
    box.style.left = `${rect.left - containerRect.left + window.scrollX}px`;
    box.style.top = `${rect.top - containerRect.top + window.scrollY}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
    box.style.border = '3px solid';
    box.style.borderImage = 'linear-gradient(45deg, red, yellow, lime, cyan, blue, magenta, red) 1';
    box.style.borderRadius = '10px';
    box.style.zIndex = 1000;
    box.style.pointerEvents = 'none';
    box.style.boxShadow = '0 0 12px rgba(255, 255, 255, 0.9)';

    container.appendChild(box);

    // Премахване след 3 секунди
    setTimeout(() => box.remove(), 3000);
  });
}




const spinSound = new Audio('assets/spin.mp3');
const winSmall = new Audio('assets/win-small.mp3');
const winMedium = new Audio('assets/win-medium.mp3');
const winJackpot = new Audio('assets/win-jackpot.mp3');


const machine = document.getElementById('slot-machine');

// Инициализация
function createColumns() {
  machine.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const col = document.createElement('div');
    col.className = 'slot-column';
    for (let j = 0; j < 3; j++) {
      const sym = document.createElement('div');
      sym.className = 'slot-symbol';
      sym.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      col.appendChild(sym);
    }
    machine.appendChild(col);
  }
}


function showJackpotScreen(currentBet) {
  const jackpotAmount = currentBet * 100;
  balance += jackpotAmount;
  updateBalance();

  const screen = document.createElement('div');
  screen.id = 'jackpot-screen';
  screen.innerHTML = `
    <video id="jackpot-video" autoplay muted loop>
      <source src="assets/jackpot-bg.mp4" type="video/mp4">
      Вашият браузър не поддържа видеото.
    </video>
    <div class="jackpot-content">
      <div id="jackpot-amount">+${jackpotAmount} лв.</div>
    </div>
  `;

  document.body.appendChild(screen);

  screen.onclick = () => {
    screen.remove();
  };
}




function checkWin(middleRowSymbols, totalBet) {
  const columns = document.querySelectorAll('.slot-column');
  const grid = [[], [], []]; // редове: 0-горен, 1-среден, 2-долен

  // Събиране на символите
  columns.forEach((col, colIndex) => {
    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
      const el = col.children[rowIndex];
      const name = el.src.split('/').pop();
      grid[rowIndex][colIndex] = { el, name };
    }
  });

  const winningLines = [];

  // Хоризонтали
  for (let i = 0; i < 3; i++) {
    let combo = 1;
    const first = grid[i][0].name;
    for (let j = 1; j < 5; j++) {
      if (grid[i][j].name === first) combo++;
      else break;
    }
    if (combo >= 3) {
      winningLines.push({
        elements: grid[i].slice(0, combo).map(cell => cell.el),
        count: combo,
        symbol: first
      });
    }
  }

  // Диагонал ↘
  let d1combo = 1;
  const d1first = grid[0][0].name;
  for (let i = 1; i < 5; i++) {
    if (grid[i % 3][i].name === d1first) d1combo++;
    else break;
  }
  if (d1combo >= 3) {
    winningLines.push({
      elements: Array.from({ length: d1combo }, (_, i) => grid[i % 3][i].el),
      count: d1combo,
      symbol: d1first
    });
  }

  // Диагонал ↙
  let d2combo = 1;
  const d2first = grid[2][0].name;
  for (let i = 1; i < 5; i++) {
    const r = 2 - (i % 3);
    if (grid[r][i].name === d2first) d2combo++;
    else break;
  }
  if (d2combo >= 3) {
    winningLines.push({
      elements: Array.from({ length: d2combo }, (_, i) => grid[2 - (i % 3)][i].el),
      count: d2combo,
      symbol: d2first
    });
  }

  // Показване на печалби
  if (winningLines.length > 0) {
    let totalWin = 0;

    winningLines.forEach(line => {
      line.elements.forEach(el => el.classList.add('win-symbol'));

      let multiplier = 0;
      let audio = null;

      if (line.count === 3) {
        multiplier = 5;
        audio = winSmall;
      } else if (line.count === 4) {
        multiplier = 10;
        audio = winMedium;
      } else if (line.count === 5) {
        multiplier = 100;
        audio = winJackpot;
      }

      // 🎵 Аудио
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }

      // 📦 Рамка
      drawWinningBoxes(line.elements);

      if (line.count < 5) {
        totalWin += totalBet * multiplier;
      } else {
        // 🔥 Джакпот – отделен екран и 1000 лв.
        showJackpotScreen(totalBet);

      }
    });

    if (totalWin > 0) {
      balance = parseFloat(balance) + totalWin;
      updateBalance();

      // 🎆 Показване на спечелената сума
      const winMessage = document.createElement('div');
      winMessage.className = 'win-popup';
      winMessage.textContent = `Печалба: +${totalWin.toFixed(2)} лв.`;
      document.body.appendChild(winMessage);
      setTimeout(() => winMessage.remove(), 3000);
    }
  }
}






createColumns();
