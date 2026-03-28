# Dokumentasi Website Dashboard SSB Partner Ayres Apparel

## 1. Latar Belakang

Ayres Apparel ingin memberikan nilai tambah kepada SSB yang menjalin kerja sama, bukan hanya dalam bentuk penyediaan jersey, tetapi juga melalui fasilitas digital yang membantu operasional SSB. Untuk itu, dibangun sebuah website dashboard yang dapat digunakan oleh SSB partner untuk mengelola data peserta, keuangan, turnamen, dan operasional harian mereka.

Website ini menjadi salah satu benefit kerja sama yang membuat Ayres Apparel lebih unggul dibanding kompetitor, karena menawarkan solusi nyata yang membantu kebutuhan administrasi SSB sehari-hari.

## 2. Tujuan

Tujuan pembuatan website ini adalah:

* Memberikan benefit tambahan kepada SSB yang bekerja sama dengan Ayres Apparel.
* Membantu SSB mengelola data peserta secara lebih rapi dan terstruktur.
* Mempermudah pengelolaan keuangan SSB (billing, pembayaran, pemasukan, pengeluaran).
* Mempermudah dokumentasi data pemain atau peserta di masing-masing SSB.
* Memberikan laporan keuangan bulanan yang bisa di-export ke PDF.
* Menambah nilai profesionalitas kerja sama antara Ayres Apparel dan SSB.
* Menjadi salah satu nilai jual Ayres Apparel saat menawarkan partnership ke SSB.

## 3. Gambaran Umum Sistem

Website ini merupakan dashboard yang dipakai oleh SSB partner Ayres Apparel. Setiap SSB yang bekerja sama memiliki akses ke sistem untuk mengelola data peserta, keuangan, dan turnamen mereka sendiri.

Sistem dibangun menggunakan arsitektur modern dengan Next.js 16 sebagai full-stack framework, MySQL sebagai database, dan Tailwind CSS untuk tampilan. Sistem mendukung tiga role pengguna dengan hak akses yang berbeda-beda.

### Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | MySQL (mysql2) |
| Validasi | Zod 4 |
| PDF Export | jsPDF + jspdf-autotable |
| Animasi | Motion, Three.js, Cobe (3D Globe) |

## 4. Role Pengguna

Sistem memiliki tiga role pengguna dengan hak akses yang berbeda.

### 4.1 Admin Ayres (AYRES_ADMIN)

Admin Ayres merupakan pihak internal dari Ayres Apparel yang bertugas mengelola seluruh akun SSB partner dari panel admin (`/admin`).

Tanggung jawab Admin Ayres:

* Mendaftarkan akun SSB baru (termasuk akun Admin SSB, akun Pelatih, dan data partnership).
* Menginput data dasar SSB (nama, logo, alamat, telepon).
* Mengatur masa aktif akses dashboard (tanggal mulai dan berakhir).
* Mengaktifkan atau menonaktifkan akun SSB.
* Mengedit data SSB, akun admin, akun pelatih, dan partnership.
* Menghapus akun SSB beserta seluruh data terkait.
* Melihat statistik keseluruhan (total akun, akun aktif, akun perlu tindakan).

Setiap akun SSB memiliki periode akses berdasarkan tanggal kerja sama. Setelah melewati tanggal berakhir, akses dashboard otomatis tidak bisa digunakan hingga diperpanjang oleh Admin Ayres.

### 4.2 Admin SSB (SSB_ADMIN)

Admin SSB adalah pihak dari SSB yang diberi akses untuk menggunakan dashboard (`/dashboard`).

Tanggung jawab Admin SSB:

* Login ke dashboard SSB.
* Mengelola profil SSB (nama, logo, alamat, telepon, catatan partnership).
* Mengelola data peserta (tambah, edit, hapus, lihat detail, upload foto).
* Mengelola kelompok umur (CRUD, rekomendasi otomatis berdasarkan tanggal lahir).
* Mengelola turnamen (tambah, edit, hapus, daftarkan peserta).
* Mengatur konfigurasi billing (tipe dan tarif iuran).
* Mengelola pembayaran (lihat invoice, tandai lunas, buat session payment).
* Mencatat transaksi manual (pemasukan dan pengeluaran).
* Melihat laporan keuangan bulanan (ringkasan pemasukan, pengeluaran, saldo).
* Export laporan keuangan ke PDF.
* Export data peserta ke PDF.

