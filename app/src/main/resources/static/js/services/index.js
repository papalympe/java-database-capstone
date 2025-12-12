// /js/services/index.js  (module entrypoint)
import { openModal } from '../components/modals.js';
import { API_BASE_URL } from '../config/config.js';

// Define API endpoints
const ADMIN_API = API_BASE_URL + '/admin';
const DOCTOR_API = API_BASE_URL + '/doctor/login';

// --- Expose a global wrapper used by inline onclick in index.html ---
window.openRoleModal = function(role) {
    // map simple role names to modal types used inside modals.js
    switch ((role || '').toLowerCase()) {
        case 'admin':
            openModal('adminLogin');
            break;
        case 'doctor':
            openModal('doctorLogin');
            break;
        case 'patient':
            // you may prefer to show login or signup - here we show login
            openModal('patientLogin');
            break;
        default:
            console.warn('Unknown role for modal:', role);
            openModal('patientLogin');
    }
};

// Optionally attach listeners to the top-level buttons (redundant if using onclick)
document.addEventListener('DOMContentLoaded', () => {
    const adminBtn = document.getElementById('adminBtn');
    const doctorBtn = document.getElementById('doctorBtn');
    const patientBtn = document.getElementById('patientBtn');

    if (adminBtn) adminBtn.addEventListener('click', () => window.openRoleModal('admin'));
    if (doctorBtn) doctorBtn.addEventListener('click', () => window.openRoleModal('doctor'));
    if (patientBtn) patientBtn.addEventListener('click', () => window.openRoleModal('patient'));
});

// ------------------- Handlers -------------------
// NOTE: These handlers must match the input IDs used inside the modal HTML in modals.js

// Admin login handler - using modal ids 'username' and 'password' (per modals.js)
window.adminLoginHandler = async function () {
    try {
        const usernameEl = document.getElementById('username');
        const passwordEl = document.getElementById('password');
        const username = usernameEl ? usernameEl.value.trim() : '';
        const password = passwordEl ? passwordEl.value.trim() : '';

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        const admin = { username, password };

        const response = await fetch(ADMIN_API + '/login', { // ensure correct backend path
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(admin)
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            selectRole('admin');
        } else {
            alert('Invalid credentials!');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        alert('Something went wrong. Please try again.');
    }
};

// Doctor login handler - modal uses ids 'email' & 'password'
window.doctorLoginHandler = async function () {
    try {
        const emailEl = document.getElementById('email');
        const passwordEl = document.getElementById('password');
        const email = emailEl ? emailEl.value.trim() : '';
        const password = passwordEl ? passwordEl.value.trim() : '';

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        const doctor = { identifier: email, password }; // if backend expects identifier OR {email,password}
        // adjust payload to your backend contract: earlier you used Login DTO with 'identifier'
        const payload = { identifier: email, password };

        const response = await fetch(DOCTOR_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            selectRole('doctor');
        } else {
            alert('Invalid credentials!');
        }
    } catch (error) {
        console.error('Doctor login error:', error);
        alert('Something went wrong. Please try again.');
    }
};

// Helper selectRole
function selectRole(role) {
    localStorage.setItem('role', role);
    // Redirect or render pages based on role
    if (role === 'admin') {
        window.location.href = '/templates/admin/adminDashboard.html';
    } else if (role === 'doctor') {
        window.location.href = '/templates/doctor/doctorDashboard.html';
    } else {
        window.location.href = '/';
    }
}
