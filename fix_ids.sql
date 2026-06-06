-- Script untuk memperbaiki ID yang berantakan di database
-- Backup data terlebih dahulu sebelum menjalankan script ini

USE sistem_evaluasi_kinerja;

-- ============================================================
-- 1. RESET ID KARYAWAN agar berurut
-- ============================================================

-- Buat tabel temporary untuk backup data karyawan
CREATE TEMPORARY TABLE karyawan_backup AS SELECT * FROM karyawan;

-- Hapus semua foreign key yang mereferensi karyawan
DELETE FROM penilaian;
DELETE FROM user WHERE id_karyawan IS NOT NULL;

-- Reset AUTO_INCREMENT dan hapus semua data
TRUNCATE TABLE karyawan;
ALTER TABLE karyawan AUTO_INCREMENT = 1;

-- Re-insert data dengan ID yang urut
INSERT INTO karyawan (nama, jabatan, created_at) 
SELECT nama, jabatan, created_at FROM karyawan_backup ORDER BY created_at ASC;

-- ============================================================
-- 2. RESET ID KPI agar berurut
-- ============================================================

-- Buat tabel temporary untuk backup data KPI
CREATE TEMPORARY TABLE kpi_backup AS SELECT * FROM kpi;

-- Hapus semua data penilaian yang mereferensi KPI
DELETE FROM penilaian;

-- Reset AUTO_INCREMENT dan hapus semua KPI
TRUNCATE TABLE kpi;
ALTER TABLE kpi AUTO_INCREMENT = 1;

-- Re-insert data dengan ID yang urut
INSERT INTO kpi (nama_kpi, deskripsi, bobot, created_at) 
SELECT nama_kpi, deskripsi, bobot, created_at FROM kpi_backup ORDER BY created_at ASC;

-- ============================================================
-- 3. RESET ID PENILAIAN agar berurut
-- ============================================================

-- Buat tabel temporary untuk backup data penilaian
CREATE TEMPORARY TABLE penilaian_backup AS SELECT * FROM penilaian;

-- Reset AUTO_INCREMENT dan hapus semua penilaian
TRUNCATE TABLE penilaian;
ALTER TABLE penilaian AUTO_INCREMENT = 1;

-- Re-insert data dengan ID yang urut
INSERT INTO penilaian (id_karyawan, id_kpi, nilai, tanggal_penilaian, catatan, created_at) 
SELECT id_karyawan, id_kpi, nilai, tanggal_penilaian, catatan, created_at 
FROM penilaian_backup 
ORDER BY created_at ASC;

-- ============================================================
-- 4. RESET ID USER agar berurut (opsional)
-- ============================================================

-- Buat tabel temporary untuk backup data user
CREATE TEMPORARY TABLE user_backup AS SELECT * FROM user;

-- Reset AUTO_INCREMENT dan hapus semua user
TRUNCATE TABLE user;
ALTER TABLE user AUTO_INCREMENT = 1;

-- Re-insert data dengan ID yang urut (password tetap)
INSERT INTO user (username, password, role, id_karyawan, is_active, last_login, created_at) 
SELECT username, password, role, id_karyawan, is_active, last_login, created_at 
FROM user_backup 
ORDER BY created_at ASC;

-- Verify the results
SELECT 'Karyawan' as table_name, COUNT(*) as count FROM karyawan
UNION ALL
SELECT 'KPI', COUNT(*) FROM kpi
UNION ALL
SELECT 'Penilaian', COUNT(*) FROM penilaian
UNION ALL
SELECT 'User', COUNT(*) FROM user;

-- Show first few records
SELECT '=== KARYAWAN ===' as info;
SELECT * FROM karyawan LIMIT 5;

SELECT '=== KPI ===' as info;
SELECT * FROM kpi LIMIT 5;

SELECT '=== PENILAIAN ===' as info;
SELECT * FROM penilaian LIMIT 5;