### 4.3 Pelatih (PELATIH)

Pelatih adalah coach dari SSB yang diberi akses read-only ke data peserta melalui dashboard (`/dashboard`).

Hak akses Pelatih:

* Melihat daftar peserta (tabel dengan pencarian dan pagination).
* Melihat detail peserta (modal dengan foto dan informasi lengkap).
* Export data peserta ke PDF.

Pelatih tidak memiliki akses untuk:

* Mengedit atau menghapus data peserta.
* Mengakses tab Keuangan, Report, atau Turnamen.
* Mengedit profil SSB atau konfigurasi billing.

## 5. Permasalahan yang Ingin Diselesaikan

Beberapa masalah yang diselesaikan melalui website ini:

* Banyak SSB masih mengelola data peserta secara manual.
* Data peserta sering tercecer di chat, catatan, atau spreadsheet terpisah.
* Sulit melakukan pendataan jumlah peserta aktif.
* Sulit melihat data peserta berdasarkan kelompok umur.
* Pengelolaan keuangan SSB (iuran, pengeluaran) belum terstruktur.
* Tidak ada laporan keuangan yang bisa dicetak atau di-export.
* Belum ada benefit digital yang benar-benar terasa saat SSB bekerja sama dengan vendor apparel.

## 6. Solusi yang Ditawarkan

Solusi yang ditawarkan adalah website dashboard dengan fungsi utama:

* Menyimpan dan mengelola data peserta SSB secara terpusat.
* Mengelompokkan peserta berdasarkan kelompok umur secara otomatis.
* Mengelola keuangan SSB (billing, pembayaran, pemasukan, pengeluaran).
* Menghasilkan laporan keuangan bulanan dengan ringkasan lengkap.
* Export data peserta dan laporan keuangan ke format PDF.
* Mengelola data turnamen dan pendaftaran peserta.
* Sistem multi-role (admin pusat, admin SSB, pelatih) dengan hak akses terpisah.

## 7. Fitur Utama

### 7.1 Login

Setiap SSB memiliki akun untuk masuk ke dashboard.

Fungsi:

* Login menggunakan email dan password.
* Keamanan akses dengan session token (HMAC-SHA256) di HTTP-only cookie.
* Password di-hash menggunakan algoritma scrypt dengan salt.
* Validasi masa aktif partnership saat login (akun tidak bisa login jika partnership sudah berakhir).
* Redirect otomatis berdasarkan role (Admin Ayres ke `/admin`, Admin SSB dan Pelatih ke `/dashboard`).
* Tampilan login dengan animasi partikel dan ilustrasi.

### 7.2 Dashboard Ringkasan (Tab Overview)

Halaman utama setelah login berisi ringkasan data SSB.

Informasi yang ditampilkan:

* Jumlah total peserta.
* Jumlah peserta aktif.
* Jumlah peserta nonaktif.
* Informasi partnership (status, tanggal mulai/berakhir).
* Daftar peserta terbaru (activity feed).
* Profil SSB (nama, logo, alamat, telepon, catatan partnership) yang bisa diedit langsung.

### 7.3 Manajemen Peserta (Tab Peserta)

Fitur inti untuk mengelola peserta SSB.

Data peserta yang disimpan:

* Nama lengkap
* Nama panggilan
* Foto peserta (upload JPG/PNG/WEBP, maks 2 MB)
* Tanggal lahir (umur dihitung otomatis)
* Kelompok umur (rekomendasi otomatis berdasarkan tanggal lahir)
* Turnamen yang diikuti (bisa lebih dari satu, dipilih via checkbox)
* Posisi bermain
* Ukuran jersey
* Alamat
* Nama orang tua / wali
* Nomor HP orang tua / wali
* Tanggal bergabung
* Status peserta (aktif / nonaktif)
* Catatan tambahan

