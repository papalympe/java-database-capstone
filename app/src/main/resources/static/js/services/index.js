// index.js

// Import required modules
import { openModal } from '../components/modals.js';
import { API_BASE_URL } from '../config/config.js';

// Define API endpoints
const ADMIN_API = API_BASE_URL + '/admin';
const DOCTOR_API = API_BASE_URL + '/doctor/login';

// Ensure DOM elements are loaded
window.onload = function () {
    // Select login buttons
    const adminBtn = document.getElementById('adminLogin');
    const doctorBtn = document.getElementById('doctorLogin');

    // Attach click listeners
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            openModal('adminLogin');
        });
    }

    if (doctorBtn) {
        doctorBtn.addEventListener('click', () => {
            openModal('doctorLogin');
        });
    }
};

// Admin login handler
window.adminLoginHandler = async function () {
    try {
        // Step 1: Get input values
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        // Step 2: Create admin object
        const admin = { username, password };

        // Step 3: Send POST request
        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(admin)
        });

        // Step 4: Handle response
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

// Doctor login handler
window.doctorLoginHandler = async function () {
    try {
        // Step 1: Get input values
        const email = document.getElementById('doctorEmail').value.trim();
        const password = document.getElementById('doctorPassword').value.trim();

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        // Step 2: Create doctor object
        const doctor = { email, password };

        // Step 3: Send POST request
        const response = await fetch(DOCTOR_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctor)
        });

        // Step 4: Handle response
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

// Helper function (assumes it's defined in render.js)
function selectRole(role) {
    localStorage.setItem('role', role);
    // Redirect or render pages based on role
    window.location.href = role === 'admin' ? '/admin/dashboard.html' : '/doctor/dashboard.html';
}
