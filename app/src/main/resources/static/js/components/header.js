// ================================
// HEADER.JS
// Dynamically renders the header based on user role and session
// ================================

function renderHeader() {
  const headerDiv = document.getElementById("header");

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

  let headerContent = `
    <header class="header">
      <div class="logo-section">
        <img src="/assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
        <span class="logo-title">Hospital CMS</span>
      </div>
      <nav>`;

  if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
  console.warn("header: role present but token missing:", role);
  // Show minimal header and don't redirect away immediately
  headerDiv.innerHTML = `
    <header class="header">
      <div class="logo-section">
        <img src="/assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
        <span class="logo-title">Hospital CMS</span>
      </div>
    </header>`;
  return;
}


  // Add role-specific buttons
  if (role === "admin") {
    headerContent += `
      <button id="addDocBtn" class="adminBtn" onclick="openModal('addDoctor')">Add Doctor</button>
      <a href="#" onclick="logout()">Logout</a>`;
  } else if (role === "doctor") {
    headerContent += `
      <button class="adminBtn" onclick="selectRole('doctor')">Home</button>
      <a href="#" onclick="logout()">Logout</a>`;
  } else if (role === "patient") {
    headerContent += `
      <button id="patientLogin" class="adminBtn">Login</button>
      <button id="patientSignup" class="adminBtn">Sign Up</button>`;
  } else if (role === "loggedPatient") {
    headerContent += `
      <button id="home" class="adminBtn" onclick="window.location.href='/pages/loggedPatientDashboard.html'">Home</button>
      <button id="patientAppointments" class="adminBtn" onclick="window.location.href='/pages/patientAppointments.html'">Appointments</button>
      <a href="#" onclick="logoutPatient()">Logout</a>`;
  }

  // Close nav and header
  headerContent += `</nav></header>`;

  // Inject into the page
  headerDiv.innerHTML = headerContent;

  // Attach additional event listeners
  attachHeaderButtonListeners();
}

// ================================
// Attach event listeners to dynamically created buttons
// ================================
function attachHeaderButtonListeners() {
  const patientLoginBtn = document.getElementById("patientLogin");
  const patientSignupBtn = document.getElementById("patientSignup");
  const addDocBtn = document.getElementById("addDocBtn");

  if (patientLoginBtn) {
    patientLoginBtn.addEventListener("click", () => openModal("patientLogin"));
  }

  if (patientSignupBtn) {
    patientSignupBtn.addEventListener("click", () => openModal("patientSignup"));
  }

  if (addDocBtn) {
    addDocBtn.addEventListener("click", () => openModal("addDoctor"));
  }
}

// ================================
// Logout Functions
// ================================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  window.location.href = "/";
}

function logoutPatient() {
  localStorage.removeItem("token");
  localStorage.setItem("userRole", "patient");
  window.location.href = "/pages/patientDashboard.html";
}

// ================================
// Initialize Header Rendering
// ================================
document.addEventListener("DOMContentLoaded", renderHeader);

// ================================
// Apply role-based background
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("userRole") || localStorage.getItem("role");

  if (role === "admin" || role === "doctor" || role === "patient") {
    document.body.classList.add("role-bg");
  }
});