Fungsi utama:

* Tambah peserta baru (dengan form lengkap dan upload foto).
* Edit data peserta.
* Hapus data peserta (dengan konfirmasi).
* Lihat detail peserta (modal popup dengan semua informasi).
* Cari peserta berdasarkan nama, posisi, ukuran jersey, atau kelompok umur.
* Pagination tabel (4 data per halaman).
* Export data peserta ke PDF (dari modal detail).

### 7.4 Kelompok Umur

Admin SSB dapat membuat dan mengelola kelompok umur.

Fungsi:

* CRUD kelompok umur (nama, umur minimum, umur maksimum).
* Rekomendasi otomatis kelompok umur berdasarkan tanggal lahir peserta.
* Pengelompokan peserta ke dalam kelompok umur yang sesuai.

### 7.5 Manajemen Turnamen (Tab Tournament)

Admin SSB dapat mengelola data turnamen.

Fungsi:

* Tambah turnamen baru (nama, judul, tanggal, deskripsi).
* Edit data turnamen.
* Hapus turnamen (dengan konfirmasi).
* Mendaftarkan peserta ke turnamen melalui checkbox di form peserta.

### 7.6 Keuangan & Billing (Tab Keuangan)

Admin SSB dapat mengatur konfigurasi billing dan mengelola pembayaran peserta.

Konfigurasi billing mendukung tiga tipe:

| Tipe | Keterangan | Fee yang Digunakan |
|------|------------|--------------------|
| Bulanan (MONTHLY) | Iuran bulanan saja | Biaya bulanan |
| Pendaftaran + Sesi (REGISTRATION_SESSION) | Biaya pendaftaran + per sesi latihan | Biaya pendaftaran, Biaya sesi |
| Bulanan + Sesi (MONTHLY_SESSION) | Iuran bulanan + per sesi latihan | Biaya bulanan, Biaya sesi |

Fungsi pembayaran:

* Auto-generate invoice bulanan berdasarkan peserta aktif.
* Auto-generate invoice pendaftaran untuk peserta baru.
* Tandai pembayaran sebagai lunas (dengan catatan opsional).
* Buat session payment langsung (pembayaran sesi instan).
* Ringkasan keuangan bulan berjalan (total belum bayar, sudah bayar, jumlah invoice).
* Filter pembayaran berdasarkan bulan.

### 7.7 Laporan Keuangan (Tab Report)

Admin SSB dapat melihat laporan keuangan dan mencatat transaksi.

Fungsi:

* Ringkasan keuangan bulanan:
  * Total pemasukan (pemasukan sistem dari pembayaran + pemasukan manual).
  * Total pengeluaran.
  * Saldo (pemasukan - pengeluaran).
* Input transaksi manual (pemasukan atau pengeluaran) dengan keterangan, jumlah, dan tanggal.
* Daftar transaksi bulan berjalan (manual + otomatis dari pembayaran).
* Filter transaksi berdasarkan tipe (semua, pemasukan, pengeluaran).
* Pencarian transaksi berdasarkan keterangan.
* Hapus transaksi manual.
* Pagination tabel transaksi.
* **Export laporan keuangan ke PDF** berisi:
  * Header (nama SSB, bulan laporan).
  * Ringkasan keuangan (total pemasukan, pengeluaran, saldo).
  * Rincian pemasukan (tabel lengkap).
  * Rincian pengeluaran (tabel lengkap).
  * Footer (tanggal cetak, nomor halaman).

### 7.8 Export Data PDF

Sistem menyediakan export data ke format PDF.

#### Export Laporan Keuangan
* Diakses dari tombol "Export PDF" di tab Report.
* Isi: ringkasan keuangan + rincian pemasukan + rincian pengeluaran bulan yang dipilih.
* Nama file: `Laporan_Keuangan_[NamaSSB]_[YYYY-MM].pdf`

