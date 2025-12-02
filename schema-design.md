# Schema Design — Smart Clinic Management System

This file describes the data design for the Smart Clinic Management System using **MySQL** for structured data and **MongoDB** for flexible/semi-structured documents. 

---

## MySQL Database Design

### Table: patient
```sql
CREATE TABLE patient (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(255)
);
```

### Table: doctor
```sql
CREATE TABLE doctor (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  specialty VARCHAR(100)
);
```

### Table: doctor_available_times
```sql
CREATE TABLE doctor_available_times (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  doctor_id BIGINT NOT NULL,
  available_times VARCHAR(50) NOT NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);
```

### Table: appointment
```sql
CREATE TABLE appointment (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  doctor_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  appointment_time DATETIME NOT NULL,
  status VARCHAR(20) NOT NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

### Table: admin
```sql
CREATE TABLE admin (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
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
  "_id": { "$oid": "6807dd712725f013281e7201" },
  "patientName": "John Smith",
  "appointmentId": 51,
  "medication": "Paracetamol",
  "dosage": "500mg",
  "doctorNotes": "Take 1 tablet every 6 hours.",
  "_class": "com.project.back_end.models.Prescription"
}
```

**Notes:** MongoDB is used for flexible, nested, or optional data such as medication arrays, doctor notes, and audit history.

---



