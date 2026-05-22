## HKare - Hospital Management System

Modern, full‑stack Hospital Management System with a Java Spring Boot backend and a React (Vite) frontend.

### Overview
- Backend: Spring Boot (Java 21), Maven, MySQL, JWT-based auth, REST APIs
- Frontend: React + Vite, componentized role-based UIs (Admin/Doctor/Staff/Patient)
- Dev Environment: Docker for backend/frontend, local MySQL on port 3306

### Repository Structure
```
HKare/
  backend/                      # Spring Boot service
    src/main/java/com/hkare/hkare_backend/
      config/                   # Security & Web configuration
      controller/               # REST controllers (role/domain based)
      dto/                      # Request/Response DTOs
      exception/                # Global exception handler
      model/                    # JPA entities
      repository/               # Spring Data repositories
      service/                  # Service interfaces + implementations
    src/main/resources/
      application.properties    # App & DB configuration (localhost:3306)
    pom.xml                     # Maven build

  frontend/                     # React (Vite) SPA
    src/
      api/                      # HTTP client setup
      components/               # Role-based pages/modules
        admin/                  # Admin pages & management modules
        doctor/                 # Doctor dashboard & tools
        patient/                # Patient portal
        staff/                  # Staff operations
        home_page/              # Public landing page
        login_pages/            # Login + Captcha
    vite.config.js              # Vite config
    package.json                # Web build/run scripts

  docker-compose.yml            # Runs backend & frontend; uses local MySQL
  docker-compose.override?      # (optional)
```

### Data Model (selected)
- `Users` (base) and role-specific: `Admin`, `Staff`, `Doctor`, `Patient`
- Core entities: `Appointment`, `Department`, `MedicalRecord`, `Medication`, `Payment`, `Pharmacy`, `Prescription`, `Notification`, `AuditLog`, `LoginHistory`

### Backend (Spring Boot)
- Port: 8082
- Security: Configured via `config/SecurityConfig.java` (JWT/session compatible). CORS configured in `application.properties`.
- Persistence: Spring Data JPA with MySQL dialect; `spring.jpa.hibernate.ddl-auto=update` for schema evolution.
- Notable packages:
  - `controller`: REST endpoints per domain/role (e.g., `AppointmentController`, `DoctorAuthController`, `PatientAuthController`, `StaffAuthController`, `Admin`-related via generic controllers)
  - `service` + `service/impl`: Business logic for each domain (appointments, records, medication, pharmacy, payments, notifications, etc.)
  - `repository`: CRUD access per entity
  - `dto`: Clean request/response payload contracts
  - `exception/GlobalExceptionHandler`: Consistent error responses

#### Key Controllers (high-level)
- Auth: `DoctorAuthController`, `PatientAuthController`, `StaffAuthController`
- Domain:
  - `AppointmentController`, `DepartmentController`, `DoctorController`, `PatientController`, `StaffController`
  - `MedicalRecordController`, `MedicationController`, `PrescriptionController`, `PharmacyController`
  - `PaymentController`, `NotificationController`, `AuditLogController`, `LoginHistoryController`, `HealthCheckController`, `TestController`

### Frontend (React + Vite)
- Port (served by Nginx in Docker): 5173 → 80 in container
- Structure: role-based directories under `src/components/`
  - Admin: manage doctors, patients, staff, departments, appointments, logs, notifications, payments, prescriptions, meds, medical records
  - Doctor: dashboard, patient management, prescriptions, medications, medical records, notifications, appointments
  - Patient: dashboard, profile, appointments, prescriptions view, medical record view, notifications
  - Staff: similar operational modules (appointments, departments, doctors, meds, records, patients, payments, notifications)
  - Login pages: separate for Patient/Doctor/Staff with a simple captcha
  - Home page: landing screen and navigation

### Configuration
- Database (local development):
  - MySQL must run locally on port 3306
  - Database: `hkare`
  - Credentials: `root` / `root`
  - Spring: `backend/src/main/resources/application.properties`
    - `spring.datasource.url=jdbc:mysql://localhost:3306/hkare?...`

- Docker (compose):
  - Backend uses `SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/hkare?...` to reach the host’s MySQL
  - Frontend exposed on `http://localhost:5173`
  - Backend exposed on `http://localhost:8082`
  - MySQL is NOT run in Docker; each developer uses their own local MySQL on 3306

### Running the Project
Prerequisites:
- Docker Desktop installed and running
- Local MySQL running on 3306 with db `hkare` and user `root`/`root`

Using Docker (recommended):
```
docker compose up --build -d
```
Services:
- Frontend: http://localhost:5173
- Backend:  http://localhost:8082

Local (without Docker):
1) Start MySQL locally (ensure db `hkare` exists)
2) Backend
```
cd backend
mvn spring-boot:run
```
3) Frontend
```
cd frontend
npm ci
npm run dev
```

### Environment & Ports
- Frontend: 5173 (host) → 80 (container)
- Backend: 8082
- Database: 3306 (host – local MySQL)

### Troubleshooting
- Port 3306 already in use by local MySQL is expected. Do NOT run a MySQL container in this setup.
- If Docker tried to start `hkare-db-1`: run `docker compose down --remove-orphans` to remove stale services.
- If backend can’t connect to DB from Docker, verify:
  - Local MySQL is running
  - DB `hkare` exists and credentials match `root`/`root`
  - Firewall allows local connections

### Tech Stack
- Backend: Java 21, Spring Boot, Spring Security, Spring Data JPA, Maven, MySQL
- Frontend: React, Vite, Nginx (for container serve)
- DevOps: Docker, Docker Compose

### Notes for Contributors
- Follow existing code style and structure
- Prefer DTOs over exposing entities
- Keep services thin controllers/fat services pattern
- Add/extend endpoints under appropriate controller/service/repository with tests where possible

### License
Proprietary – internal use for HKare unless stated otherwise.