#### Export Data Peserta
* Diakses dari tombol "PDF" di modal detail peserta.
* Isi: seluruh informasi peserta (nama, status, data pribadi, wali, alamat, catatan).
* Nama file: `Data_Peserta_[NamaPeserta].pdf`

### 7.9 Profil SSB

Setiap SSB dapat mengelola informasi profil mereka dari tab Overview.

Data profil yang dapat disimpan:

* Nama SSB
* Logo SSB (upload gambar, maks 2 MB)
* Alamat
* Nomor telepon
* Catatan partnership

### 7.10 Data Ukuran Jersey

Karena website ini terhubung dengan benefit kerja sama apparel, data ukuran jersey peserta menjadi nilai tambah.

Fungsi:

* Menyimpan ukuran jersey setiap peserta.
* Mempermudah rekap saat pemesanan jersey.
* Mengurangi kesalahan pendataan ukuran.

### 7.11 Panel Admin Ayres

Panel khusus untuk Admin Ayres (`/admin`) untuk mengelola seluruh akun SSB.

Fungsi:

* Buat akun SSB baru (lengkap dengan akun admin, akun pelatih opsional, dan data partnership).
* Edit data SSB, akun admin, akun pelatih, dan tanggal partnership.
* Hapus akun SSB (cascade menghapus seluruh data terkait).
* Lihat detail setiap akun SSB (modal popup).
* Pencarian dan filter akun SSB.
* Statistik dashboard: total akun, akun aktif, akun perlu tindakan.
* Upload logo SSB saat pembuatan akun.

## 8. Alur Penggunaan Sistem

### Alur Admin Ayres

1. Admin Ayres login ke sistem (`/admin`).
2. Admin Ayres membuat akun SSB baru (mengisi data SSB, akun admin, opsional akun pelatih, dan tanggal partnership).
3. Admin Ayres memantau status partnership semua SSB.
4. Jika partnership berakhir, Admin Ayres dapat memperpanjang atau menonaktifkan akun.

### Alur Admin SSB

1. Admin SSB login ke dashboard (`/dashboard`).
2. Admin SSB mengisi/mengedit profil SSB.
3. Admin SSB membuat kelompok umur.
4. Admin SSB menambahkan data peserta (dengan foto, kelompok umur, turnamen, ukuran jersey, dll).
5. Admin SSB mengatur konfigurasi billing (tipe iuran dan tarif).
6. Setiap bulan, sistem otomatis membuat invoice pembayaran.
7. Admin SSB menandai pembayaran yang sudah lunas.
8. Admin SSB mencatat transaksi manual (pemasukan/pengeluaran tambahan).
9. Admin SSB melihat dan meng-export laporan keuangan bulanan ke PDF.
10. Admin SSB mengelola data turnamen dan mendaftarkan peserta.

### Alur Pelatih

1. Pelatih login ke dashboard (`/dashboard`).
2. Pelatih melihat daftar peserta dan mencari berdasarkan nama/posisi.
3. Pelatih melihat detail peserta melalui modal.
4. Pelatih meng-export data peserta ke PDF jika diperlukan.

## 9. Struktur Halaman

| No | Halaman | URL | Role |
|----|---------|-----|------|
| 1 | Landing (redirect) | `/` | Semua |
| 2 | Login | `/login` | Public |
| 3 | Dashboard SSB | `/dashboard` | SSB_ADMIN, PELATIH |
| 4 | Panel Admin Ayres | `/admin` | AYRES_ADMIN |

### Tab Dashboard SSB

| Tab | Fungsi | Akses |
|-----|--------|-------|
| Overview | Ringkasan data, profil SSB | SSB_ADMIN |
| Peserta | Manajemen peserta & kelompok umur | SSB_ADMIN |
| Tournament | Manajemen turnamen | SSB_ADMIN |
| Keuangan | Billing, pembayaran | SSB_ADMIN |
| Report | Laporan keuangan, transaksi, export PDF | SSB_ADMIN |

