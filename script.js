let score1 = 0;
let score2 = 0;
let currentGame = 0;
const totalGames = 15;
const winningScore = 61;

let gameNames = [];
const gameStartSound = new Audio("spielstart.mp3");

// Initialisierung beim Laden
window.onload = () => {
  initializeTopBar();
  initializeGrids();
  loadGameList();
};

// Spieleleiste initialisieren
function initializeTopBar() {
  const container = document.getElementById('games-container');
  for (let i = 1; i <= totalGames; i++) {
    const gameBox = document.createElement('div');
    gameBox.classList.add('game-box');
    gameBox.innerText = i;
    gameBox.id = `game-${i}`;
    container.appendChild(gameBox);
  }
}

// Raster initialisieren
function initializeGrids() {
  const gridPlayer1 = document.getElementById('grid-player1');
  const gridPlayer2 = document.getElementById('grid-player2');

  for (let i = 1; i <= totalGames; i++) {
    const box1 = document.createElement('div');
    box1.classList.add('game-box');
    box1.id = `player1-game-${i}`;
    gridPlayer1.appendChild(box1);

    const box2 = document.createElement('div');
    box2.classList.add('game-box');
    box2.id = `player2-game-${i}`;
    gridPlayer2.appendChild(box2);
  }
}

// Lade Spieleliste aus Datei
function loadGameList() {
  fetch('gameslist.txt')
    .then(response => {
      if (!response.ok) throw new Error("Spieleliste konnte nicht geladen werden.");
      return response.text();
    })
    .then(text => {
      console.log("Spieleliste geladen!");
      console.log(text);
      gameNames = text.trim().split('\n');
      createGameList();
    })
    .catch(err => console.error("Fehler beim Laden der Spieleliste:", err));
}

// Liste mit <li> erstellen
function createGameList() {
  const ul = document.getElementById("games-ul");
  ul.innerHTML = "";

  for (let i = 0; i < totalGames; i++) {
    const li = document.createElement("li");
    const initialName = (i === 0 && gameNames[i]) ? gameNames[i] : '';
    li.innerHTML = `${i + 1}: <span id="game-name-${i + 1}">${initialName}</span>`;
    ul.appendChild(li);
  }
}

// Spiel vergeben
function awardGame(winner) {
  if (currentGame >= totalGames) {
    alert('Alle Spiele wurden gespielt!');
    return;
  }

  // Soundeffekt abspielen
  gameStartSound.currentTime = 0;
  gameStartSound.play();

  const points = currentGame + 1;

  // Punkte aktualisieren
  if (winner === 1) {
    score1 += points;
    document.getElementById('score1').innerText = score1;
    updateProgressBar(1, score1);
  } else if (winner === 2) {
    score2 += points;
    document.getElementById('score2').innerText = score2;
    updateProgressBar(2, score2);
  }

  // Spieleleiste aktualisieren
  document.getElementById(`game-${currentGame + 1}`).classList.add('played');

  // Raster aktualisieren
  const boxId = winner === 1 ? `player1-game-${currentGame + 1}` : `player2-game-${currentGame + 1}`;
  const box = document.getElementById(boxId);
  box.innerText = currentGame + 1;
  box.classList.add(winner === 1 ? 'winner-player1' : 'winner-player2');

  // Nächstes Spiel vorbereiten (falls vorhanden)
  const nextGame = currentGame + 1;
  if (nextGame < totalGames) {
    const gameDisplay = document.getElementById(`game-name-${nextGame + 1}`);
    const nextGameName = gameNames[nextGame];

    if (gameDisplay && nextGameName) {
      const isFinal = (nextGame + 1) === 15;

      // Animation anzeigen (zentral, evtl. golden)
      animateGameTitle(nextGameName, `game-name-${nextGame + 1}`, isFinal);

      // Text nach Animation anzeigen
      setTimeout(() => {
        gameDisplay.textContent = nextGameName;

        // Wenn letztes Spiel → Liste golden färben
        if (isFinal) {
          const li = gameDisplay.closest('li');
          if (li) li.classList.add("final");
        }
      }, isFinal ? 4600 : 4600);
    }
  }

  currentGame++;
  checkWinner();
}

