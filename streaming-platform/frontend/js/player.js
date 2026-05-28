
const API_BASE = '/api';

function getAuth() {
  const raw = localStorage.getItem('auth');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function requireAuth() {
  const auth = getAuth();
  if (!auth || !auth.token) {
    window.location.href = './login.html';
    return null;
  }
  return auth;
}

function logout() {
  localStorage.removeItem('auth');
  window.location.href = './login.html';
}

async function initPlayer() {
  const auth = requireAuth();
  if (!auth) return;
  document.getElementById('btnLogout').addEventListener('click', logout);
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const id = params.get('id');
  const video = document.getElementById('video');
  const titleEl = document.getElementById('playerTitle');

  if (type === 'movie') {
    const res = await fetch(`${API_BASE}/media/movies/${id}`, { headers: { Authorization: `Bearer ${auth.token}` } });
    const movie = await res.json();
    titleEl.textContent = movie.titulo;
    video.src = `${API_BASE}/media/movies/${id}/stream`;
  } else if (type === 'episode') {
    video.src = `${API_BASE}/media/episodes/${id}/stream`;
  }
}

window.addEventListener('DOMContentLoaded', initPlayer);