> Pelatih hanya melihat daftar peserta dan detail peserta tanpa tab navigasi.

## 10. Database

### Tabel

| No | Tabel | Keterangan |
|----|-------|------------|
| 1 | `ssb` | Data Sekolah Sepak Bola (nama, logo, alamat, telepon, catatan partnership) |
| 2 | `users` | Akun pengguna (email, password terenkripsi, role, relasi ke SSB) |
| 3 | `partnerships` | Data kemitraan SSB (tanggal mulai, tanggal berakhir, status) |
| 4 | `participants` | Data peserta/pemain (identitas, posisi, jersey, wali, foto, status) |
| 5 | `age_groups` | Kelompok umur per SSB (nama, umur min, umur maks) |
| 6 | `ssb_billing_config` | Konfigurasi billing per SSB (tipe, tarif) |
| 7 | `payments` | Record pembayaran/invoice (tipe, jumlah, status, tanggal bayar) |
| 8 | `transactions` | Transaksi keuangan manual (pemasukan/pengeluaran) |
| 9 | `tournaments` | Data turnamen (nama, judul, tanggal, deskripsi) |

### Relasi Antar Tabel

```
ssb (1) ──── (*) users
ssb (1) ──── (1) partnerships
ssb (1) ──── (*) participants ──── (*) payments
ssb (1) ──── (*) age_groups
ssb (1) ──── (1) ssb_billing_config
ssb (1) ──── (*) transactions
ssb (1) ──── (*) tournaments
```

Semua data SSB terpisah satu sama lain. Setiap query difilter berdasarkan `ssb_id` dari session pengguna yang login.

## 11. Keamanan

| Aspek | Implementasi |
|-------|-------------|
| Session | Custom token (HMAC-SHA256) di HTTP-only cookie, masa berlaku 12 jam |
| Password | Hashing scrypt dengan salt, verifikasi timing-safe |
| Akses Halaman | Validasi session + role + status partnership aktif di server-side |
| SQL Injection | Parameterized queries di seluruh data layer |
| File Upload | Validasi tipe file (JPG/PNG/WEBP) dan ukuran maksimum 2 MB |
| CSRF | SameSite=lax cookie policy |
| Isolasi Data | Setiap SSB hanya bisa mengakses datanya sendiri melalui filter `ssb_id` |

## 12. Kebutuhan Fungsional

Berikut kebutuhan fungsional yang telah diimplementasikan:

* Sistem menyediakan login untuk setiap akun SSB dan pelatih.
* Sistem memverifikasi masa aktif akun berdasarkan tanggal kerja sama saat login.
* Sistem hanya dapat diakses jika akun masih berada dalam periode partnership aktif.
* Sistem memungkinkan Admin Ayres membuat akun SSB (admin + pelatih + partnership).
* Sistem memungkinkan Admin Ayres mengatur tanggal aktif dan berakhir akses dashboard.
* Sistem memungkinkan Admin Ayres mengedit dan menghapus akun SSB.
* Sistem memungkinkan Admin SSB mengelola profil SSB (nama, logo, alamat, telepon).
* Sistem memungkinkan Admin SSB menambah, mengedit, dan menghapus data peserta.
* Sistem memungkinkan Admin SSB meng-upload foto peserta.
* Sistem memungkinkan Admin SSB mengelola kelompok umur dengan rekomendasi otomatis.
* Sistem memungkinkan Admin SSB mengelola turnamen dan mendaftarkan peserta.
* Sistem memungkinkan Admin SSB mengatur konfigurasi billing (3 tipe).
* Sistem otomatis membuat invoice bulanan berdasarkan peserta aktif.
* Sistem memungkinkan Admin SSB menandai pembayaran sebagai lunas.
* Sistem memungkinkan Admin SSB mencatat transaksi manual (pemasukan/pengeluaran).
* Sistem menampilkan laporan keuangan bulanan (pemasukan, pengeluaran, saldo).
* Sistem memungkinkan export laporan keuangan ke PDF.
* Sistem memungkinkan export data peserta ke PDF.
* Sistem menampilkan daftar peserta dengan pencarian dan pagination.
* Sistem menampilkan ringkasan jumlah peserta di dashboard.
* Sistem menyimpan data ukuran jersey peserta.
* Pelatih dapat melihat data peserta dalam mode read-only.
* Pelatih dapat meng-export data peserta ke PDF.
* Data tiap SSB terpisah dan tidak bisa diakses oleh SSB lain.

