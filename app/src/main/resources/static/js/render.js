// render.js
// simple role navigation helper

function selectRole(role) {
  setRole(role);
  const token = localStorage.getItem('token');

  if (role === "admin") {
    if (token) {
      window.location.href = `/adminDashboard/${encodeURIComponent(token)}`;
      return;
    } else {
      // if no token, optionally redirect to a public admin page or show login
      window.location.href = "/pages/adminDashboard.html";
      return;
    }
  } else if (role === "patient") {
    window.location.href = "/pages/patientDashboard.html";
    return;
  } else if (role === "doctor") {
    if (token) {
      window.location.href = `/doctorDashboard/${encodeURIComponent(token)}`;
      return;
    } else {
      window.location.href = "/pages/doctorDashboard.html";
      return;
    }
  }
}

// expose on window to be safe for other scripts that test window.selectRole
window.selectRole = selectRole;

function renderContent() {
  const role = getRole();
  if (!role) {
    window.location.href = "/"; // if no role, send to role selection page
    return;
  }
}
