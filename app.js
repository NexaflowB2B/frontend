// ===== Finventory - Shared JS Utilities =====
// All API calls go through the nginx reverse proxy.

const AUTH_URL = '/api/auth';
const INVENTORY_URL = '/api/inventory';
const FINANCE_URL = '/api/finance';
const INVOICE_URL = '/api/invoice';
const AI_URL = '/api/ai';
const ANALYTICS_URL = '/api/invoice';
const OCR_URL = '/api/ocr';

function getToken() {
  return localStorage.getItem('token');
}

function getRole() {
  return localStorage.getItem('role');
}

function getUsername() {
  return localStorage.getItem('nexaflow_username') || localStorage.getItem('username');
}

function getEmail() {
  return localStorage.getItem('nexaflow_email') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

function checkAuth() {
  if (!getToken()) {
    globalThis.location.href = 'login.html';
    return false;
  }
  return true;
}

function enforceRoleAccess(allowedRoles) {
  if (!checkAuth()) {
    return;
  }
  const currentRole = getRole();
  if (!allowedRoles.includes(currentRole)) {
    const nextPage = currentRole === 'admin' ? 'admin.html' : 'dashboard.html';
    globalThis.location.replace(nextPage);
  }
}

function logout() {
  localStorage.clear();
  globalThis.location.href = 'login.html';
}

async function apiFetch(url, options = {}) {
  let response;
  try {
    const isGet = !options.method || options.method.toUpperCase() === 'GET';
    let finalUrl = url;
    if (isGet) {
      const separator = url.includes('?') ? '&' : '?';
      finalUrl = `${url}${separator}t=${Date.now()}`;
    }
    response = await fetch(finalUrl, options);
  } catch (error_) {
    console.error('Network Error:', error_);
    throw new Error('Cannot reach the server. Please check your connection.');
  }

  if (response.status === 401) {
    logout();
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text.trim() || `Server error (${response.status})`);
    }
    return text;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || data.message || `Server error (${response.status})`);
  }
  return data;
}

function fmtDate(iso) {
  if (!iso) {
    return '-';
  }
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function fmtMoney(n) {
  const amount = Number.parseFloat(n || 0);
  return `Rs ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function setActiveNav() {
  const page = location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach((link) => {
    if (link.getAttribute('href') === page) {
      link.classList.add('active');
    }
  });
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

globalThis.showToast = function showToast(message, type) {
  if (type === 'error') {
    console.error('Toast Error:', message);
    return;
  }
  console.log('Toast:', message);
};
