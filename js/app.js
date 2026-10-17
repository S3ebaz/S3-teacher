// app.js - Lógica principal: navegación, streaks, offline

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Navegación
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.id.replace('nav-', 'section-');
      showSection(section);
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('start-learning').onclick = () => {
    document.getElementById('nav-lessons').click();
  };

  document.getElementById('save-note').onclick = () => window.notebook.saveNote();
  document.getElementById('file-input').onchange = (e) => window.notebook.handleFileUpload(e.target.files);
  document.getElementById('next-question').onclick = () => window.lessons.nextQuestion();
  document.getElementById('reset-progress').onclick = resetProgress;

  // Cargar datos
  window.lessons.loadLessons();
  window.notebook.initNotebook();
  updateStreak();
  updateHomeStats();
  registerServiceWorker();
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function updateStreak() {
  const today = new Date().toDateString();
  let last = localStorage.getItem('lastActivity');
  let streak = parseInt(localStorage.getItem('streak') || '0');

  if (last !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (last === yesterday.toDateString()) {
      streak++;
    } else if (last !== today) {
      streak = 1; // reinicia si más de un día
    }
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastActivity', today);
  }

  document.getElementById('streak-display').textContent = `🔥 ${streak}`;
  document.getElementById('home-streak').textContent = streak;
}

function updateHomeStats() {
  const completed = JSON.parse(localStorage.getItem('completedModules') || '[]');
  document.getElementById('home-lessons').textContent = completed.length;
  // Profile
  const profile = document.getElementById('profile-stats');
  profile.innerHTML = `
    <div class="stat-card"><h3>${localStorage.getItem('streak') || 0}</h3><p>Racha</p></div>
    <div class="stat-card"><h3>${completed.length}</h3><p>Módulos</p></div>
  `;
}

function resetProgress() {
  if (confirm('¿Seguro que quieres reiniciar todo el progreso?')) {
    localStorage.removeItem('streak');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('completedModules');
    location.reload();
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('SW registrado'))
      .catch(e => console.log('SW error', e));
  }
}

// Actualizar streak al interactuar
['click', 'input'].forEach(ev => {
  document.addEventListener(ev, () => {
    if (ev === 'click' || (ev === 'input' && document.activeElement.id === 'note-text')) {
      updateStreak();
    }
  }, { once: false });
});
