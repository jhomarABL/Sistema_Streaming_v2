
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

async function loadDashboard() {
  const auth = requireAuth();
  if (!auth) return;
  document.getElementById('userEmail').textContent = auth.user.correo;
  if (auth.user.rol === 'ADMIN') {
    const linkAdmin = document.getElementById('linkAdmin');
    if (linkAdmin) linkAdmin.style.display = 'block';
  }
  const rowsContainer = document.getElementById('rows');
  rowsContainer.innerHTML = '';
  const headers = { Authorization: `Bearer ${auth.token}` };
  const [moviesRes, seriesRes] = await Promise.all([
    fetch(`${API_BASE}/media/movies`, { headers }),
    fetch(`${API_BASE}/media/series`, { headers }),
  ]);
  const movies = await moviesRes.json();
  const series = await seriesRes.json();

  function createRow(title, items, type) {
    const section = document.createElement('section');
    section.className = 'catalog-row';
    section.innerHTML = `<h2>${title}</h2>`;
    const scroller = document.createElement('div');
    scroller.className = 'horizontal-scroll';
    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card-media';
      const poster = '../assets/placeholder.png';
      card.innerHTML = `
        <img src="${poster}" alt="${item.titulo}" />
        <div class="card-media-overlay">
          <div class="card-media-title">${item.titulo}</div>
          <div class="card-media-meta">${type === 'movie' ? (item.anio_estreno || '') : (item.anio_inicio_emision || '')}</div>
        </div>`;
      card.addEventListener('click', () => {
        const params = new URLSearchParams({ type, id: type === 'movie' ? item.id_pelicula : item.id_serie });
        window.location.href = `./player.html?${params.toString()}`;
      });
      scroller.appendChild(card);
    });
    section.appendChild(scroller);
    rowsContainer.appendChild(section);
  }

  if (Array.isArray(movies) && movies.length) {
    createRow('Películas', movies, 'movie');
  }
  if (Array.isArray(series) && series.length) {
    createRow('Series', series, 'series');
  }
}

function logout() {
  localStorage.removeItem('auth');
  window.location.href = './login.html';
}

if (document.getElementById('btnLogout')) {
  document.getElementById('btnLogout').addEventListener('click', logout);
}

window.addEventListener('DOMContentLoaded', loadDashboard);