## 13. Kebutuhan Non-Fungsional

Berikut kebutuhan non-fungsional yang telah dipenuhi:

* Interface modern dengan desain glass-morphism dan animasi halus.
* Responsive, bisa diakses melalui laptop dan smartphone.
* Loading cepat dengan Turbopack (Next.js 16).
* Data tiap SSB terpisah dan aman melalui isolasi `ssb_id`.
* Sistem modular dan mudah dikembangkan (component-based architecture).
* Validasi data di sisi client dan server menggunakan Zod.
* Notifikasi feedback (toast) untuk setiap aksi pengguna.
* Pagination untuk performa optimal pada data besar.

## 14. Manfaat untuk SSB

Manfaat website bagi SSB:

* Pendataan peserta menjadi lebih rapi dan terstruktur.
* Tidak perlu mengelola data secara manual di spreadsheet atau chat.
* Mudah melihat jumlah peserta aktif dan nonaktif.
* Mudah mengelompokkan pemain berdasarkan kelompok umur.
* Data ukuran jersey tersimpan dengan baik untuk mempermudah pemesanan.
* Pengelolaan keuangan (iuran, pengeluaran) lebih terstruktur.
* Laporan keuangan bulanan bisa di-export ke PDF.
* Data peserta bisa di-export ke PDF untuk keperluan dokumentasi.
* Pelatih bisa mengakses data peserta secara mandiri.
* Memberikan kesan bahwa SSB memiliki sistem yang profesional.

## 15. Manfaat untuk Ayres Apparel

Manfaat website bagi Ayres Apparel:

* Menjadi nilai tambah saat menawarkan kerja sama ke SSB.
* Meningkatkan peluang SSB memilih Ayres dibanding kompetitor.
* Membangun hubungan kerja sama jangka panjang melalui platform digital.
* Mempermudah proses rekap data jersey saat ada pemesanan.
* Memantau status partnership seluruh SSB dari satu panel admin.
* Meningkatkan citra Ayres sebagai apparel partner yang modern dan solutif.

## 16. Fitur yang Bisa Dikembangkan di Masa Depan

Untuk pengembangan selanjutnya, sistem dapat ditambahkan fitur:

* Absensi latihan peserta.
* Jadwal latihan mingguan.
* Pengumuman untuk orang tua atau peserta.
* Upload dokumen peserta (akta lahir, kartu pelajar, dll).
* Rekap pemesanan jersey langsung dari data peserta.
* Notifikasi perpanjangan kerja sama (email/WhatsApp).
* Dashboard analitik (grafik perkembangan peserta, tren keuangan).
* Export data ke format Excel.
* Integrasi payment gateway untuk pembayaran online.

## 17. Kesimpulan

Website Dashboard SSB Partner Ayres Apparel merupakan solusi digital komprehensif yang ditujukan sebagai benefit tambahan bagi SSB yang bekerja sama dengan Ayres Apparel. Sistem ini mencakup pengelolaan peserta, keuangan (billing, pembayaran, laporan), turnamen, dan multi-role access control dengan tiga jenis pengguna (Admin Ayres, Admin SSB, dan Pelatih).

Dengan adanya website ini, Ayres Apparel tidak hanya hadir sebagai penyedia jersey, tetapi juga sebagai partner yang memberikan solusi nyata untuk kebutuhan administrasi dan operasional SSB. Hal ini menjadi keunggulan kompetitif dan memperkuat posisi Ayres Apparel dalam menawarkan kerja sama ke berbagai SSB.
