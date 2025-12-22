// app/src/main/resources/static/js/adminHandlers.js
// Non-module so it attaches a global function that modals.safeBind can call.

(function () {
  "use strict";

  // adminAddDoctor -> called by modals.safeBind("#saveDoctorBtn","adminAddDoctor")
  window.adminAddDoctor = async function adminAddDoctor() {
    try {
      const nameEl = document.getElementById("doctorName");
      const specEl = document.getElementById("specialization");
      const emailEl = document.getElementById("doctorEmail");
      const passEl = document.getElementById("doctorPassword");
      const saveBtn = document.getElementById("saveDoctorBtn");

      const name = nameEl ? nameEl.value.trim() : "";
      const specialty = specEl ? specEl.value.trim() : "";
      const email = emailEl ? emailEl.value.trim() : "";
      const password = passEl ? passEl.value : "";

      if (!name || !specialty || !email || !password) {
        alert("Please fill all fields.");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }

      // simple UI feedback
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.dataset.origText = saveBtn.textContent;
        saveBtn.textContent = "Saving...";
      }

      // token (admin) if present in localStorage
      const token = localStorage.getItem("token") || "";

      // Endpoint: match doctorServices.saveDoctor -> `${DOCTOR_API}?token=${token}`
      // If your backend uses a prefix (e.g. /api/doctor) update this url accordingly.
      const url = token ? `/doctor?token=${encodeURIComponent(token)}` : `/doctor`;

      const payload = { name, specialty, email, password };

      let res, data;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        // try parse json
        data = await res.json().catch(() => ({}));
      } catch (fetchErr) {
        console.error("adminAddDoctor fetch error:", fetchErr);
        alert("Network error while adding doctor.");
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = saveBtn.dataset.origText || "Save"; }
        return;
      }

      if (res.ok) {
        alert(data.message || "Doctor added successfully.");
        // close modal if present
        const modal = document.getElementById("modal");
        if (modal) {
          modal.style.display = "none";
          modal.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
        }
        // Best-effort refresh: try to trigger a refresh event for admin page
        // If adminDashboard has a global function to reload, it will run; otherwise reload page.
        if (typeof window.loadDoctorCards === "function") {
          try { window.loadDoctorCards(); } catch(e) { window.location.reload(); }
        } else {
          window.location.reload();
        }
      } else {
        const errMsg = data.error || data.message || `Failed to add doctor (${res.status})`;
        alert(errMsg);
        console.warn("adminAddDoctor failed:", res.status, data);
      }

      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = saveBtn.dataset.origText || "Save";
      }
    } catch (err) {
      console.error("adminAddDoctor handler error:", err);
      alert("Unexpected error while adding doctor.");
      const saveBtn = document.getElementById("saveDoctorBtn");
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = saveBtn.dataset.origText || "Save"; }
    }
  };
})();