function closeChart() {
  document.getElementById("chart-overlay").style.display = "none";
}

// Fortschrittsbalken aktualisieren
function updateProgressBar(player, score) {
  const progressBar = document.getElementById(`progress${player}`);
  const percentage = Math.min((score / winningScore) * 100, 100);
  progressBar.style.width = `${percentage}%`;
}

// Gewinnerprüfung
function checkWinner() {
  if (score1 >= winningScore) {
    alert('Anton gewinnt!');
  } else if (score2 >= winningScore) {
    alert('Moritz gewinnt!');
  }
}

// Reset-Funktion
function resetScores() {
  const confirmed = confirm("Möchtest du die Scoretafel wirklich zurücksetzen?");
  if (!confirmed) return;

  score1 = 0;
  score2 = 0;
  currentGame = 0;

  document.getElementById('score1').innerText = score1;
  document.getElementById('score2').innerText = score2;
  updateProgressBar(1, 0);
  updateProgressBar(2, 0);

  for (let i = 1; i <= totalGames; i++) {
    document.getElementById(`game-${i}`).classList.remove('played');
    document.getElementById(`player1-game-${i}`).innerText = '';
    document.getElementById(`player1-game-${i}`).classList.remove('winner-player1', 'winner-player2');
    document.getElementById(`player2-game-${i}`).innerText = '';
    document.getElementById(`player2-game-${i}`).classList.remove('winner-player1', 'winner-player2');

    const gameNameElement = document.getElementById(`game-name-${i}`);
    if (gameNameElement) {
      gameNameElement.textContent = (i === 1 && gameNames[0]) ? gameNames[0] : '';
    }
  }
}


// Diagramm anzeigen
function showChart() {
  const overlay = document.getElementById("chart-overlay");
  overlay.style.display = "flex";

  const ctx = document.getElementById("gamePieChart").getContext("2d");

  if (window.gameChart && typeof window.gameChart.destroy === 'function') {
    window.gameChart.destroy();
  }

  const labels = [];
  const data = [];
  const backgroundColors = [];

  const playedPoints = score1 + score2;
  const totalPoints = (totalGames * (totalGames + 1)) / 2;
  const remainingPoints = totalPoints - playedPoints;

  for (let i = 1; i <= totalGames; i++) {
    labels.push(i.toString());
    data.push(i);
    backgroundColors.push(i <= currentGame ? '#f1c40f' : '#2ecc71');
  }

  window.gameChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
        borderColor: '#444',
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        datalabels: {
          color: '#000',
          font: {
            weight: 'bold',
            size: 26
          },
          formatter: function (value, context) {
            return context.chart.data.labels[context.dataIndex];
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });

  document.getElementById("points-played").innerText = playedPoints;
  document.getElementById("points-left").innerText = remainingPoints;
  document.getElementById("chart-played").innerText = currentGame;
}

function animateGameTitle(text, targetElementId, isFinal = false) {
  // Fokus-Overlay einblenden
  let overlay = document.getElementById('focus-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'focus-overlay';
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'block';

  // Spielanzeige vorbereiten
  const animDiv = document.createElement("div");
  animDiv.id = "game-fly-in";
  animDiv.innerText = text;

  if (isFinal) {
    animDiv.style.color = "gold";
    animDiv.style.borderColor = "goldenrod";
    animDiv.style.textShadow = "0 0 15px gold";
    animDiv.style.background = "#111";
  }

  document.body.appendChild(animDiv);
  const target = document.getElementById(targetElementId);
  const holdTime = 3500;

  // Nach Haltezeit → fliegen lassen
  setTimeout(() => {
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    const targetX = rect.left + scrollLeft;
    const targetY = rect.top + scrollTop;

    animDiv.classList.add("fly-to-target");
    animDiv.style.left = `${targetX + 10}px`;
    animDiv.style.top = `${targetY + 5}px`;
    animDiv.style.transform = "translate(0, 0) scale(0.4)";
    animDiv.style.opacity = "0";
  }, holdTime);

  // Nach Flug entfernen + Overlay ausblenden
  setTimeout(() => {
    document.body.removeChild(animDiv);
    overlay.style.display = 'none';
  }, holdTime + 1100);
}




