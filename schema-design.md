# Schema Design — Smart Clinic Management System

This file describes the data design for the Smart Clinic Management System using **MySQL** for structured data and **MongoDB** for flexible/semi-structured documents. 

---

## MySQL Database Design

### Table: patient
```sql
CREATE TABLE patient (
    id INT AUTO_INCREMENT PRIMARY KEY,              -- Unique identifier for each patient
    name VARCHAR(100) NOT NULL,                     -- Patient's full name
    email VARCHAR(255) NOT NULL UNIQUE,            -- Email address for login
    password VARCHAR(255) NOT NULL,                -- Password (write-only in JSON)
    phone VARCHAR(10),                              -- Phone number
    address VARCHAR(255) NOT NULL                  -- Patient's address
);
```

### Table: doctor
```sql
CREATE TABLE doctor (
    id INT AUTO_INCREMENT PRIMARY KEY,                -- Unique identifier for each doctor
    name VARCHAR(100) NOT NULL,                      -- Doctor's full name
    specialty VARCHAR(50) NOT NULL,                 -- Doctor's specialty
    email VARCHAR(255) NOT NULL UNIQUE,             -- Email address for login
    password VARCHAR(255) NOT NULL,                 -- Password (write-only in JSON)
    phone VARCHAR(10)                                -- Phone number (10 digits)
);
```

**Notes:** Available times are stored as a collection inside the Doctor entity (availableTimes) in JPA, so no separate table is needed.


### Table: appointment
```sql
CREATE TABLE appointment (
    id INT AUTO_INCREMENT PRIMARY KEY,             -- Unique identifier for each appointment
    appointment_time DATETIME NOT NULL,            -- Date and time of the appointment
    status INT NOT NULL,                            -- 0 = Scheduled, 1 = Completed
    doctor_id INT NOT NULL,                        -- Foreign key to doctor(id)
    patient_id INT NOT NULL,                       -- Foreign key to patient(id)
    CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id),
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patient(id)
);
```

### Table: admin
```sql
CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,             -- Unique identifier for each admin
    username VARCHAR(50) NOT NULL UNIQUE,         -- Admin username
    password VARCHAR(255) NOT NULL                -- Password (write-only in JSON)
);
```

---

## MongoDB Collection Design

### Collection: prescriptions
**Design choices:** Store prescriptions as documents because medication, dosing instructions, and doctor notes vary per patient. 

```json
{
  "_id": { "$oid": "6807dd712725f013281e7201" },
  "patientName": "John Smith",
  "appointmentId": 51,
  "medication": "Paracetamol",
  "dosage": "500mg",
  "doctorNotes": "Take 1 tablet every 6 hours.",
  "_class": "com.project.back_end.models.Prescription"
}
```

**Notes:** MongoDB is used for flexible data such as medication, doctor notes, etc.

---



