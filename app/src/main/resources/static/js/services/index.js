// /js/services/index.js  (module entrypoint)
import { openModal as _openModal } from '/js/components/modals.js';
import { API_BASE_URL } from '/js/config/config.js';

// expose some helpers to the global scope so non-module scripts can call them
window.openModal = _openModal;

// Endpoints
const ADMIN_API = API_BASE_URL + '/admin';
const DOCTOR_API = API_BASE_URL + '/doctor/login';


export function openRoleModal(role) {
  const key = (role || '').toLowerCase();
  if (key === 'admin') return window.openModal?.('adminLogin');
  if (key === 'doctor') return window.openModal?.('doctorLogin');
  return window.openModal?.('patientLogin');
};

// keep global for legacy inline onclicks
window.openRoleModal = openRoleModal;

// Admin login handler
window.adminLoginHandler = async function () {
  try {
    const username = document.getElementById('username')?.value?.trim() || '';
    const password = document.getElementById('password')?.value?.trim() || '';

    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }

    const response = await fetch(ADMIN_API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      alert('Invalid credentials!');
      return;
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', 'admin');

    // navigate to server-protected page (server controller will validate token)
    window.location.href = `/adminDashboard/${encodeURIComponent(data.token)}`;

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

    window.location.href = `/doctorDashboard/${encodeURIComponent(data.token)}`;

  } catch (error) {
    console.error('Doctor login error:', error);
    alert('Something went wrong. Please try again.');
  }
};

// Patient signup & login keep as before but in global scope
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
    document.getElementById('modal').style.display = 'none';

  } catch (err) {
    console.error("Signup error:", err);
    alert("Signup error");
  }
};

window.loginPatient = async function () {
  try {
    const email = document.getElementById('email')?.value?.trim() || '';
    const password = document.getElementById('password')?.value?.trim() || '';

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
