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
let currentIndex = 0;
let timer;
let timerRunning = false;
let timeLeft = 20;

const TIMER_DURATION = 130;

const originalQuestions = [
  { src: 'videos/video1.mp4', correctAnswer: true, type: 'video' },
  { src: 'videos/video2.mp4', correctAnswer: false, type: 'video' },
  { src: 'videos/video3.mp4', correctAnswer: true, type: 'video' },
  { src: 'images/final-image.jpg', correctAnswer: false, type: 'image' }
];

let questions = [];

// Función para mezclar las preguntas aleatoriamente
function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// Mostrar solo una pantalla
function showScreen(screen) {
  nameScreen.classList.remove('active');
  gameScreen.classList.remove('active');
  endScreen.classList.remove('active');
  screen.classList.add('active');
}

// Cargar pregunta (video o imagen)
function loadQuestion() {
  const currentMedia = questions[currentIndex];

  adVideo.pause();
  adVideo.currentTime = 0;

  if (currentMedia.type === 'video') {
    adVideo.src = currentMedia.src;
    adVideo.style.display = 'block';
    adImage.style.display = 'none';
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
    adVideo.style.display = 'none';

    setTimeout(() => {
      if (!timerRunning) {
        startTimer();
      }
    }, 500);
  }

  resetTimer();
  feedbackMessage.textContent = '';
}

// Temporizador circular
function updateTimerVisual(seconds) {
  timerText.textContent = seconds;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - seconds / TIMER_DURATION);
  timerProgress.style.strokeDashoffset = offset;
}

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

// Ir a la siguiente pregunta
function nextQuestion() {
  adVideo.pause();
  adVideo.currentTime = 0;

  currentIndex++;
  if (currentIndex >= questions.length) {
    showFinalScreen();
  } else {
    loadQuestion();
  }
}

// Mostrar pantalla final
function showFinalScreen() {
  adVideo.pause();
  adVideo.currentTime = 0;
  adVideo.src = '';

  pauseTimer();

  showScreen(endScreen);
  playerFinalName.textContent = playerName;
  finalScore.textContent = score;
  updateLeaderboard(playerName, score);
}

// Manejar respuesta
function handleAnswer(answer) {
  if (!timerRunning) return;

  pauseTimer();

  const correct = questions[currentIndex].correctAnswer === answer;
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
  currentIndex = 0;
  questions = shuffleArray([...originalQuestions]);
  scoreDisplay.textContent = `Puntaje: ${score}`;
  playerDisplayName.textContent = `Jugador: ${playerName}`;

  showScreen(gameScreen);
  loadQuestion();
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
