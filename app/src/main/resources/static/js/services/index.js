// /js/services/index.js  (module entrypoint)
// NOTE: uses dynamic import for modals so openModal is always available when called.

import { API_BASE_URL } from '../config/config.js';

// Define API endpoints
const ADMIN_API = API_BASE_URL + '/admin';
const DOCTOR_API = API_BASE_URL + '/doctor/login';

// internal cache for dynamically imported module
let _modalModule = null;

/**
 * Ensure modals module is loaded and cached.
 * returns promise resolving to the module namespace (with openModal exported)
 */
async function ensureModalModule() {
  if (_modalModule) return _modalModule;
  // dynamic import - path relative to this file
  _modalModule = await import('../components/modals.js');
  return _modalModule;
}

/**
 * Global wrapper used by inline onclick and by programmatic clicks.
 * Maps simple role names -> modal types expected by openModal.
 */
window.openRoleModal = async function(role) {
  try {
    const mod = await ensureModalModule();
    const r = (role || '').toString().toLowerCase();

    // map role -> modal type that mod.openModal expects
    if (r === 'admin') {
      mod.openModal('adminLogin');
    } else if (r === 'doctor') {
      mod.openModal('doctorLogin');
    } else {
      mod.openModal('patientLogin');
    }

    // show role background immediately for UX (logo background)
    try {
      document.body.classList.add('role-bg');
    } catch (e) {
      // ignore if body not available
      // console.warn('Could not add role-bg', e);
    }

  } catch (err) {
    console.error('Failed to open role modal:', err);
    alert('Κάτι πήγε στραβά με το modal. Δες console για λεπτομέρειες.');
  }
};

// Also attach click listeners to buttons (degraded / redundant with inline onclick)
document.addEventListener('DOMContentLoaded', () => {
  const adminBtn = document.getElementById('adminBtn');
  const doctorBtn = document.getElementById('doctorBtn');
  const patientBtn = document.getElementById('patientBtn');

  if (adminBtn) {
    adminBtn.addEventListener('click', (e) => {
      // keep previous inline attribute behavior but route through wrapper
      window.openRoleModal('admin');
    });
  }
  if (doctorBtn) {
    doctorBtn.addEventListener('click', (e) => {
      window.openRoleModal('doctor');
    });
  }
  if (patientBtn) {
    patientBtn.addEventListener('click', (e) => {
      window.openRoleModal('patient');
    });
  }
});

/* ===========================
   AUTH & LOGIN HANDLERS
   (unchanged logic, slightly hardened)
   =========================== */

// Admin login handler
window.adminLoginHandler = async function () {
  try {
    const username = document.getElementById('username')?.value?.trim() || '';
    const password = document.getElementById('password')?.value?.trim() || '';

    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }

    const admin = { username, password };

    const response = await fetch(ADMIN_API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin)
    });

    if (!response.ok) {
      alert('Invalid credentials!');
      return;
    }

    const data = await response.json();

    // Save token & canonical role BEFORE navigation
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', 'admin');

    // Navigate once, using the returned token
    window.location.href = `/adminDashboard/${data.token}`;

  } catch (error) {
    console.error('Admin login error:', error);
    alert('Something went wrong. Please try again.');
  }
};

// Doctor login handler
window.doctorLoginHandler = async function () {
  try {
    const email = document.getElementById('email')?.value?.trim() || '';
    const password = document.getElementById('password')?.value?.trim() || '';

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    const payload = { identifier: email, password };

    const response = await fetch(DOCTOR_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      alert('Invalid credentials!');
      return;
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', 'doctor');

    window.location.href = `/doctorDashboard/${data.token}`;

  } catch (error) {
    console.error('Doctor login error:', error);
    alert('Something went wrong. Please try again.');
  }
};

// Patient signup/login (same as before)
window.signupPatient = async function () {
  try {
    const payload = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      address: document.getElementById("address").value.trim(),
      gender: "MALE"
    };

    const response = await fetch(API_BASE_URL + '/patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      alert("Signup failed");
      return;
    }

    alert("Signup successful! Please login.");
    document.getElementById('modal')?.style?.display = 'none';

  } catch (err) {
    console.error("Signup error:", err);
    alert("Signup error");
  }
};

window.loginPatient = async function () {
  try {
    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');

    const email = emailEl ? emailEl.value.trim() : '';
    const password = passwordEl ? passwordEl.value.trim() : '';

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    const response = await fetch(API_BASE_URL + '/patient/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      alert('Invalid credentials');
      return;
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', 'patient');

    window.location.href = '/pages/patientDashboard.html';

  } catch (err) {
    console.error('Patient login error:', err);
    alert('Login failed');
  }
};

// selectRole helper kept for compatibility
function selectRole(role) {
  localStorage.setItem('userRole', role);
  const token = localStorage.getItem('token');
  if (role === 'admin') {
    if (token) window.location.href = `/adminDashboard/${token}`;
    else window.location.href = '/pages/adminDashboard.html';
  } else if (role === 'doctor') {
    if (token) window.location.href = `/doctorDashboard/${token}`;
    else window.location.href = '/pages/doctorDashboard.html';
  } else if (role === 'patient') {
    window.location.href = '/pages/patientDashboard.html';
  }
}
