# User Stories

## Admin User Stories

### User Story 1: Admin Login

**Title:**  
_As an admin, I want to log into the portal with my username and password, so that I can manage the platform securely._  

**Acceptance Criteria:**  
1. Admin can enter username and password to access the portal.  
2. System validates credentials and allows access only if correct.  
3. Admin sees an error message if login fails.  

**Priority:** High  
**Story Points:** 3  
**Notes:**  
- Include account lockout after multiple failed login attempts.  

---

### User Story 2: Admin Logout

**Title:**  
_As an admin, I want to log out of the portal, so that I can protect system access._  

**Acceptance Criteria:**  
1. Admin can click a “Logout” button to end the session.  
2. Session is invalidated on logout.  
3. Admin is redirected to the login page after logging out.  

**Priority:** High  
**Story Points:** 2  
**Notes:**  
- Ensure session timeout also logs out inactive users automatically.  

---

### User Story 3: Add Doctor

**Title:**  
_As an admin, I want to add doctors to the portal, so that they can be assigned patients and appointments._  

**Acceptance Criteria:**  
1. Admin can fill in a form with doctor details (name, specialization, email, etc.).  
2. System validates required fields before saving.  
3. Doctor is added to the portal and visible in the doctor list.  

**Priority:** High  
**Story Points:** 5  
**Notes:**  
- Validate email format and ensure username is unique for each doctor.  

---

### User Story 4: Delete Doctor

**Title:**  
_As an admin, I want to delete a doctor’s profile from the portal, so that inactive or incorrect entries can be removed._  

**Acceptance Criteria:**  
1. Admin can select a doctor from the list and delete the profile.  
2. System asks for confirmation before deletion.  
3. Deleted doctor is removed from the database and portal view.  

**Priority:** Medium  
**Story Points:** 3  
**Notes:**  
- Ensure cascading effects on appointments or linked data are handled.  

---

### User Story 5: Track Appointments Per Month

**Title:**  
_As an admin, I want to run a stored procedure in MySQL CLI to get the number of appointments per month, so that I can track usage statistics._  

**Acceptance Criteria:**  
1. Admin can execute the stored procedure in MySQL CLI.  
2. System returns the number of appointments grouped by month.  
3. Output is correct and formatted for easy reporting.  

**Priority:** Medium  
**Story Points:** 3  
**Notes:**  
- Stored procedure should handle months with zero appointments gracefully.  

---

## Patient User Stories

### User Story 1: View Doctors Without Login

**Title:**  
_As a patient, I want to view a list of doctors without logging in, so that I can explore options before registering._  

**Acceptance Criteria:**  
1. Patients can access a public list of doctors.  
2. The list shows doctor names, specializations, and basic info.  
3. Patients are prompted to register or log in if they want to book an appointment.  

**Priority:** Medium  
**Story Points:** 2  
**Notes:**  
- Ensure sensitive info (email, phone) is hidden for unregistered users.  

---

### User Story 2: Patient Sign Up

**Title:**  
_As a patient, I want to sign up using my email and password, so that I can book appointments._  

**Acceptance Criteria:**  
1. Patient can create an account with email, password, and personal details.  
2. System validates email format and password strength.  
3. Confirmation email is sent after registration.  

**Priority:** High  
**Story Points:** 3  
**Notes:**  
- Prevent duplicate accounts with the same email.  

---

### User Story 3: Patient Login

**Title:**  
_As a patient, I want to log into the portal, so that I can manage my bookings._  

**Acceptance Criteria:**  
1. Patient can enter email and password to access the portal.  
2. System validates credentials and grants access if correct.  
3. Login errors are displayed for invalid credentials.  

**Priority:** High  
**Story Points:** 2  
**Notes:**  
- Implement account lockout after multiple failed attempts.  

---

### User Story 4: Patient Logout

**Title:**  
_As a patient, I want to log out of the portal, so that I can secure my account._  

**Acceptance Criteria:**  
1. Patient can click a “Logout” button to end the session.  
2. Session is invalidated immediately upon logout.  
3. Patient is redirected to the login or homepage after logging out.  

