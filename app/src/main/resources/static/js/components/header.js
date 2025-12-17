// /js/components/header.js
// Dynamically renders the header based on user role and session
(function () {
  "use strict";

  function renderHeader() {
    const headerDiv = document.getElementById("header");
    if (!headerDiv) {
      console.warn("renderHeader: #header container not found");
      return;
    }

    // If we are on the homepage, clear session data and show minimal header
    if (window.location.pathname.endsWith("/")) {
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");

      headerDiv.innerHTML = `
        <header class="header">
          <div class="logo-section">
            <img src="/assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
            <span class="logo-title">Hospital CMS</span>
          </div>
        </header>`;
      return;
    }

    // Get user's role and token
    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");

    // If role is set but token missing, show minimal header (don't redirect)
    if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
      console.warn("header: role present but token missing:", role);
      headerDiv.innerHTML = `
        <header class="header">
          <div class="logo-section">
            <img src="/assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
            <span class="logo-title">Hospital CMS</span>
          </div>
        </header>`;
      return;
    }

    // Build header markup (NO inline onclicks)
    let headerContent = `
      <header class="header">
        <div class="logo-section">
          <img src="/assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
          <span class="logo-title">Hospital CMS</span>
        </div>
        <nav>`;

    // Add role-specific buttons (IDs only)
    if (role === "admin") {
      headerContent += `
        <button id="addDocBtn" class="adminBtn">Add Doctor</button>
        <a href="#" id="logoutLink">Logout</a>`;
    } else if (role === "doctor") {
      headerContent += `
        <button id="doctorHomeBtn" class="adminBtn">Home</button>
        <a href="#" id="logoutLink">Logout</a>`;
    } else if (role === "patient") {
      headerContent += `
        <button id="patientLogin" class="adminBtn">Login</button>
        <button id="patientSignup" class="adminBtn">Sign Up</button>`;
    } else if (role === "loggedPatient") {
      headerContent += `
        <button id="homeBtn" class="adminBtn">Home</button>
        <button id="patientAppointments" class="adminBtn">Appointments</button>
        <a href="#" id="logoutLink">Logout</a>`;
    } else {
      // default simple nav if no role
      headerContent += `<a href="/" id="homeLink">Home</a>`;
    }

    headerContent += `</nav></header>`;

    // Inject header markup
    headerDiv.innerHTML = headerContent;

    // Attach listeners to the dynamically created controls
    attachHeaderButtonListeners();
  }

  function attachHeaderButtonListeners() {
    // grab elements
    const patientLoginBtn = document.getElementById("patientLogin");
    const patientSignupBtn = document.getElementById("patientSignup");
    const addDocBtn = document.getElementById("addDocBtn");
    const doctorHomeBtn = document.getElementById("doctorHomeBtn");
    const homeBtn = document.getElementById("homeBtn");
    const patientAppointmentsBtn = document.getElementById("patientAppointments");
    const logoutLink = document.getElementById("logoutLink");
    const homeLink = document.getElementById("homeLink");

    // Use window.openModal if available (module exposes it). Warn if missing.
    if (patientLoginBtn) {
      patientLoginBtn.addEventListener("click", () => {
        if (typeof window.openModal === "function") window.openModal("patientLogin");
        else console.warn("openModal not available (patientLogin)");
      });
    }

    if (patientSignupBtn) {
      patientSignupBtn.addEventListener("click", () => {
        if (typeof window.openModal === "function") window.openModal("patientSignup");
        else console.warn("openModal not available (patientSignup)");
      });
    }

    if (addDocBtn) {
      addDocBtn.addEventListener("click", (e) => {
        if (typeof window.openModal === "function") return window.openModal("addDoctor");
        // fallback: if openRoleModal exists try it
        if (typeof window.openRoleModal === "function") return window.openRoleModal("admin");
        console.warn("openModal/openRoleModal not available (addDoc)");
      });
    }

    if (doctorHomeBtn) {
      doctorHomeBtn.addEventListener("click", () => {
        if (typeof window.selectRole === "function") return window.selectRole("doctor");
        // fallback to navigate
        window.location.href = "/pages/doctorDashboard.html";
      });
    }

    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        window.location.href = "/pages/loggedPatientDashboard.html";
      });
    }

    if (patientAppointmentsBtn) {
      patientAppointmentsBtn.addEventListener("click", () => {
        window.location.href = "/pages/patientAppointments.html";
      });
    }

    if (logoutLink) {
      logoutLink.addEventListener("click", (ev) => {
        ev.preventDefault();
        logout();
      });
    }

    if (homeLink) {
      homeLink.addEventListener("click", (ev) => {
        ev.preventDefault();
        window.location.href = "/";
      });
    }
  }

  // Logout functions (global-ish)
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = "/";
  }

  // used by patient logout flows
  function logoutPatient() {
    localStorage.removeItem("token");
    localStorage.setItem("userRole", "patient");
    window.location.href = "/pages/patientDashboard.html";
  }

  // expose logoutPatient globally because other code may call it
  window.logoutPatient = logoutPatient;

  // Initialize header rendering on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", renderHeader);

  // Apply role-based background class safely
  document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("userRole") || localStorage.getItem("role");
    if (role === "admin" || role === "doctor" || role === "patient") {
      document.body.classList.add("role-bg");
    } else {
      document.body.classList.remove("role-bg");
    }
  });

  // expose logout globally for templates that might call it
  window.logout = logout;
})();
