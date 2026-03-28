# Dashboard SSB Partner Ayres Apparel

Dashboard digital untuk manajemen Sekolah Sepak Bola (SSB) yang bermitra dengan **Ayres Apparel**. Aplikasi ini memungkinkan pengelolaan data peserta, keuangan, turnamen, dan billing secara terpusat dengan sistem multi-role.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Frontend | React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | MySQL (mysql2) |
| Validasi | Zod 4 |
| PDF Export | jsPDF + jspdf-autotable |
| Animasi | Motion, Three.js, Cobe (3D Globe) |

## Fitur Utama

- **Multi-Role Access Control** — 3 role: Ayres Admin, SSB Admin, Pelatih (Coach)
- **Manajemen Peserta** — CRUD data pemain lengkap dengan upload foto
- **Kelompok Umur** — Klasifikasi otomatis berdasarkan tanggal lahir
- **Billing & Pembayaran** — 3 tipe billing, auto-generate invoice bulanan
- **Laporan Keuangan** — Tracking pemasukan/pengeluaran, ringkasan saldo
- **Turnamen** — Kelola data turnamen dan pendaftaran peserta
- **Export PDF** — Export data peserta dan laporan keuangan ke PDF
- **Partnership Management** — Admin pusat kelola akun SSB dan masa kemitraan

## Prasyarat

- **Node.js** >= 18
- **MySQL** >= 8.0
- **npm** (atau pnpm/yarn)

## Instalasi

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd web_ssb
npm install
```

### 2. Konfigurasi Environment

Salin file `.env.example` ke `.env.local` lalu sesuaikan:

```bash
cp .env.example .env.local
```

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ayres_ssb_dashboard
AUTH_SECRET=ganti-dengan-random-secret
```

> `AUTH_SECRET` digunakan untuk signing session token (HMAC-SHA256). Gunakan string acak yang panjang.

### 3. Setup Database

Jalankan schema utama, lalu migration secara berurutan:

```sql
-- 1. Buat database
CREATE DATABASE ayres_ssb_dashboard;
USE ayres_ssb_dashboard;

-- 2. Jalankan schema utama
SOURCE database/schema.sql;

-- 3. Jalankan migration (urut)
SOURCE database/migrations/2026-03-09-add-ssb-partnership-notes.sql;
SOURCE database/migrations/2026-03-28-add-age-groups-and-photo.sql;
SOURCE database/migrations/2026-03-28-add-billing-and-payments.sql;
SOURCE database/migrations/2026-03-28-add-transactions.sql;
SOURCE database/migrations/2026-03-28-rename-deposit-to-registration.sql;

-- 4. (Opsional) Seed data awal
SOURCE database/seed.sql;
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Scripts

| Script | Perintah | Keterangan |
|--------|----------|------------|
| Dev | `npm run dev` | Jalankan development server (Turbopack) |
| Build | `npm run build` | Build untuk production |
| Start | `npm run start` | Jalankan production server |
| Lint | `npm run lint` | Cek linting dengan ESLint |

## Struktur Project

```
web_ssb/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (font, metadata)
│   ├── page.tsx                      # Landing — redirect by role
│   ├── login/page.tsx                # Halaman login
│   ├── dashboard/page.tsx            # Dashboard SSB Admin & Pelatih
│   ├── admin/page.tsx                # Panel Ayres Admin
│   └── api/                          # API Routes
│       ├── auth/
│       │   ├── login/route.ts        # POST — login
│       │   └── logout/route.ts       # POST — logout
│       ├── admin/ssb/
│       │   ├── route.ts              # GET, POST — list & create SSB
│       │   └── [id]/route.ts         # PATCH, DELETE — update & delete SSB
│       ├── dashboard/summary/
│       │   └── route.ts              # GET — dashboard statistics
│       ├── participants/
│       │   ├── route.ts              # GET, POST — list & create peserta
│       │   └── [id]/route.ts         # PATCH, DELETE — update & delete peserta
│       └── ssb/
│           ├── profile/route.ts      # GET, PATCH — profil SSB
│           ├── age-groups/
│           │   ├── route.ts          # GET, POST
│           │   └── [id]/route.ts     # PATCH, DELETE
│           ├── billing/route.ts      # GET, PUT — konfigurasi billing
│           ├── payments/
│           │   ├── route.ts          # GET, POST — list & create pembayaran
│           │   └── [id]/route.ts     # PATCH — tandai lunas
│           ├── tournaments/
│           │   ├── route.ts          # GET, POST
│           │   └── [id]/route.ts     # PATCH, DELETE
│           └── transactions/
│               ├── route.ts          # GET, POST — transaksi keuangan
│               └── [id]/route.ts     # DELETE
├── components/
│   ├── dashboard-shell.tsx           # Shell utama dashboard (tabs, peserta, profil)
│   ├── finance-manager.tsx           # Tab Keuangan (billing, pembayaran)
│   ├── report-manager.tsx            # Tab Report (laporan keuangan, export PDF)
│   ├── tournament-manager.tsx        # Tab Turnamen
│   ├── admin-ssb-manager.tsx         # Panel kelola akun SSB (Ayres Admin)
│   ├── admin-stats.tsx               # Kartu statistik admin
│   ├── admin-actions.tsx             # Tombol aksi admin (logout)
│   ├── login-form.tsx                # Form login
│   ├── login-preloader.tsx           # Preloader saat login
│   ├── particle-background.tsx       # Animasi partikel canvas
│   ├── dashboard-illustration.tsx    # Ilustrasi SVG halaman login
│   ├── border-glow.tsx               # Efek glow dekoratif
│   └── ui/globe.tsx                  # 3D Globe (Three.js + Cobe)
├── lib/
│   ├── auth.ts                       # Autentikasi (session, hashing, cookie)
│   ├── data.ts                       # Data layer (query, types, CRUD functions)
│   ├── db.ts                         # MySQL connection pool
│   ├── validation.ts                 # Zod schemas
│   ├── uploads.ts                    # Upload handler (logo, foto peserta)
│   ├── admin-access.ts              # Guard akses Ayres Admin
│   └── dashboard-access.ts          # Guard akses SSB Admin & Pelatih
├── database/
│   ├── schema.sql                    # Schema database utama
│   ├── seed.sql                      # Data seed awal
│   └── migrations/                   # File migrasi database
├── public/
│   └── uploads/                      # File upload (logo SSB, foto peserta)
│       ├── ssb/
│       └── participants/
├── .env.example                      # Template environment variables
├── next.config.ts
├── tsconfig.json
├── tailwind.config (via CSS)
└── package.json
```

## Sistem Role & Hak Akses

### AYRES_ADMIN (Admin Pusat)

Mengelola seluruh akun SSB partner dari panel `/admin`.

| Fitur | Akses |
|-------|-------|
| Buat akun SSB (admin + pelatih + partnership) | Ya |
| Edit data SSB, akun admin, akun pelatih | Ya |
| Atur tanggal & status partnership | Ya |
| Hapus akun SSB (cascade semua data) | Ya |
| Lihat statistik (total, aktif, perlu tindakan) | Ya |

### SSB_ADMIN (Admin SSB)

Mengelola operasional SSB dari dashboard `/dashboard`.

| Fitur | Akses |
|-------|-------|
| Edit profil SSB (nama, logo, alamat, telepon) | Ya |
| CRUD data peserta (+ upload foto) | Ya |
| CRUD kelompok umur | Ya |
| CRUD turnamen | Ya |
| Konfigurasi billing (tipe & tarif) | Ya |
| Kelola pembayaran (tandai lunas, buat session payment) | Ya |
| Input transaksi manual (pemasukan/pengeluaran) | Ya |
| Lihat laporan keuangan bulanan | Ya |
| Export PDF laporan keuangan | Ya |
| Export PDF data peserta | Ya |

### PELATIH (Coach)

Akses read-only ke data peserta dari dashboard `/dashboard`.

| Fitur | Akses |
|-------|-------|
| Lihat daftar peserta (tabel + pencarian) | Ya |
| Lihat detail peserta (modal) | Ya |
| Export PDF data peserta | Ya |
| Edit/hapus peserta | Tidak |
| Akses tab Keuangan, Report, Turnamen | Tidak |

## Database

### Tabel Utama

| Tabel | Keterangan |
|-------|------------|
| `ssb` | Data Sekolah Sepak Bola (nama, logo, alamat, telepon) |
| `users` | Akun pengguna (email, password, role, ssb_id) |
| `partnerships` | Data kemitraan SSB (tanggal mulai/akhir, status) |
| `participants` | Data peserta/pemain |
| `age_groups` | Klasifikasi kelompok umur per SSB |
| `ssb_billing_config` | Konfigurasi billing per SSB |
| `payments` | Record pembayaran (invoice) |
| `transactions` | Transaksi keuangan manual |
| `tournaments` | Data turnamen |

### Relasi

```
ssb (1) ──── (*) users
ssb (1) ──── (1) partnerships
ssb (1) ──── (*) participants ──── (*) payments
ssb (1) ──── (*) age_groups
ssb (1) ──── (1) ssb_billing_config
ssb (1) ──── (*) transactions
ssb (1) ──── (*) tournaments
```

### Tipe Billing

| Tipe | Keterangan | Fee yang Digunakan |
|------|------------|--------------------|
| `MONTHLY` | Iuran bulanan saja | `monthly_fee` |
| `REGISTRATION_SESSION` | Pendaftaran + per sesi | `registration_fee`, `session_fee` |
| `MONTHLY_SESSION` | Bulanan + per sesi | `monthly_fee`, `session_fee` |

## API Endpoints

### Auth

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/auth/login` | Login, return session cookie |
| POST | `/api/auth/logout` | Logout, hapus session |