**Priority:** High  
**Story Points:** 1  
**Notes:**  
- Ensure session timeout logs out inactive patients automatically.  

---

### User Story 5: Book Appointment

**Title:**  
_As a patient, I want to log in and book an hour-long appointment, so that I can consult with a doctor._  

**Acceptance Criteria:**  
1. Patient can select a doctor and choose an available time slot.  
2. Booking is limited to one-hour slots.  
3. Appointment is confirmed and visible in the patient’s dashboard.  

**Priority:** High  
**Story Points:** 5  
**Notes:**  
- Prevent double-booking for the same time slot.  

---

### User Story 6: View Upcoming Appointments

**Title:**  
_As a patient, I want to view my upcoming appointments, so that I can prepare accordingly._  

**Acceptance Criteria:**  
1. Patient can access a dashboard with a list of future appointments.  
2. Each appointment shows date, time, and doctor’s information.  
3. Patient can cancel or reschedule if allowed by system rules.  

**Priority:** Medium  
**Story Points:** 3  
**Notes:**  
- Include reminders for upcoming appointments.  

---

## Doctor User Stories

### User Story 1: Doctor Login

**Title:**  
_As a doctor, I want to log into the portal, so that I can manage my appointments._  

**Acceptance Criteria:**  
1. Doctor can enter email/username and password to access the portal.  
2. System validates credentials and grants access if correct.  
3. Login errors are displayed for invalid credentials.  

**Priority:** High  
**Story Points:** 2  
**Notes:**  
- Implement account lockout after multiple failed login attempts.  

---

### User Story 2: Doctor Logout

**Title:**  
_As a doctor, I want to log out of the portal, so that I can protect my data._  

**Acceptance Criteria:**  
1. Doctor can click a “Logout” button to end the session.  
2. Session is invalidated immediately upon logout.  
3. Doctor is redirected to the login page after logging out.  

**Priority:** High  
**Story Points:** 1  
**Notes:**  
- Ensure session timeout logs out inactive doctors automatically.  

---

### User Story 3: View Appointment Calendar

**Title:**  
_As a doctor, I want to view my appointment calendar, so that I can stay organized._  

**Acceptance Criteria:**  
1. Doctor can view all upcoming appointments in a calendar or list view.  
2. Appointments show patient names, time slots, and booking details.  
3. Past appointments are archived but accessible for reference.  

**Priority:** High  
**Story Points:** 3  
**Notes:**  
- Calendar should allow filtering by day, week, or month.  

---

### User Story 4: Mark Unavailability

**Title:**  
_As a doctor, I want to mark my unavailability, so that patients are informed of only available slots._  

**Acceptance Criteria:**  
1. Doctor can select dates/times as unavailable.  
2. Unavailable slots are automatically blocked from patient bookings.  
3. Patients trying to book during unavailable times receive a notification.  

**Priority:** Medium  
**Story Points:** 3  
**Notes:**  
- System should prevent conflicts with already booked appointments.  

---

### User Story 5: Update Profile

**Title:**  
_As a doctor, I want to update my profile with specialization and contact information, so that patients have up-to-date information._  

**Acceptance Criteria:**  
1. Doctor can edit profile fields such as specialization, phone, email, and bio.  
2. Changes are saved and immediately reflected in the portal.  
3. Patients viewing the doctor profile see the updated information.  

**Priority:** Medium  
**Story Points:** 2  
**Notes:**  
- Validate email format and mandatory fields before saving.  

---

### User Story 6: View Patient Details

**Title:**  
_As a doctor, I want to view patient details for upcoming appointments, so that I can be prepared._  

**Acceptance Criteria:**  
1. Doctor can access a list of upcoming patients with relevant details (name, age, medical history if allowed).  
2. Patient details are only accessible for confirmed appointments.  
3. System protects sensitive patient data according to privacy rules.  

**Priority:** High  
**Story Points:** 3  
**Notes:**  
- Include security measures to prevent unauthorized access.  
