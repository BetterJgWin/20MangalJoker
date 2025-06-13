const symbols = [
  "animeto.jpg", "animeto.jpg", "animeto.jpg", "animeto.jpg",
  "bika.jpg", "bika.jpg", "bika.jpg", "bika.jpg",
  "prascho.jpg", "prascho.jpg", "prascho.jpg", "prascho.jpg",
  "zaeka.jpg", "zaeka.jpg", "zaeka.jpg", "zaeka.jpg",
  "wild.png", // само 1 път - много по-малък шанс
];

function getRandomSymbol() {
  const index = Math.floor(Math.random() * symbols.length);
  return symbols[index];
}

const wildSymbol = "wild.png"
const scatterMusic = document.getElementById('scatter-music');




function checkWinningLines(matrix, paylines) {
  let totalWin = 0;
  const matchedLines = [];

  paylines.forEach((line, index) => {
    const symbolsInLine = line.map((row, col) => matrix[row][col]);

    // Опитваме се да открием най-честия не-wild символ, за да го използваме за сравнение
    const nonWilds = symbolsInLine.filter(sym => sym !== wildSymbol);
    if (nonWilds.length === 0) return; // няма смисъл ако всички са wild

    const targetSymbol = nonWilds[0]; // взимаме първия не-wild за сравнение

    // Броим колко съвпадения има (вкл. wild)
    let matchCount = 0;
    for (let sym of symbolsInLine) {
      if (sym === targetSymbol || sym === wildSymbol) {
        matchCount++;
      } else {
        break; // прекъсваме при първото несъвпадение
      }
    }
    if (symbolsInLine.every(sym => sym === wildSymbol)) {
  totalWin += 100; // или друга стойност за 3 wild-а
  matchedLines.push({ lineIndex: index, matchCount: 3, symbol: wildSymbol });
}

    if (matchCount >= 3) {
      totalWin += matchCount * 10; // може да нагласим множителя
      matchedLines.push({ lineIndex: index, matchCount, symbol: targetSymbol });
    }
  });

  return { totalWin, matchedLines };
}








updateDisplayedBet();
localStorage.removeItem('balance');
let balance = localStorage.getItem('balance') || 1000;
updateBalance();

function startScatterMode() {
  document.body.classList.add("scattering");

  bgMusic.pause();
  scatterMusic.currentTime = 0;
  scatterMusic.play();
}

function stopScatterMode() {
  document.body.classList.remove("scattering");

  scatterMusic.pause();
  bgMusic.currentTime = 0;
  bgMusic.play();
}








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

  // Премахване на предишните win-box рамки
  document.querySelectorAll('.win-box').forEach(box => box.remove());

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

const middleRow = grid[1]; // ред 1 е средната хоризонтала
const scatterCount = middleRow.filter(cell => cell.name === "scatter.png").length;

if (scatterCount >= 3) {
  startScatterMode();
  setTimeout(() => {
    stopScatterMode();
  }, 10000);
}





  const winningLines = [];

  // Хоризонтали
// Хоризонтали - Wild печели само ако са поне 3 Wild-а поред
for (let i = 0; i < 3; i++) {
  const row = grid[i];
  let matchCount = 1;
  let firstSymbol = null;

  for (let j = 0; j < 5; j++) {
    const current = row[j].name;

    if (j === 0) {
      if (current === wildSymbol) {
        // Потърси първия не-wild символ след първия wild
        for (let k = 1; k < 5; k++) {
          if (row[k].name !== wildSymbol) {
            firstSymbol = row[k].name;
            break;
          }
        }
        // Ако няма не-wild символ – линията е само от wild
        if (!firstSymbol) firstSymbol = wildSymbol;
      } else {
        firstSymbol = current;
      }
    }

    if (j > 0) {
      if (row[j].name === firstSymbol || row[j].name === wildSymbol) {
        matchCount++;
      } else {
        break;
      }
    }
  }

  if (matchCount >= 3) {
    winningLines.push({
      elements: row.slice(0, matchCount).map(cell => cell.el),
      count: matchCount,
      symbol: firstSymbol
    });
  }
}



  // Диагонал ↘
  // Диагонал ↘
let d1Count = 1;
let d1First = grid[0][0].name;
if (d1First === wildSymbol) {
  for (let i = 1; i < 5; i++) {
    const next = grid[i % 3][i].name;
    if (d1First === wildSymbol && next !== wildSymbol) {
      d1First = next;
    }
  }
}
for (let i = 1; i < 5; i++) {
  const current = grid[i % 3][i].name;
  if (current === d1First || current === wildSymbol) d1Count++;
  else break;
}
if (d1Count >= 3) {
  winningLines.push({
    elements: Array.from({ length: d1Count }, (_, i) => grid[i % 3][i].el),
    count: d1Count,
    symbol: d1First
  });
}

// Диагонал ↙
let d2Count = 1;
let d2First = grid[2][0].name;
if (d2First === wildSymbol) {
  for (let i = 1; i < 5; i++) {
    const next = grid[(2 - i + 3) % 3][i].name;
    if (d2First === wildSymbol && next !== wildSymbol) {
      d2First = next;
    }
  }
}
for (let i = 1; i < 5; i++) {
  const current = grid[(2 - i + 3) % 3][i].name;
  if (current === d2First || current === wildSymbol) d2Count++;
  else break;
}
if (d2Count >= 3) {
  winningLines.push({
    elements: Array.from({ length: d2Count }, (_, i) => grid[(2 - i + 3) % 3][i].el),
    count: d2Count,
    symbol: d2First
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

function isWinningCombination(symbolsRow) {
  const [s1, s2, s3] = symbolsRow;

  // Ако всички са еднакви (например "animeto.jpg", "animeto.jpg", "animeto.jpg")
  if (s1 === s2 && s2 === s3) return true;

  // Ако има wild символ, който замества друг символ:
  // Wild замества всеки символ, така че комбинация с wild и два еднакви символа е печеливша
  if (
    (s1 === s2 && s3 === wildSymbol) ||
    (s1 === s3 && s2 === wildSymbol) ||
    (s2 === s3 && s1 === wildSymbol)
  ) return true;

  // Ако има два wild символа и третият не е scatter
  if (
    (s1 === wildSymbol && s2 === wildSymbol && s3 !== scatterSymbol) ||
    (s1 === wildSymbol && s3 === wildSymbol && s2 !== scatterSymbol) ||
    (s2 === wildSymbol && s3 === wildSymbol && s1 !== scatterSymbol)
  ) return true;

  return false;
}

function getSymbolDisplay(symbol) {
  if (symbol === wildSymbol) {
    return `<span style="color: orange; font-weight: bold;">${symbol}</span>`;
  } else if (symbol === scatterSymbol) {
    return `<span style="color: gold; font-weight: bold;">${symbol}</span>`;
  } else {
    return symbol;
  }
}



createColumns();
