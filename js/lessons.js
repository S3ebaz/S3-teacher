// lessons.js - Con lecciones de seguimiento

let lessonsData = [];
let currentModule = null;
let currentQuestionIndex = 0;
let score = 0;
let wrongQuestions = [];
let isFollowUp = false;

async function loadLessons() {
  try {
    const response = await fetch('data/lessons.json');
    lessonsData = await response.json();
    renderModules();
  } catch (e) {
    console.error('Error cargando lecciones:', e);
    lessonsData = JSON.parse(localStorage.getItem('cachedLessons') || '[]');
    if (lessonsData.length) renderModules();
  }
}

function renderModules() {
  const list = document.getElementById('modules-list');
  list.innerHTML = '';

  const semesters = {};
  lessonsData.forEach(module => {
    const sem = module.semester || 1;
    if (!semesters[sem]) semesters[sem] = [];
    semesters[sem].push(module);
  });

  Object.keys(semesters).sort((a, b) => a - b).forEach(sem => {
    const header = document.createElement('h3');
    header.style.margin = '24px 0 12px';
    header.style.color = 'var(--primary)';
    header.textContent = `Semestre ${sem}`;
    list.appendChild(header);

    semesters[sem].forEach(module => {
      const card = document.createElement('div');
      card.className = 'module-card';
      card.innerHTML = `
        <h3>${module.title}</h3>
        <p>${module.description}</p>
        <small>${module.questions.length} preguntas</small>
      `;
      card.onclick = () => startModule(module);
      list.appendChild(card);
    });
  });

  localStorage.setItem('cachedLessons', JSON.stringify(lessonsData));
}

function startModule(module, followUp = false) {
  currentModule = module;
  currentQuestionIndex = 0;
  score = 0;
  wrongQuestions = [];
  isFollowUp = followUp;
  document.getElementById('modules-list').classList.add('hidden');
  document.getElementById('quiz-container').classList.remove('hidden');
  showQuestion();
}

function showQuestion() {
  const q = currentModule.questions[currentQuestionIndex];
  const area = document.getElementById('question-area');
  const feedback = document.getElementById('feedback');
  const nextBtn = document.getElementById('next-question');
  feedback.className = 'feedback';
  feedback.textContent = '';
  nextBtn.classList.add('hidden');

  let html = `<div class="question">${q.question}</div><div class="options">`;

  if (q.type === 'multiple') {
    q.options.forEach((opt, i) => {
      html += `<button class="option" data-index="${i}">${opt}</button>`;
    });
  } else if (q.type === 'truefalse') {
    html += `<button class="option" data-value="true">Verdadero</button>`;
    html += `<button class="option" data-value="false">Falso</button>`;
  } else if (q.type === 'fill') {
    html += `<input type="text" id="fill-input" class="option" placeholder="Escribe tu respuesta..." style="width:100%;">`;
    html += `<button id="submit-fill" class="btn primary" style="margin-top:12px;">Comprobar</button>`;
  }

  html += '</div>';
  area.innerHTML = html;

  if (q.type === 'multiple' || q.type === 'truefalse') {
    area.querySelectorAll('.option').forEach(btn => {
      btn.onclick = () => checkAnswer(btn, q);
    });
  } else if (q.type === 'fill') {
    document.getElementById('submit-fill').onclick = () => {
      const input = document.getElementById('fill-input');
      checkFillAnswer(input.value.trim().toLowerCase(), q.answer.toLowerCase(), input, q);
    };
  }
}

function checkAnswer(btn, q) {
  const options = document.querySelectorAll('.option');
  options.forEach(o => o.onclick = null);

  let isCorrect = false;
  if (q.type === 'multiple') {
    isCorrect = parseInt(btn.dataset.index) === q.answer;
  } else if (q.type === 'truefalse') {
    isCorrect = (btn.dataset.value === 'true') === q.answer;
  }

  if (isCorrect) {
    btn.classList.add('correct');
    showFeedback(true);
    score++;
  } else {
    btn.classList.add('wrong');
    wrongQuestions.push(q);
    options.forEach(o => {
      if (q.type === 'multiple' && parseInt(o.dataset.index) === q.answer) o.classList.add('correct');
      if (q.type === 'truefalse' && ((o.dataset.value === 'true') === q.answer)) o.classList.add('correct');
    });
    showFeedback(false);
  }
  document.getElementById('next-question').classList.remove('hidden');
}

function checkFillAnswer(userAns, correctAns, input, q) {
  const isCorrect = userAns === correctAns;
  if (isCorrect) {
    input.classList.add('correct');
    showFeedback(true);
    score++;
  } else {
    input.classList.add('wrong');
    wrongQuestions.push(q);
    showFeedback(false, `Correcto: ${correctAns}`);
  }
  document.getElementById('next-question').classList.remove('hidden');
  document.getElementById('submit-fill').disabled = true;
}

function showFeedback(correct, extra = '') {
  const fb = document.getElementById('feedback');
  fb.className = `feedback ${correct ? 'correct' : 'wrong'}`;
  fb.textContent = correct ? '¡Correcto! 🎉' : `Incorrecto. ${extra}`;
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < currentModule.questions.length) {
    showQuestion();
  } else {
    finishModule();
  }
}

function finishModule() {
  const total = currentModule.questions.length;
  const percent = Math.round((score / total) * 100);
  let html = `
    <h3>¡Módulo completado!</h3>
    <p>Puntuación: ${score}/${total} (${percent}%)</p>
  `;

  if (wrongQuestions.length > 0 && !isFollowUp) {
    html += `<p style="color:#ff4b4b; margin-top:12px;">Te equivocaste en ${wrongQuestions.length} pregunta(s). ¿Quieres una lección de seguimiento?</p>`;
    html += `<button id="followup-btn" class="btn primary" style="margin-top:12px;">Hacer lección de seguimiento</button>`;
  }

  document.getElementById('question-area').innerHTML = html;
  document.getElementById('feedback').textContent = '';
  document.getElementById('next-question').textContent = 'Volver a módulos';
  document.getElementById('next-question').onclick = () => {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('modules-list').classList.remove('hidden');
    document.getElementById('next-question').textContent = 'Siguiente';
    document.getElementById('next-question').onclick = nextQuestion;
    updateProgress(currentModule.id);
  };

  const followBtn = document.getElementById('followup-btn');
  if (followBtn) {
    followBtn.onclick = () => startFollowUp();
  }
}

function startFollowUp() {
  if (wrongQuestions.length === 0) return;
  const followModule = {
    id: currentModule.id + '-follow',
    title: currentModule.title + ' - Seguimiento',
    description: 'Preguntas para reforzar lo que fallaste',
    questions: wrongQuestions.map(q => ({...q})),
    semester: currentModule.semester
  };
  startModule(followModule, true);
}

function updateProgress(moduleId) {
  let completed = JSON.parse(localStorage.getItem('completedModules') || '[]');
  if (!completed.includes(moduleId)) {
    completed.push(moduleId);
    localStorage.setItem('completedModules', JSON.stringify(completed));
  }
  if (typeof updateStreak === 'function') updateStreak();
  if (typeof updateHomeStats === 'function') updateHomeStats();
}

window.lessons = { loadLessons, nextQuestion };
