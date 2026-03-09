# Dokumentasi Website Dashboard SSB Partner Ayres Apparel

## 1. Latar Belakang

Ayres Apparel ingin memberikan nilai tambah kepada SSB yang menjalin kerja sama, bukan hanya dalam bentuk penyediaan jersey, tetapi juga melalui fasilitas digital yang membantu operasional SSB. Untuk itu, akan dibuat sebuah website sederhana berupa dashboard yang dapat digunakan oleh SSB partner untuk mengelola data peserta mereka.

Website ini diharapkan menjadi salah satu benefit kerja sama yang membuat Ayres Apparel lebih unggul dibanding kompetitor, karena menawarkan solusi yang membantu kebutuhan administrasi SSB sehari-hari.

## 2. Tujuan

Tujuan pembuatan website ini adalah:
* Memberikan benefit tambahan kepada SSB yang bekerja sama dengan Ayres Apparel.
* Membantu SSB mengelola data peserta secara lebih rapi dan terstruktur.
* Mempermudah dokumentasi data pemain atau peserta di masing-masing SSB.
* Menambah nilai profesionalitas kerja sama antara Ayres Apparel dan SSB.
* Menjadi salah satu nilai jual Ayres Apparel saat menawarkan partnership ke SSB.

## 3. Gambaran Umum Sistem

Website ini merupakan dashboard sederhana yang dipakai oleh SSB partner Ayres Apparel. Setiap SSB yang bekerja sama nantinya bisa memiliki akses ke sistem untuk mengelola data peserta mereka sendiri.

Fokus utama website adalah pengelolaan peserta, bukan sistem yang terlalu kompleks. Jadi, fitur dibuat sesederhana mungkin agar mudah digunakan oleh pengelola SSB.

## 4. Role Pengguna

Sistem hanya memiliki dua role utama agar tetap sederhana dan mudah dikelola.

### 4.1 Admin Ayres

Admin Ayres merupakan pihak internal dari Ayres Apparel yang bertugas mengelola akses SSB ke dalam sistem.

Tanggung jawab Admin Ayres:

* Mendaftarkan akun Admin SSB yang telah resmi bekerja sama dengan Ayres Apparel.
* Menginput data dasar SSB.
* Mengatur masa aktif akses dashboard.
* Mengaktifkan atau menonaktifkan akun SSB.

Setiap akun SSB akan memiliki periode akses berdasarkan tanggal kerja sama.

Contoh:

Tanggal aktif: 1 Januari 2026
Tanggal berakhir: 1 Januari 2027

Setelah melewati tanggal berakhir, akses dashboard dapat dinonaktifkan atau diperpanjang oleh Admin Ayres.

### 4.2 Admin SSB

Admin SSB adalah pihak dari SSB yang diberi akses untuk menggunakan dashboard.

Tanggung jawab Admin SSB:

* Login ke dashboard SSB.
* Mengelola profil SSB.
* Mengelola data peserta.
* Menambah, mengedit, dan menghapus data peserta.
* Mengelola data ukuran jersey pemain.
* Melihat ringkasan data peserta.
* Melakukan export data peserta jika diperlukan.

Admin SSB tidak memiliki akses untuk membuat akun baru atau mengatur masa aktif sistem.

## 5. Permasalahan yang Ingin Diselesaikan

Permasalahan yang Ingin Diselesaikan
Beberapa masalah yang ingin diselesaikan melalui website ini:

* Banyak SSB masih mengelola data peserta secara manual.
* Data peserta sering tercecer di chat, catatan, atau spreadsheet terpisah.
* Sulit melakukan pendataan jumlah peserta aktif.
* Sulit melihat data peserta berdasarkan kelompok umur.
* Belum ada benefit digital yang benar-benar terasa saat SSB bekerja sama dengan vendor apparel.

## 6. Solusi yang Ditawarkan

Solusi yang ditawarkan adalah website dashboard sederhana dengan fungsi utama:

* Menyimpan data peserta SSB.
* Menambah, mengubah, dan menghapus data peserta.
* Mengelompokkan peserta berdasarkan kategori tertentu.
* Menampilkan data peserta secara rapi dalam dashboard.
* Memudahkan SSB melihat jumlah dan status peserta.

## 7. Fitur Utama

Berikut fitur utama yang direkomendasikan untuk versi awal website:

### 7.1 Login

Setiap SSB memiliki akun untuk masuk ke dashboard.

Fungsi:

