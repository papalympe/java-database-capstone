# Schema Design — Smart Clinic Management System

This file describes the data design for the Smart Clinic Management System using **MySQL** for structured data and **MongoDB** for flexible/semi-structured documents. 

---

## MySQL Database Design

### Table: patients
```sql
CREATE TABLE patients (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,             -- Unique identifier
  name VARCHAR(100) NOT NULL,                       -- Full name
  email VARCHAR(150) NOT NULL UNIQUE,               -- Unique email for login
  password VARCHAR(255) NOT NULL,                   -- Secure hashed password
  phone VARCHAR(20),                                -- Phone number (10 digits validated in backend)
  address VARCHAR(255),                             -- Address text
  date_of_birth DATE,                               -- Must be a past date (validated in backend)
  emergency_contact VARCHAR(100),                   -- Optional emergency contact
  insurance_provider VARCHAR(100),                  -- Optional insurance provider
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: doctors
```sql
CREATE TABLE doctors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,            -- Unique doctor ID
  name VARCHAR(100) NOT NULL,                      -- Doctor's name
  specialty VARCHAR(100) NOT NULL,                 -- Medical specialty
  email VARCHAR(150) NOT NULL UNIQUE,              -- Unique email
  password VARCHAR(255) NOT NULL,                  -- Login password (hashed)
  phone VARCHAR(20),                               -- Validated phone number
  years_of_experience INT,                         -- Must be >= 0 (validated in backend)
  rating DOUBLE,                                    -- 0.0 - 5.0 range
  clinic_address VARCHAR(255),                     -- Clinic location
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: doctor_available_times
```sql
CREATE TABLE doctor_available_times (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  doctor_id BIGINT NOT NULL,                       -- FK to doctors
  time_slot VARCHAR(50) NOT NULL,                  -- Example: "09:00-10:00"

  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);
```

### Table: appointments
```sql
CREATE TABLE appointments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,            -- Unique appointment ID
  doctor_id BIGINT NOT NULL,                       -- FK to doctors
  patient_id BIGINT NOT NULL,                      -- FK to patients
  appointment_time DATETIME NOT NULL,              -- Scheduled date/time
  status VARCHAR(20) NOT NULL,                     -- PENDING / CONFIRMED / CANCELLED
  reason_for_visit VARCHAR(255),                   -- Optional
  notes TEXT,                                      -- Optional
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

### Table: admins
```sql
CREATE TABLE admins (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,         -- Unique admin ID
  username VARCHAR(100) NOT NULL UNIQUE,        -- Login username
  password VARCHAR(255) NOT NULL,               -- Hashed password
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: prescriptions (link to MongoDB)
```sql
CREATE TABLE prescriptions (
  prescription_id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique prescription ID
  patient_id INT NOT NULL,                          -- Reference to patient
  doctor_id INT NOT NULL,                           -- Reference to doctor
  appointment_id INT,                               -- Optional appointment link
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Creation timestamp
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);
```

---

## MongoDB Collection Design

### Collection: prescriptions
**Design choices:** Store prescriptions as documents because medication lists, dosing instructions, and doctor notes vary per patient. Store references to MySQL IDs (patientId, doctorId) rather than embedding full objects.

```json
{
  "_id": { "$oid": "64abc1234567890abcdef123" },
  
  "patientName": "John Doe",                   // Required, 3–100 chars
  "appointmentId": 101,                        // Required (Long)
  "medication": "Amoxicillin",                 // Required, 3–100 chars
  "dosage": "500mg",                           // Required, 3–20 chars
  "doctorNotes": "Take with food",             // Optional, max 200 chars

  "refillCount": 1,                            // Optional expanded field
  "pharmacyName": "Central Pharmacy",          // Optional expanded field

  "createdAt": "2025-01-18T10:45:00Z",
  "lastUpdated": "2025-01-18T10:45:00Z",

  "metadata": {
    "prescribedBy": "Dr. Alice Smith"
  }
}
```

**Notes:** MongoDB is used for flexible, nested, or optional data such as medication arrays, doctor notes, and audit history.

---



