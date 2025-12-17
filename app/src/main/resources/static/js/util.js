// util.js
// small helpers for storing role in localStorage

function setRole(role) {
  localStorage.setItem("userRole", role);
}

function getRole() {
  return localStorage.getItem("userRole");
}

function clearRole() {
  localStorage.removeItem("userRole");
}

// expose on window so other modules/non-module scripts can call them safely
window.setRole = setRole;
window.getRole = getRole;
window.clearRole = clearRole;

  
