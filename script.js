// Elementos DOM
const startBtn = document.getElementById('start-btn');
const playerNameInput = document.getElementById('player-name');
const nameScreen = document.getElementById('name-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const playerDisplayName = document.getElementById('player-display-name');

const adVideo = document.getElementById('ad-video');
const adImage = document.getElementById('ad-image');
const btnTrue = document.getElementById('btn-true');
const btnFalse = document.getElementById('btn-false');

const feedbackMessage = document.getElementById('feedback-message');
const scoreDisplay = document.getElementById('score');
const playerFinalName = document.getElementById('player-final-name');
const finalScore = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again');

const timerText = document.getElementById('timer-text');
const timerProgress = document.getElementById('timer-progress');

let playerName = '';
let score = 0;
let currentVideoIndex = 0;
let timer;
let timerRunning = false;
let timeLeft = 20;

const TIMER_DURATION = 130;

let videos = [
  { src: 'videos/video1.mp4', correctAnswer: true, type: 'video' },
  { src: 'videos/video2.mp4', correctAnswer: false, type: 'video' },
  { src: 'videos/video3.mp4', correctAnswer: true, type: 'video' },
  { src: 'images/final-image.jpg', correctAnswer: false, type: 'image' }
];

// Función para mezclar un arreglo (Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Función para mostrar solo una pantalla
function showScreen(screen) {
  nameScreen.classList.remove('active');
  gameScreen.classList.remove('active');
  endScreen.classList.remove('active');
  screen.classList.add('active');
}

// Cargar video o imagen actual
function loadVideo() {
  const currentMedia = videos[currentVideoIndex];

  // Asegurarse de pausar cualquier video anterior
  adVideo.pause();
  adVideo.currentTime = 0; // Reiniciar al inicio del video

  // Ocultar ambos para reiniciar visual
  adVideo.style.display = 'none';
  adImage.style.display = 'none';

  if (currentMedia.type === 'video') {
    adVideo.src = currentMedia.src;
    adVideo.style.display = 'block';
    adVideo.load();
    adVideo.play();

    adVideo.onplay = () => {
      if (!timerRunning) {
        startTimer();
      }
    };
  } else if (currentMedia.type === 'image') {
    adImage.src = currentMedia.src;
    adImage.style.display = 'block';

    // Espera pequeña para asegurar que esté visible antes del timer
    setTimeout(() => {
      if (!timerRunning) {
        startTimer();
      }
    }, 500);
  }

  resetTimer();
  feedbackMessage.textContent = '';
}


  
// Actualiza el visual del temporizador circular
function updateTimerVisual(seconds) {
  timerText.textContent = seconds;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - seconds / TIMER_DURATION);
  timerProgress.style.strokeDashoffset = offset;
}

// Temporizador
function startTimer() {
  timeLeft = TIMER_DURATION;
  timerRunning = true;
  updateTimerVisual(timeLeft);

  timer = setInterval(() => {
    timeLeft--;
    updateTimerVisual(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timer);
      timerRunning = false;
      feedbackMessage.textContent = '⏰ Tiempo agotado';
      feedbackMessage.style.color = '#ff9800';
      feedbackMessage.classList.add('show');

      setTimeout(() => {
        feedbackMessage.classList.remove('show');
        nextQuestion();
      }, 1500);
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  timerRunning = false;
}

function resetTimer() {
  pauseTimer();
  updateTimerVisual(TIMER_DURATION);
}

// Mostrar feedback
function feedback(correct) {
  if (correct) {
    feedbackMessage.textContent = '¡Correcto!';
    feedbackMessage.style.color = '#4caf50';
  } else {
    feedbackMessage.textContent = 'Incorrecto';
    feedbackMessage.style.color = '#f44336';
  }
  feedbackMessage.classList.add('show');
}

// Siguiente video o pantalla final
function nextQuestion() {
  currentVideoIndex++;
  if (currentVideoIndex >= videos.length) {
    showFinalScreen();
  } else {
    loadVideo();
  }
}

// Pantalla final
function showFinalScreen() {
  showScreen(endScreen);
  playerFinalName.textContent = playerName;
  finalScore.textContent = score;
  updateLeaderboard(playerName, score);
}

// Manejar respuesta
function handleAnswer(answer) {
  if (!timerRunning) return;

  pauseTimer();

  const correct = videos[currentVideoIndex].correctAnswer === answer;
  if (correct) {
    let points = 1;
    const bonus = Math.floor((timeLeft / TIMER_DURATION) * 2);
    points += bonus;
    score += points;
  }

  scoreDisplay.textContent = `Puntaje: ${score}`;
  feedback(correct);

  setTimeout(() => {
    feedbackMessage.classList.remove('show');
    nextQuestion();
  }, 1200);
}

// Eventos

startBtn.addEventListener('click', () => {
  const name = playerNameInput.value.trim();
  if (name === '') {
    alert('Por favor ingresa tu nombre');
    return;
  }

  playerName = name;
  score = 0;
  currentVideoIndex = 0;
  scoreDisplay.textContent = `Puntaje: ${score}`;
  playerDisplayName.textContent = `Jugador: ${playerName}`;

  shuffleArray(videos); // Mezclar el orden de las preguntas

  showScreen(gameScreen);
  loadVideo();
});

adVideo.addEventListener('play', () => {
  if (!timerRunning) {
    startTimer();
  }
});

btnTrue.addEventListener('click', () => handleAnswer(true));
btnFalse.addEventListener('click', () => handleAnswer(false));

playAgainBtn.addEventListener('click', () => {
  showScreen(nameScreen);
  playerNameInput.value = '';
});

// Leaderboard
function updateLeaderboard(name, score) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push({ name, score });

  leaderboard.sort((a, b) => b.score - a.score);
  const top5 = leaderboard.slice(0, 5);
  localStorage.setItem('leaderboard', JSON.stringify(top5));

  renderLeaderboard(top5);
}

function renderLeaderboard(data) {
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';

  data.forEach((entry, index) => {
    const div = document.createElement('div');
    div.classList.add('entry');
    div.innerHTML = `
      <div class="name">🏅 ${index + 1}. ${entry.name}</div>
      <div class="score">${entry.score} pts</div>
    `;
    list.appendChild(div);
  });
}
