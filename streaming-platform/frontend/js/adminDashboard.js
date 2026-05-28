
const API_BASE = '/api';

function getAuth() {
  const raw = localStorage.getItem('auth');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function requireAdmin() {
  const auth = getAuth();
  if (!auth || !auth.token || auth.user.rol !== 'ADMIN') {
    window.location.href = './dashboard.html';
    return null;
  }
  return auth;
}

function logout() {
  localStorage.removeItem('auth');
  window.location.href = './login.html';
}

async function loadAdminDashboard() {
  const auth = requireAdmin();
  if (!auth) return;
  if (document.getElementById('btnLogout')) {
    document.getElementById('btnLogout').addEventListener('click', logout);
  }
  const container = document.getElementById('adminDashboard');
  const res = await fetch(`${API_BASE}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  const data = await res.json();

  container.innerHTML = `
    <div class="panel">
      <h3>Métricas generales</h3>
      <p>Total usuarios: <strong>${data.total_usuarios}</strong></p>
      <p>Total películas: <strong>${data.total_peliculas}</strong></p>
      <p>Total series: <strong>${data.total_series}</strong></p>
    </div>
    <div class="panel">
      <h3>Contenido más visto</h3>
      <p class="chip">Películas</p>
      <ul style="font-size:0.85rem;margin-top:4px;">
        ${data.mas_visto_peliculas.map(p => `<li>${p.titulo} · ${p.reproducciones} reproducciones</li>`).join('')}
      </ul>
      <p class="chip" style="margin-top:10px;">Episodios</p>
      <ul style="font-size:0.85rem;margin-top:4px;">
        ${data.mas_visto_episodios.map(e => `<li>${e.titulo} · ${e.reproducciones} reproducciones</li>`).join('')}
      </ul>
    </div>
    <div class="panel" style="grid-column:1/ -1;">
      <h3>Actividad reciente</h3>
      <table class="table">
        <thead>
          <tr><th>Usuario</th><th>Fecha</th><th>Tiempo (min)</th><th>Estado</th></tr>
        </thead>
        <tbody>
          ${data.actividad_reciente.map(a => `<tr><td>${a.correo || ''}</td><td>${a.fecha_reproduccion || ''}</td><td>${a.tiempo_reproducido || ''}</td><td>${a.tipo_estado || ''}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

window.addEventListener('DOMContentLoaded', loadAdminDashboard);
