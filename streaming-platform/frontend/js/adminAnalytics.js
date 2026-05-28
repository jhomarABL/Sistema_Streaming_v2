
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

async function runQuery() {
  const auth = requireAdmin();
  if (!auth) return;
  const sql = document.getElementById('sql').value;
  const resDiv = document.getElementById('results');
  resDiv.textContent = 'Ejecutando...';
  try {
    const res = await fetch(`${API_BASE}/admin/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ sql }),
    });
    const data = await res.json();
    if (!res.ok) {
      resDiv.textContent = data.message || 'Error en consulta';
      return;
    }
    const headers = data.fields;
    const rows = data.rows;
    if (!rows.length) {
      resDiv.textContent = 'Sin resultados';
      return;
    }
    let html = '<table class="table"><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
    html += rows.map(r => '<tr>' + headers.map(h => `<td>${r[h] ?? ''}</td>`).join('') + '</tr>').join('');
    html += '</tbody></table>';
    resDiv.innerHTML = html;
  } catch (e) {
    resDiv.textContent = 'Error de red';
  }
}

function initAnalytics() {
  const auth = requireAdmin();
  if (!auth) return;
  if (document.getElementById('btnLogout')) {
    document.getElementById('btnLogout').addEventListener('click', logout);
  }
  document.getElementById('btnRun').addEventListener('click', runQuery);
}

window.addEventListener('DOMContentLoaded', initAnalytics);
