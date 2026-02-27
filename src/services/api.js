const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token') || '';
}

function headers(extra = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(url, options = {}) {
  const res = await fetch(API_BASE + url, {
    ...options,
    headers: headers(options.headers),
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Error ${res.status}`);
  }

  const ct = res.headers.get('Content-Type') || '';
  if (res.status === 204 || !ct.includes('application/json')) return null;
  return res.json();
}

// Auth
export const authService = {
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  registro: (data) => request('/auth/registro', { method: 'POST', body: JSON.stringify(data) }),
};

// Pacientes
export const pacienteService = {
  getAll: () => request('/pacientes'),
  getById: (id) => request(`/pacientes/${id}`),
  getByCodigo: (codigo) => request(`/pacientes/buscar/codigo/${codigo}`),
  getByDni: (dni) => request(`/pacientes/buscar/dni/${dni}`),
  buscarNombre: (nombre) => request(`/pacientes/buscar/nombre?nombre=${encodeURIComponent(nombre)}`),
  create: (data) => request('/pacientes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/pacientes/${id}`, { method: 'DELETE' }),
};

// Citas
export const citaService = {
  getAll: () => request('/citas'),
  getById: (id) => request(`/citas/${id}`),
  create: (data) => request('/citas', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/citas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/citas/${id}`, { method: 'DELETE' }),
};

// Historial Médico
export const historialService = {
  getAll: () => request('/historial'),
  getById: (id) => request(`/historial/${id}`),
  getByPaciente: (pacienteId) => request(`/historial/paciente/${pacienteId}`),
  create: (data) => request('/historial', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/historial/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/historial/${id}`, { method: 'DELETE' }),
};
