# 📊 SIPEKA — Sistem Evaluasi Kinerja

**Sistem Evaluasi Kinerja** adalah platform digital terintegrasi untuk monitoring dan penilaian kinerja karyawan/dosen secara terstruktur, real-time, dan berbasis KPI (Key Performance Indicators).

---

## 📋 Daftar Isi

- [Pengenalan](#pengenalan)
- [Stack Teknologi](#stack-teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Instalasi & Setup](#instalasi--setup)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Fitur Aplikasi](#fitur-aplikasi)
- [Sistem Autentikasi & RBAC](#sistem-autentikasi--rbac)
- [Frontend Components](#frontend-components)
- [Desain UI/UX](#desain-uiux)
- [Progress Development](#progress-development)
- [Catatan Penting](#catatan-penting)

---

## 🎯 Pengenalan

### Visi & Misi
**Visi:** Menyediakan sistem evaluasi kinerja yang transparan, objektif, dan mudah digunakan untuk institusi pendidikan dan organisasi.

**Misi:**
- ✅ Memudahkan pengukuran KPI karyawan/dosen secara digital
- ✅ Memberikan dashboard real-time untuk monitoring kinerja
- ✅ Menerapkan sistem RBAC (Role-Based Access Control) yang ketat
- ✅ Menyediakan antarmuka yang modern dan user-friendly

### Pengguna Utama
1. **HR (Human Resources)** - Mengelola pengguna, karyawan, dan laporan keseluruhan
2. **Kaprodi (Kepala Program Studi)** - Melihat performa dosen dan mahasiswa di program studi
3. **Dosen** - Melihat data performa diri sendiri

---

## 🛠️ Stack Teknologi

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **Database:** MySQL 8.0 (mysql2 3.6.0)
- **Autentikasi:** JWT + bcrypt 5.1.1
- **CORS:** cors 2.8.5
- **Body Parser:** body-parser 1.20.2
- **Dev Tool:** nodemon 3.0.1

### Frontend
- **HTML5** - Markup semantik
- **CSS3** - Modern styling dengan CSS Variables
- **JavaScript (Vanilla)** - Routing SPA, state management
- **Chart.js 4.4.0** - Visualisasi data & dashboard
- **Google Fonts (Inter)** - Typography modern

### Database
- **MySQL** dengan InnoDB Engine
- **Encoding:** UTF-8MB4 (support emoji & karakter khusus)
- **Connection Pool:** 10 connections untuk optimasi

---

## 📁 Struktur Proyek

```
sistem-evaluasi-kinerja/
├── README.md                           # Dokumentasi project
├── package.json                        # Dependencies & scripts
├── database.sql                        # Database schema & seed data
├── fix_ids.sql                         # Script perbaikan ID (jika ada)
│
├── CSS_IMPROVEMENTS_REFERENCE.md       # Dokumentasi CSS improvements
├── DASHBOARD_DESIGN_GUIDE.md           # UI/UX design guidelines
│
├── backend/
│   ├── server.js                       # Entry point server
│   ├── karyawan.js                     # Route: Manajemen Karyawan
│   ├── kpi.js                          # Route: Manajemen KPI
│   ├── penilaian.js                    # Route: Penilaian Kinerja
│   ├── package.json                    # Backend-specific dependencies
│   │
│   ├── middleware/
│   │   ├── auth.js                     # JWT + RBAC middleware
│   │   └── errorHandler.js             # Error handling middleware
│   │
│   └── validators/
│       ├── schemas.js                  # Validation schemas (JOI-style)
│       └── validate.js                 # Validation middleware factory
│
├── frontend/
│   ├── index.html                      # Main HTML file
│   ├── style.css                       # Global & component styles
│   ├── app.js                          # Main app initialization
│   │
│   ├── js/
│   │   ├── main.js                     # Event listeners & initialization
│   │   ├── api.js                      # API client (fetch wrapper)
│   │   ├── router.js                   # SPA routing logic
│   │   ├── state.js                    # Global state management
│   │   ├── auth.js                     # Auth logic & token handling
│   │   ├── auth-toggle.js              # Auth UI toggle functionality
│   │   └── data.js                     # Data transformation utilities
│   │
│   └── js/components/
│       ├── dashboard.js                # Dashboard component
│       ├── karyawan.js                 # Karyawan management component
│       ├── kpi.js                      # KPI management component
│       ├── penilaian.js                # Penilaian form component
│       └── rbac.js                     # RBAC visibility logic
```

---

## 🚀 Instalasi & Setup

### Prerequisites
- **Node.js** 14.x atau lebih tinggi
- **MySQL** 8.0 atau lebih tinggi
- **npm** atau **yarn**

### Langkah 1: Clone & Install Dependencies

```bash
# Masuk ke folder project
cd "Folder PBW smt 4/Sistem Evaluasi Kinerja"

# Install dependencies
npm install

# Install backend-specific dependencies (jika ada perbedaan)
cd backend
npm install
cd ..
```

### Langkah 2: Setup Database

```bash
# Buka MySQL CLI
mysql -u root -p

# Jalankan script database
source database.sql;
```

**Output yang diharapkan:**
- Database `sistem_evaluasi_kinerja` tercipta
- 4 tabel: `karyawan`, `kpi`, `penilaian`, `user`
- Sample data terisi di `karyawan` dan `kpi`

### Langkah 3: Konfigurasi Environment

Buat file `.env` di folder project:

```env
# Server
PORT=3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=sistem_evaluasi_kinerja

# JWT
JWT_SECRET=sipeka_secret_change_in_production
JWT_EXPIRES_IN=8h

# Security
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=*
```

### Langkah 4: Jalankan Server

```bash
# Development mode (dengan auto-reload)
npm run dev
# atau
npm run server:dev

# Production mode
npm start
```

**Output yang diharapkan:**
```
Server running on http://localhost:3000
Database connected successfully
```

### Langkah 5: Akses Aplikasi

Buka browser dan kunjungi: **http://localhost:3000**

---

## 🗄️ Database

### Diagram ER (Entity Relationship)

```
┌─────────────┐         ┌──────────┐
│  karyawan   │         │   kpi    │
├─────────────┤         ├──────────┤
│ id_karyawan │◄─┐   ┌─►│ id_kpi   │
│ nama        │  │   │  │ nama_kpi │
│ jabatan     │  │   │  │ deskripsi│
└─────────────┘  │   │  │ bobot    │
                 │   │  └──────────┘
             ┌───┴───┴───┐
             │ penilaian │
             ├───────────┤
             │ id_penilaian
             │ id_karyawan ──┘
             │ id_kpi ───────┘
             │ nilai
             │ tanggal_penilaian
             │ catatan
             └───────────┘
                    ▲
                    │ (FK)
             ┌──────┴──────┐
             │    user     │
             ├─────────────┤
             │ id_user     │
             │ username    │
             │ password    │
             │ role        │
             │ id_karyawan │
             │ is_active   │
             │ last_login  │
             └─────────────┘
```

### Schema Tabel

#### 1. **karyawan** (Karyawan/Dosen)
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| id_karyawan | INT | PK, AI | ID unik karyawan |
| nama | VARCHAR(100) | NOT NULL | Nama lengkap |
| jabatan | VARCHAR(100) | NOT NULL | Posisi/jabatan |
| created_at | TIMESTAMP | DEFAULT NOW | Waktu pembuatan |
| updated_at | TIMESTAMP | ON UPDATE | Waktu update terakhir |

#### 2. **kpi** (Key Performance Indicators)
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| id_kpi | INT | PK, AI | ID unik KPI |
| nama_kpi | VARCHAR(100) | NOT NULL | Nama KPI |
| deskripsi | TEXT | NULL | Penjelasan KPI |
| bobot | DECIMAL(5,2) | NOT NULL | Persentase bobot (%) |
| created_at | TIMESTAMP | DEFAULT NOW | Waktu pembuatan |
| updated_at | TIMESTAMP | ON UPDATE | Waktu update terakhir |

#### 3. **penilaian** (Penilaian/Assessment)
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| id_penilaian | INT | PK, AI | ID unik penilaian |
| id_karyawan | INT | FK → karyawan | Referensi karyawan |
| id_kpi | INT | FK → kpi | Referensi KPI |
| nilai | DECIMAL(5,2) | NULL | Skor penilaian (0-100) |
| tanggal_penilaian | DATE | NOT NULL | Tanggal penilaian |
| catatan | TEXT | NULL | Catatan evaluator |
| created_at | TIMESTAMP | DEFAULT NOW | Waktu pembuatan |
| updated_at | TIMESTAMP | ON UPDATE | Waktu update terakhir |

#### 4. **user** (Akun Pengguna)
| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| id_user | INT | PK, AI | ID unik user |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Username/email unik |
| password | VARCHAR(255) | NOT NULL | Hash password bcrypt |
| role | ENUM('hr','kaprodi','dosen') | NOT NULL | Peran user |
| id_karyawan | INT | FK → karyawan | Referensi karyawan |
| is_active | TINYINT(1) | DEFAULT 1 | Status aktivasi |
| last_login | TIMESTAMP | NULL | Terakhir login |
| created_at | TIMESTAMP | DEFAULT NOW | Waktu pembuatan |
| updated_at | TIMESTAMP | ON UPDATE | Waktu update terakhir |

### Sample Data

**Karyawan:**
```sql
INSERT INTO karyawan (nama, jabatan) VALUES
('Ahmad Santoso', 'Dosen'),
('Siti Nurhaliza', 'Dosen'),
('Budi Hakim', 'Karyawan');
```

**KPI:**
```sql
INSERT INTO kpi (nama_kpi, deskripsi, bobot) VALUES
('Kedisiplinan', 'Kehadiran dan ketepatan waktu', 20.00),
('Produktivitas', 'Hasil kerja yang dicapai', 30.00),
('Kualitas Kerja', 'Standar kualitas pekerjaan', 25.00),
('Komunikasi', 'Kemampuan berkomunikasi', 15.00),
('Kerjasama Tim', 'Kolaborasi dengan rekan kerja', 10.00);
```

### Indexes

Indeks telah dibuat untuk optimasi query:
- `idx_karyawan` pada `penilaian(id_karyawan)`
- `idx_kpi` pada `penilaian(id_kpi)`
- `idx_tanggal` pada `penilaian(tanggal_penilaian)`
- `idx_penilaian_karyawan_date` pada `penilaian(id_karyawan, tanggal_penilaian)`
- `idx_penilaian_kpi_date` pada `penilaian(id_kpi, tanggal_penilaian)`

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### POST /register
Register pengguna baru
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kaprodi@sipeka.ac.id",
    "password": "secure_password",
    "role": "kaprodi",
    "id_karyawan": 1
  }'
```

**Response Success (201):**
```json
{
  "message": "User berhasil didaftarkan",
  "userId": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /login
Login dan dapatkan JWT token
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kaprodi@sipeka.ac.id",
    "password": "secure_password"
  }'
```

**Response Success (200):**
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_user": 1,
    "username": "kaprodi@sipeka.ac.id",
    "role": "kaprodi",
    "id_karyawan": 1
  }
}
```

### Karyawan Endpoints (CRUD)

#### GET /karyawan
List semua karyawan
```bash
curl http://localhost:3000/api/karyawan \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### GET /karyawan/:id
Get detail karyawan
```bash
curl http://localhost:3000/api/karyawan/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /karyawan
Tambah karyawan baru (HR only)
```bash
curl -X POST http://localhost:3000/api/karyawan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nama": "Rina Wijaya",
    "jabatan": "Dosen"
  }'
```

#### PUT /karyawan/:id
Update karyawan (HR only)
```bash
curl -X PUT http://localhost:3000/api/karyawan/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nama": "Ahmad Santoso Updated",
    "jabatan": "Kepala Dosen"
  }'
```

#### DELETE /karyawan/:id
Delete karyawan (HR only)
```bash
curl -X DELETE http://localhost:3000/api/karyawan/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### KPI Endpoints (CRUD)

#### GET /kpi
List semua KPI
```bash
curl http://localhost:3000/api/kpi \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /kpi
Tambah KPI baru (HR only)
```bash
curl -X POST http://localhost:3000/api/kpi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nama_kpi": "Inovasi",
    "deskripsi": "Kemampuan berinovasi dalam pekerjaan",
    "bobot": 15.50
  }'
```

#### PUT /kpi/:id
Update KPI (HR only)
```bash
curl -X PUT http://localhost:3000/api/kpi/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nama_kpi": "Kedisiplinan Updated",
    "bobot": 25.00
  }'
```

#### DELETE /kpi/:id
Delete KPI (HR only)
```bash
curl -X DELETE http://localhost:3000/api/kpi/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Penilaian Endpoints (Assessment)

#### GET /penilaian
List semua penilaian
```bash
curl http://localhost:3000/api/penilaian \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### GET /penilaian/karyawan/:id_karyawan
List penilaian untuk karyawan tertentu
```bash
curl http://localhost:3000/api/penilaian/karyawan/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /penilaian
Tambah penilaian baru
```bash
curl -X POST http://localhost:3000/api/penilaian \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id_karyawan": 1,
    "id_kpi": 1,
    "nilai": 85.5,
    "tanggal_penilaian": "2024-06-08",
    "catatan": "Performa baik, konsisten"
  }'
```

#### PUT /penilaian/:id
Update penilaian
```bash
curl -X PUT http://localhost:3000/api/penilaian/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nilai": 87.0,
    "catatan": "Meningkat dari bulan lalu"
  }'
```

#### DELETE /penilaian/:id
Delete penilaian
```bash
curl -X DELETE http://localhost:3000/api/penilaian/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Dashboard Endpoints

#### GET /dashboard/summary
Ringkasan dashboard (filter by role)
```bash
curl "http://localhost:3000/api/dashboard/summary?month=6&year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### GET /dashboard/metrics
Metrik performa (berbeda per role)
```bash
curl http://localhost:3000/api/dashboard/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Fitur Aplikasi

### 1. Autentikasi & Autorisasi
- ✅ **Login dengan email & password**
  - Password di-hash dengan bcrypt (10 rounds)
  - JWT token dengan expiry 8 jam
  - Remember token functionality
  
- ✅ **Register user baru** (HR only)
  - Validasi format email & password strength
  - Auto-generate user dengan role

- ✅ **Logout & Token Refresh**
  - Clear localStorage token
  - Session timeout handling

### 2. Manajemen Karyawan
- ✅ **CRUD Karyawan** (HR only)
  - Tambah karyawan baru
  - Edit data karyawan
  - Delete karyawan (cascade delete penilaian)
  - List view dengan pagination

- ✅ **Validasi Input**
  - Nama min 3 karakter, max 100
  - Jabatan required

### 3. Manajemen KPI
- ✅ **CRUD KPI** (HR only)
  - Definisikan KPI baru
  - Edit KPI & bobot
  - Delete KPI
  - Bobot otomatis divalidasi (tidak melebihi 100%)

- ✅ **KPI Master Data**
  - Pre-defined KPI: Kedisiplinan, Produktivitas, Kualitas Kerja, Komunikasi, Kerjasama Tim
  - Bobot distribusi: 20% + 30% + 25% + 15% + 10% = 100%

### 4. Penilaian Kinerja
- ✅ **Input Penilaian**
  - Select karyawan & KPI
  - Masukkan nilai (0-100)
  - Tambah catatan evaluator
  - Tanggal penilaian

- ✅ **History Penilaian**
  - View semua penilaian karyawan
  - Filter by tanggal & KPI
  - Edit & delete penilaian

- ✅ **Perhitungan Score**
  - Weighted score = nilai × bobot KPI
  - Total score = Σ weighted score
  - Rata-rata per bulan/tahun

### 5. Dashboard & Reporting
- ✅ **Dashboard Interaktif**
  - Chart.js visualisasi:
    - Bar chart: Performa per KPI
    - Line chart: Trend performa per bulan
    - Pie chart: Distribusi bobot KPI
  
- ✅ **Filter & Drill-down**
  - Filter by karyawan
  - Filter by periode (bulan/tahun)
  - Export data to CSV/PDF

- ✅ **Role-based Dashboard**
  - **HR:** Lihat semua karyawan, all metrics
  - **Kaprodi:** Lihat dosen di program studi, KPI program
  - **Dosen:** Lihat data diri sendiri saja

### 6. Role-Based Access Control (RBAC)
- ✅ **3 Role:**
  1. **HR** - Full access, manage users & karyawan
  2. **Kaprodi** - View performa dosen, limited management
  3. **Dosen** - View data diri, cannot manage

- ✅ **Authorization Middleware**
  - Backend route protection
  - Frontend visibility based on role
  - UI components toggle by role

---

## 🔐 Sistem Autentikasi & RBAC

### JWT Token Structure
```json
{
  "id_user": 1,
  "username": "kaprodi@sipeka.ac.id",
  "role": "kaprodi",
  "id_karyawan": 1,
  "iat": 1623145200,
  "exp": 1623181200
}
```

### Middleware: authenticate()
- Verifikasi Bearer token di header Authorization
- Inject `req.user` jika token valid
- Return 401 Unauthorized jika token invalid/expired

### Middleware: authorize(...roles)
- Validasi `req.user.role` terhadap allowed roles
- Return 403 Forbidden jika role tidak sesuai
- Support multiple roles dalam satu route

### Password Security
- Hash: bcrypt dengan 10 rounds
- Comparison: bcrypt.compare() dengan timing-safe comparison
- Never store plaintext password

### Token Expiry & Refresh
- Ekspirasi: 8 jam
- Strategy: Redirect login jika token expired
- Option: Implement refresh token (future enhancement)

---

## 🎨 Frontend Components

### Component Architecture
```
App
├── Auth Layer (auth.js)
│   ├── Login Form
│   ├── Register Form
│   └── Auth State
│
├── Router (router.js)
│   └── Page Manager
│
└── Main Pages
    ├── Dashboard
    │   ├── Summary Cards
    │   ├── Charts (Chart.js)
    │   └── Filter Panel
    │
    ├── Karyawan
    │   ├── List View (table)
    │   ├── Add/Edit Modal
    │   └── Delete Confirm
    │
    ├── KPI
    │   ├── List View (cards)
    │   ├── Add/Edit Modal
    │   └── Bobot Manager
    │
    └── Penilaian
        ├── Form Input
        ├── History List
        └── Edit/Delete Options
```

### Key Components

#### 1. **dashboard.js**
Render dashboard dengan:
- KPI performance cards
- Chart.js visualisasi (Bar, Line, Pie)
- Filter panel (karyawan, bulan, tahun)
- Export functionality

#### 2. **karyawan.js**
Render karyawan management:
- Table list semua karyawan
- Add/Edit/Delete modals
- Inline editing
- Pagination

#### 3. **kpi.js**
Render KPI management:
- Card layout untuk setiap KPI
- Edit bobot inline
- Validasi bobot total = 100%
- Add KPI form

#### 4. **penilaian.js**
Render penilaian form:
- Multi-select: karyawan & KPI
- Number input: nilai (0-100)
- Date picker: tanggal penilaian
- Textarea: catatan
- History list dengan edit/delete

#### 5. **rbac.js**
Logic visibilitas berdasarkan role:
- Show/hide elements by role
- Disable button untuk non-authorized users
- Redirect jika unauthorized access
- Warn user tentang permission

### State Management (state.js)
Global state object:
```javascript
{
  currentUser: { id_user, username, role, id_karyawan },
  karyawanList: [],
  kpiList: [],
  penilaianList: [],
  dashboardData: {},
  filters: { selectedKaryawan, month, year },
  loading: false,
  error: null
}
```

### API Client (api.js)
Wrapper untuk fetch API:
- Auto-attach JWT token ke Authorization header
- Error handling & logging
- Retry logic (future enhancement)
- Request/response interceptor

---

## 🎨 Desain UI/UX

### Design Philosophy
Terinspirasi dari **Coursera Dashboard**, **Google Analytics**, **Stripe Dashboard**, dan modern **EdTech Platforms**.

**Core Principles:**
- ✨ Clean white layout dengan abundant whitespace
- 🎯 Professional enterprise aesthetic
- 📐 Generous spacing & padding
- 🔷 Rounded corners (16px-24px)
- 🌊 Soft shadows untuk depth
- 📝 Large, readable typography
- 🎪 Minimalist (no clutter)
- ⚡ Smooth transitions (200ms cubic-bezier)

### Color Palette
```
Primary Navy Blue:     #0F2B5B  (Professional, trustworthy)
Accent Orange:         #FF8A00  (Energy, call-to-action)
Light Gray Background: #F8FAFC  (Clean, spacious)
White Cards:          #FFFFFF  (Content containers)
Muted Text:           #6B7280  (Secondary info)
Border:               #E6EEF7  (Subtle dividers)
Success Green:        #10B981  (Success states)
Error Red:            #EF4444  (Error states)
Warning Yellow:       #F59E0B  (Warning states)
```

### Spacing System
- **Container:** 2rem horizontal, 3rem vertical
- **Sections:** 3rem padding
- **Cards:** 2rem padding
- **Gap between elements:** 1.75-2rem

### Typography
- **Font Family:** Inter (Google Fonts)
- **Sizes:**
  - H1: 2.5rem
  - H2: 2rem
  - H3: 1.5rem
  - Body: 1rem
  - Small: 0.875rem
- **Line Height:** 1.7 (generous leading)
- **Letter Spacing:** -0.3px (modern tightness)

### Border Radius
- Small: 10px (buttons, inputs)
- Medium: 16px (cards)
- Large: 24px (major sections)

### Shadow System
```css
--shadow-xs:    0 2px 4px rgba(15, 43, 91, 0.04)    /* Subtle */
--shadow-sm:    0 4px 12px rgba(15, 43, 91, 0.08)   /* Light */
--shadow-md:    0 12px 32px rgba(15, 43, 91, 0.12)  /* Medium */
--shadow-card:  0 10px 40px rgba(15, 43, 91, 0.10)  /* Card elevation */
--shadow-hover: 0 20px 50px rgba(15, 43, 91, 0.15)  /* Hover state */
```

### Components Styling
- **Navbar:** Modern with brand logo, nav links, role tag, logout
- **Cards:** White background, medium shadow, rounded corners
- **Buttons:** Primary (navy blue), Secondary (gray), Hover effect
- **Forms:** Label above input, placeholder helpful, validation feedback
- **Tables:** Striped rows, hover effect, inline actions
- **Charts:** Responsive, readable labels, smooth animations
- **Modals:** Center-aligned, backdrop blur, responsive width

### Responsive Design
- **Mobile:** 320px min width, full-width layout
- **Tablet:** 768px breakpoint, 2-column grid
- **Desktop:** 1280px max-width, 3+ column grid
- **Large:** 1920px max-width

### Accessibility
- Semantic HTML5 (`<button>`, `<label>`, `<nav>`, etc.)
- ARIA labels for icon buttons
- Keyboard navigation support
- Color contrast (WCAG AA)
- Focus indicators visible
- Alt text untuk images

### Improvements Made
Documentation lengkap di [CSS_IMPROVEMENTS_REFERENCE.md](CSS_IMPROVEMENTS_REFERENCE.md)

**Major CSS Enhancements:**
- 5-tier shadow system (xs, sm, md, card, hover)
- Enhanced navbar styling
- Modern typography with letter-spacing
- Generous spacing throughout
- Soft hover transitions (200ms cubic-bezier)
- Improved form styling
- Better card elevation
- Responsive container sizing (1320px max)

---

## 📊 Progress Development

### Phase 1: ✅ PLANNING & SETUP (Completed)
- [x] Define project scope & requirements
- [x] Database schema design
- [x] Technology stack selection
- [x] Project folder structure
- [x] Documentation planning

### Phase 2: ✅ DATABASE & BACKEND (Completed)
- [x] Create MySQL database & tables
- [x] Setup Express.js server
- [x] Configure database connection pooling
- [x] Create authentication system (JWT + bcrypt)
- [x] Implement RBAC middleware
- [x] Create input validation schemas
- [x] Build Karyawan CRUD routes
- [x] Build KPI CRUD routes
- [x] Build Penilaian CRUD routes
- [x] Implement error handling middleware
- [x] Test all API endpoints

### Phase 3: ✅ FRONTEND (Completed)
- [x] Setup HTML5 semantic structure
- [x] Implement responsive CSS3 styling
- [x] Create login/register pages
- [x] Build SPA router (vanilla JS)
- [x] Implement global state management
- [x] Create dashboard component
- [x] Create karyawan management UI
- [x] Create KPI management UI
- [x] Create penilaian form & history
- [x] Implement Chart.js visualizations
- [x] Add RBAC visibility logic

### Phase 4: ✅ DESIGN & UI/UX (Completed)
- [x] Implement modern design system
- [x] Apply color palette consistently
- [x] Enhance spacing & typography
- [x] Add smooth transitions & animations
- [x] Implement soft shadow system
- [x] Create design guidelines document
- [x] CSS improvements & refinements

### Phase 5: ⏳ TESTING & DEPLOYMENT (In Progress)
- [ ] Unit tests (Backend API routes)
- [ ] Integration tests (Database + API)
- [ ] E2E tests (Frontend workflows)
- [ ] Performance testing & optimization
- [ ] Security audit (OWASP Top 10)
- [ ] Prepare deployment documentation
- [ ] Setup production environment
- [ ] CI/CD pipeline (GitHub Actions/GitLab CI)

### Phase 6: 📋 DOCUMENTATION & DELIVERY (Pending)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] User manual & training guide
- [ ] System architecture diagram
- [ ] Deployment runbook
- [ ] Troubleshooting guide
- [ ] Source code documentation

---

## 🔧 Troubleshooting

### "Cannot find module 'bcrypt'"
```bash
npm install bcrypt
npm install --save-optional
```

### Database connection error
- Pastikan MySQL running: `mysql --version`
- Check DB credentials di `.env`
- Test connection: `mysql -u root -p sistem_evaluasi_kinerja`

### Port 3000 already in use
```bash
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=3001
```

### JWT token expired
- Delete token dari localStorage
- Login ulang untuk get new token

### CORS error
- Check CORS_ORIGIN di `.env`
- Pastikan frontend & backend URL sesuai

---

## 📝 Catatan Penting

### Production Checklist
- [ ] Update `.env` dengan production values
- [ ] Change `JWT_SECRET` ke string yang kuat
- [ ] Enable HTTPS untuk API
- [ ] Setup database backup schedule
- [ ] Configure proper logging & monitoring
- [ ] Implement rate limiting
- [ ] Setup firewall rules
- [ ] Enable database encryption

### Security Best Practices
- ✅ Password di-hash dengan bcrypt
- ✅ JWT untuk stateless authentication
- ✅ CORS configured
- ✅ Input validation on both client & server
- ✅ SQL injection prevention (parameterized queries)
- 🔲 TODO: Implement rate limiting
- 🔲 TODO: Add HTTPS support
- 🔲 TODO: Implement audit logging

### Performance Optimization
- ✅ Database connection pooling (10 connections)
- ✅ Indexes on foreign keys & frequently queried fields
- ✅ CSS minification ready
- ✅ Chart.js lazy loading
- 🔲 TODO: Implement API caching
- 🔲 TODO: Frontend asset bundling (webpack/vite)
- 🔲 TODO: Database query optimization

### Future Enhancements
1. **Multi-language Support** (Bahasa Indonesia & English)
2. **Advanced Analytics** (Trend analysis, forecasting)
3. **Email Notifications** (Penilaian reminders, reports)
4. **Mobile App** (React Native atau Flutter)
5. **Integration** (SSO dengan LDAP/Active Directory)
6. **Workflow Automation** (Auto-trigger penilaian process)
7. **Export Reports** (PDF, Excel dengan charts)
8. **Audit Trail** (Complete change history)

---

## 📞 Support & Contact

Untuk bantuan, pertanyaan, atau laporan bug:
- 📧 Email: support@sipeka.ac.id
- 💬 Chat: [Hubungi tim development]
- 📖 Documentation: [Lihat project wiki]

---

## 📄 License

ISC License - Bebas untuk penggunaan akademik maupun komersial

---

**Last Updated:** June 8, 2024  
**Version:** 1.0.0  
**Status:** ✅ Development Complete | 🔧 Testing Phase

---

## 📚 Additional Documentation

- [Dashboard Design Guide](DASHBOARD_DESIGN_GUIDE.md) - UI/UX principles & design system
- [CSS Improvements Reference](CSS_IMPROVEMENTS_REFERENCE.md) - Detailed CSS changes & enhancements
- [Database Schema](database.sql) - Complete database structure & sample data

---

**Made with ❤️ for educational excellence**
