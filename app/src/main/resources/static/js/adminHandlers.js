// adminHandlers.js  (non-module)
(function () {
  "use strict";

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

      // get admin token from localStorage (required by backend)
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Admin token missing. Please login as admin before adding a doctor.");
        return;
      }

      // disable button / feedback
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.dataset.origText = saveBtn.textContent;
        saveBtn.textContent = "Saving...";
      }

      const url = `/doctor/${encodeURIComponent(token)}`; // <-- path variable expected by backend
      const payload = { name, specialty, email, password };

      let res, data;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        data = await res.json().catch(() => ({}));
      } catch (fetchErr) {
        console.error("adminAddDoctor fetch error:", fetchErr);
        alert("Network error while adding doctor.");
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = saveBtn.dataset.origText || "Save"; }
        return;
      }

      if (res.ok) {
        alert(data.message || "Doctor added successfully.");
        // close modal
        const modal = document.getElementById("modal");
        if (modal) {
          modal.style.display = "none";
          modal.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
        }
        // try to refresh doctor list gracefully
        if (typeof window.loadDoctorCards === "function") {
          try { window.loadDoctorCards(); } catch (e) { window.location.reload(); }
        } else {
          window.location.reload();
        }
      } else {
        // show backend error (405 / 400 / 409 etc.)
        const errMsg = data.error || data.message || `Failed to add doctor (status ${res.status}).`;
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
