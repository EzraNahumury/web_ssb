USE ayres_ssb_dashboard;

INSERT INTO ssb (id, name, logo, address, phone, partnership_notes)
VALUES
  (
    1,
    'SSB Ayres Muda',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80',
    'Jl. Stadion Utama No. 18, Jakarta Selatan',
    '081234567890',
    'Kerja sama aktif untuk pengelolaan data peserta dan kebutuhan rekap jersey musim 2026.'
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  logo = VALUES(logo),
  address = VALUES(address),
  phone = VALUES(phone),
  partnership_notes = VALUES(partnership_notes);

INSERT INTO partnerships (id, ssb_id, start_date, end_date, status)
VALUES
  (1, 1, '2026-01-01', '2027-01-01', 'ACTIVE')
ON DUPLICATE KEY UPDATE
  start_date = VALUES(start_date),
  end_date = VALUES(end_date),
  status = VALUES(status);

INSERT INTO users (id, ssb_id, name, email, password, role)
VALUES
  (
    1,
    NULL,
    'Admin Ayres',
    'admin@ayres.local',
    'scrypt$154d6b6c6a32db15a723cdbf7cada286$c0733de52423e664846e9f2ad7e6e2b4ef037a5e7a96bf8518ce466019abcded29a4a42cc493c03b7f08b9989ddc4f3ffe6ba6b1950e143116577dc161370297',
    'AYRES_ADMIN'
  ),
  (
    2,
    1,
    'Admin SSB Ayres Muda',
    'ssb@ayres.local',
    'scrypt$154d6b6c6a32db15a723cdbf7cada286$c0733de52423e664846e9f2ad7e6e2b4ef037a5e7a96bf8518ce466019abcded29a4a42cc493c03b7f08b9989ddc4f3ffe6ba6b1950e143116577dc161370297',
    'SSB_ADMIN'
  )
ON DUPLICATE KEY UPDATE
  ssb_id = VALUES(ssb_id),
  name = VALUES(name),
  email = VALUES(email),
  password = VALUES(password),
  role = VALUES(role);

INSERT INTO participants (
  id, ssb_id, name, nickname, birth_date, position, jersey_size,
  parent_name, parent_phone, address, join_date, status, notes
)
VALUES
  (
    1, 1, 'Raka Pratama', 'Raka', '2013-05-11', 'Midfielder', 'M',
    'Budi Pratama', '081322221111', 'Depok', '2025-07-03', 'ACTIVE',
    'Kapten kelompok usia U-13'
  ),
  (
    2, 1, 'Farel Ramadhan', 'Farel', '2014-09-08', 'Goalkeeper', 'L',
    'Andi Ramadhan', '081355559999', 'Jakarta Selatan', '2025-08-15', 'ACTIVE',
    'Perlu update foto profil'
  ),
  (
    3, 1, 'Dion Mahesa', 'Dion', '2012-12-19', 'Defender', 'M',
    'Rian Mahesa', '081377771212', 'Tangerang Selatan', '2024-11-20', 'INACTIVE',
    'Sedang fokus sekolah'
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  nickname = VALUES(nickname),
  birth_date = VALUES(birth_date),
  position = VALUES(position),
  jersey_size = VALUES(jersey_size),
  parent_name = VALUES(parent_name),
  parent_phone = VALUES(parent_phone),
  address = VALUES(address),
  join_date = VALUES(join_date),
  status = VALUES(status),
  notes = VALUES(notes);