### Admin (AYRES_ADMIN)

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/admin/ssb` | List semua SSB dengan partnership & coach |
| POST | `/api/admin/ssb` | Buat SSB baru (SSB + admin + coach + partnership) |
| PATCH | `/api/admin/ssb/:id` | Update data SSB |
| DELETE | `/api/admin/ssb/:id` | Hapus SSB dan seluruh data terkait |

### Dashboard

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/dashboard/summary` | Statistik dashboard (jumlah peserta, partnership) |

### Peserta

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/participants` | List peserta per SSB |
| POST | `/api/participants` | Tambah peserta (FormData, support foto) |
| PATCH | `/api/participants/:id` | Update peserta |
| DELETE | `/api/participants/:id` | Hapus peserta |

### SSB Profile

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/ssb/profile` | Ambil profil SSB |
| PATCH | `/api/ssb/profile` | Update profil SSB (FormData, support logo) |

### Kelompok Umur

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/ssb/age-groups` | List kelompok umur |
| POST | `/api/ssb/age-groups` | Buat kelompok umur baru |
| PATCH | `/api/ssb/age-groups/:id` | Update kelompok umur |
| DELETE | `/api/ssb/age-groups/:id` | Hapus kelompok umur |

### Billing & Pembayaran

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/ssb/billing` | Ambil konfigurasi billing |
| PUT | `/api/ssb/billing` | Simpan/update konfigurasi billing |
| GET | `/api/ssb/payments?month=YYYY-MM` | List pembayaran bulan tertentu (auto-generate invoice) |
| POST | `/api/ssb/payments` | Buat session payment (langsung lunas) |
| PATCH | `/api/ssb/payments/:id` | Tandai pembayaran sebagai lunas |

### Turnamen

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/ssb/tournaments` | List turnamen |
| POST | `/api/ssb/tournaments` | Buat turnamen baru |
| PATCH | `/api/ssb/tournaments/:id` | Update turnamen |
| DELETE | `/api/ssb/tournaments/:id` | Hapus turnamen |

### Transaksi Keuangan

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/ssb/transactions?month=YYYY-MM` | List transaksi + ringkasan laporan |
| POST | `/api/ssb/transactions` | Buat transaksi manual (pemasukan/pengeluaran) |
| DELETE | `/api/ssb/transactions/:id` | Hapus transaksi manual |

## Autentikasi & Keamanan

- **Session**: Custom token (HMAC-SHA256) disimpan di HTTP-only cookie (`ayres_session`, 12 jam)
- **Password**: Hashing dengan scrypt + salt, verifikasi timing-safe
- **Akses Halaman**: Validasi session + role + status partnership aktif di server-side
- **SQL Injection**: Parameterized queries di seluruh data layer
- **File Upload**: Validasi tipe (JPG/PNG/WEBP) dan ukuran maks 2 MB
- **CSRF**: SameSite=lax cookie policy

## Upload File

| Jenis | Path | Format | Maks |
|-------|------|--------|------|
| Logo SSB | `public/uploads/ssb/` | JPG, PNG, WEBP | 2 MB |
| Foto Peserta | `public/uploads/participants/` | JPG, PNG, WEBP | 2 MB |

Nama file otomatis di-generate menggunakan UUID.

## Export PDF

### Laporan Keuangan (Tab Report)
- Header: nama SSB, bulan laporan
- Ringkasan: total pemasukan (sistem + manual), pengeluaran, saldo
- Rincian pemasukan: tabel lengkap semua pemasukan bulan tersebut
- Rincian pengeluaran: tabel lengkap semua pengeluaran bulan tersebut
- Footer: tanggal cetak, nomor halaman

### Data Peserta (Modal Detail)
- Header: nama SSB
- Detail: nama, status, panggilan, tanggal lahir, umur, kelompok umur, turnamen, posisi, ukuran jersey, tanggal bergabung, wali, HP wali, alamat, catatan
- Footer: tanggal cetak
