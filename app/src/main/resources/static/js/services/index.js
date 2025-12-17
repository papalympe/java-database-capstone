// /js/services/index.js
import { openModal } from '../components/modals.js';
import { API_BASE_URL } from '../config/config.js';

const ADMIN_API = API_BASE_URL + '/admin';
const DOCTOR_API = API_BASE_URL + '/doctor/login';

/* ===============================
   ROLE MODAL ENTRY POINT
================================ */
window.openRoleModal = function (role) {
  switch ((role || '').toLowerCase()) {
    case 'admin':
      openModal('adminLogin');
      break;
    case 'doctor':
      openModal('doctorLogin');
      break;
    case 'patient':
      openModal('patientLogin');
      break;
    default:
      openModal('patientLogin');
  }
};

/* ===============================
   ADMIN LOGIN
================================ */
window.adminLoginHandler = async function () {
  try {
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value.trim();

    if (!username || !password) {
      alert('Please enter username and password');
      return;
    }

    const res = await fetch(`${ADMIN_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      alert('Invalid credentials');
      return;
    }

    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', 'admin');

    window.location.href = `/adminDashboard/${data.token}`;
  } catch (e) {
    console.error(e);
    alert('Admin login failed');
  }
};

/* ===============================
   DOCTOR LOGIN
================================ */
window.doctorLoginHandler = async function () {
  try {
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    const res = await fetch(DOCTOR_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password })
    });

    if (!res.ok) {
      alert('Invalid credentials');
      return;
    }

    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', 'doctor');

    window.location.href = `/doctorDashboard/${data.token}`;
  } catch (e) {
    console.error(e);
    alert('Doctor login failed');
  }
};

/* ===============================
   PATIENT SIGNUP
================================ */
window.signupPatient = async function () {
  try {
    const payload = {
      name: document.getElementById("name")?.value.trim(),
      email: document.getElementById("email")?.value.trim(),
      password: document.getElementById("password")?.value.trim(),
      phone: document.getElementById("phone")?.value.trim(),
      address: document.getElementById("address")?.value.trim(),
      gender: "MALE"
    };

    const res = await fetch(`${API_BASE_URL}/patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      alert('Signup failed');
      return;
    }

    alert('Signup successful');
    document.getElementById('modal').style.display = 'none';
  } catch (e) {
    console.error(e);
    alert('Signup error');
  }
};

/* ===============================
   PATIENT LOGIN
================================ */
window.loginPatient = async function () {
  try {
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    const res = await fetch(`${API_BASE_URL}/patient/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      alert('Invalid credentials');
      return;
    }

    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', 'patient');

    window.location.href = '/pages/patientDashboard.html';
  } catch (e) {
    console.error(e);
    alert('Patient login failed');
  }
};