* Login menggunakan email/username dan password.
* Keamanan akses agar data tiap SSB tidak tercampur.

### 7.2 Dashboard Ringkasan

Halaman utama setelah login berisi ringkasan data.

Informasi yang dapat ditampilkan:

* Jumlah total peserta.
* Jumlah peserta aktif.
* Jumlah peserta per kelompok umur.
* Data peserta terbaru.

### 7.3 Manajemen Peserta

Fitur inti untuk mengelola peserta SSB.

Data peserta yang bisa disimpan:

* Nama lengkap
* Nama panggilan
* Tanggal lahir
* Umur
* Lompoc umur
* Alamat
* Nama orang tua / wali
* Nomor HP orang tua / wali
* Tanggal bergabung
* Status peserta (aktif / nonaktif)
* Ukuran jersey
* Posisi bermain
* Catatan tambahan

Fungsi utama:

* Tambah peserta baru
* Edit data peserta
* Hapus data peserta
* Lihat detail peserta
* Cari peserta
* Filter peserta berdasarkan kategori

### 7.4 Pengelompokan Peserta

Peserta dapat dikelompokkan berdasarkan:

* Kelompok umur
* Status aktif / nonaktif
* Tahun masuk
* Posisi bermain

### 7.5 Export Data

SSB dapat mengunduh data peserta dalam format sederhana.

Opsi export:

* Excel
* PDF

### 7.6 Profil SSB

Setiap SSB dapat mengelola informasi profil mereka.

Data profil yang dapat disimpan:

* Nama SSB
* Logo SSB
* Alamat
* Nomor kontak
* Nama admin
* Jumlah peserta

### 7.7 Data Ukuran Jersey

Karena website ini terhubung dengan benefit kerja sama apparel, maka data ukuran jersey peserta bisa menjadi nilai tambah.

Fungsi:

* Menyimpan ukuran jersey setiap peserta
* Mempermudah rekap saat pemesanan jersey
* Mengurangi kesalahan pendataan ukuran

## 8. Fitur Tambahan yang Bisa Dikembangkan Nanti

Untuk tahap awal, fitur sebaiknya sederhana. Namun ke depannya sistem dapat dikembangkan dengan fitur tambahan seperti:

* Data pembayaran peserta
* Absensi latihan
* Jadwal latihan
* Pengumuman untuk orang tua atau peserta
* Upload dokumen peserta
* Rekap pemesanan jersey langsung dari data peserta
* Multi-user role (owner, admin, pelatih)
* Notifikasi perpanjangan kerja sama

## 9. Alur Penggunaan Sistem

Berikut alur penggunaan sederhana:

1. SSB bekerja sama dengan Ayres Apparel.
2. Ayres membuatkan akun dashboard untuk SSB.
3. Admin SSB login ke website.
4. Admin SSB mengisi profil SSB.
5. Admin SSB mulai menambahkan data peserta.
6. Data peserta dapat dilihat, dicari, diedit, atau dihapus.
7. Jika SSB ingin memesan jersey, data ukuran peserta sudah tersedia di sistem.

## 10. Manfaat untuk SSB

Manfaat website bagi SSB:

* Pendataan peserta menjadi lebih rapi.
* Tidak perlu mengelola data secara manual.
* Mudah melihat jumlah peserta aktif.
* Mudah mengelompokkan pemain berdasarkan umur.
* Data ukuran jersey tersimpan dengan baik.
* Memberikan kesan bahwa SSB memiliki sistem yang lebih profesional.

## 11. Manfaat untuk Ayres Apparel

Manfaat website bagi Ayres Apparel:

* Menjadi nilai tambah saat menawarkan kerja sama ke SSB.
* Meningkatkan peluang SSB memilih Ayres dibanding kompetitor.
* Membangun hubungan kerja sama jangka panjang.
* Mempermudah proses rekap data jersey saat ada pemesanan.
* Meningkatkan citra Ayres sebagai apparel partner yang modern dan solutif.

## 12. Kebutuhan Fungsional

Berikut kebutuhan fungsional sistem:

* Sistem harus menyediakan login untuk setiap akun SSB.
* Sistem harus memverifikasi masa aktif akun berdasarkan tanggal kerja sama.
* Sistem hanya dapat diakses jika akun masih berada dalam periode aktif.
* Sistem harus memungkinkan Admin Ayres membuat akun Admin SSB.
* Sistem harus memungkinkan Admin Ayres mengatur tanggal aktif dan tanggal berakhir akses dashboard.
* Sistem harus memungkinkan admin SSB menambah data peserta.
* Sistem harus memungkinkan admin SSB mengedit data peserta.
* Sistem harus memungkinkan admin SSB menghapus data peserta.
* Sistem harus menampilkan daftar peserta.
* Sistem harus menyediakan fitur pencarian peserta.
* Sistem harus menyediakan filter data peserta.
* Sistem harus menyimpan data ukuran jersey peserta.
* Sistem harus menampilkan ringkasan jumlah peserta di dashboard.
* Sistem harus memungkinkan export data peserta.

## 13. Kebutuhan Non-Fungsional

Kebutuhan Non-Fungsional
Berikut kebutuhan non-fungsional sistem:

* Interface sederhana dan mudah dipahami.
* Bisa diakses melalui laptop dan smartphone.
* Loading ringan.
* Data tiap SSB harus terpisah dan aman.
* Sistem mudah dikembangkan di masa depan.

## 14. Rekomendasi Halaman Website

Struktur halaman yang direkomendasikan:

1. Halaman Login
2. Halaman Dashboard
3. Halaman Daftar Peserta
4. Halaman Tambah/Edit Peserta
5. Halaman Detail Peserta
6. Halaman Profil SSB
7. Halaman Export / Rekap Data

## 15. Prioritas Pengembangan MVP

Untuk versi awal atau MVP, fitur yang wajib dibuat terlebih dahulu:

* Login
* Dashboard ringkasan
* CRUD peserta
* Pencarian peserta
* Filter peserta
* Data ukuran jersey
* Profil SSB

Fitur lain seperti absensi, pembayaran, dan pengumuman dapat ditambahkan pada fase berikutnya.

## 16. Kesimpulan

Website Dashboard SSB Partner Ayres Apparel merupakan solusi digital sederhana yang ditujukan sebagai benefit tambahan bagi SSB yang bekerja sama dengan Ayres Apparel. Fokus utama sistem ini adalah membantu SSB mengelola data peserta dengan lebih rapi, mudah, dan profesional.

Dengan adanya website ini, Ayres Apparel tidak hanya hadir sebagai penyedia jersey, tetapi juga sebagai partner yang memberikan solusi nyata untuk kebutuhan administrasi SSB. Hal ini dapat menjadi keunggulan kompetitif dan memperkuat posisi Ayres Apparel dalam menawarkan kerja sama ke berbagai SSB.











Saya sedang membuat sistem website dashboard untuk manajemen peserta Sekolah Sepak Bola (SSB).

Stack teknologi yang saya gunakan:
- Frontend: Next.js
- Backend: Next.js API routes
- Database: MySQL (XAMPP / phpMyAdmin)

Saya membutuhkan kode SQL untuk membuat tabel database untuk sistem berikut.

Konsep sistem:
Website ini digunakan oleh SSB yang bekerja sama dengan Ayres Apparel untuk mengelola data peserta mereka.

Role pengguna hanya ada 2:
1. Admin Ayres
   - Bertugas membuat akun Admin SSB
   - Mengatur masa aktif kerja sama SSB (tanggal mulai dan tanggal berakhir)

2. Admin SSB
   - Login ke sistem
   - Mengelola data peserta (CRUD)
   - Mengelola profil SSB
   - Menyimpan ukuran jersey pemain

Fitur utama sistem:
- Login
- Manajemen profil SSB
- Manajemen peserta
- Penyimpanan ukuran jersey pemain
- Masa aktif kerja sama SSB (start_date dan end_date)
- Data tiap SSB harus terpisah

Tolong buatkan SQL untuk membuat tabel-tabel berikut:

1. users
   - id
   - name
   - email
   - password
   - role (AYRES_ADMIN / SSB_ADMIN)

2. ssb
   - id
   - name
   - logo
   - address
   - phone
   - created_at

3. partnerships
   - id
   - ssb_id (foreign key)
   - start_date
   - end_date
   - status

4. participants
   - id
   - ssb_id (foreign key)
   - name
   - nickname
   - birth_date
   - position
   - jersey_size
   - parent_name
   - parent_phone
   - address
   - join_date
   - status
   - notes

Tambahkan juga:
- Primary key
- Foreign key
- Index yang diperlukan
- Tipe data yang sesuai untuk MySQL

Output yang saya inginkan:
- SQL lengkap menggunakan CREATE TABLE
- Relasi antar tabel sudah benar
- Siap dijalankan di phpMyAdmin (XAMPP)