-- Database: sistem_evaluasi_kinerja
-- Version: 1.0

-- Create database
CREATE DATABASE IF NOT EXISTS sistem_evaluasi_kinerja;
USE sistem_evaluasi_kinerja;

-- Table structure for karyawan (Employees)
CREATE TABLE IF NOT EXISTS karyawan (
  id_karyawan INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  jabatan VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for kpi (Key Performance Indicators)
CREATE TABLE IF NOT EXISTS kpi (
  id_kpi INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nama_kpi VARCHAR(100) NOT NULL,
  deskripsi TEXT NULL DEFAULT NULL,
  bobot DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for penilaian (Assessment/Performance Review)
CREATE TABLE IF NOT EXISTS penilaian (
  id_penilaian INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_karyawan INT(11) NOT NULL,
  id_kpi INT(11) NOT NULL,
  nilai DECIMAL(5,2) NULL DEFAULT NULL,
  tanggal_penilaian DATE NOT NULL,
  catatan TEXT NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_karyawan) REFERENCES karyawan(id_karyawan) ON DELETE CASCADE,
  FOREIGN KEY (id_kpi) REFERENCES kpi(id_kpi) ON DELETE CASCADE,
  KEY idx_karyawan (id_karyawan),
  KEY idx_kpi (id_kpi),
  KEY idx_tanggal (tanggal_penilaian)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for user (User Accounts)
CREATE TABLE IF NOT EXISTS user (
  id_user INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('hr','kaprodi','dosen') NOT NULL,
  id_karyawan INT(11) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_karyawan) REFERENCES karyawan(id_karyawan) ON DELETE SET NULL,
  KEY idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for testing
INSERT INTO karyawan (nama, jabatan) VALUES
('Ahmad Santoso', 'Dosen'),
('Siti Nurhaliza', 'Dosen'),
('Budi Hakim', 'Karyawan');

INSERT INTO kpi (nama_kpi, deskripsi, bobot) VALUES
('Kedisiplinan', 'Kehadiran dan ketepatan waktu', 20.00),
('Produktivitas', 'Hasil kerja yang dicapai', 30.00),
('Kualitas Kerja', 'Standar kualitas pekerjaan', 25.00),
('Komunikasi', 'Kemampuan berkomunikasi', 15.00),
('Kerjasama Tim', 'Kolaborasi dengan rekan kerja', 10.00);

-- Test users - Uncomment and update with valid bcrypt hashes before using
-- To generate valid hashes, use the register endpoint at /api/register
-- Example valid bcrypt hash for "test123": $2b$10$Ox1g7yb95MZrjgUmHG/gWu7uAKGnMGN/oYhc5GOe2SgXDgR8R0Fmy
-- INSERT INTO user (username, password, role, id_karyawan) VALUES
-- ('kaprodi', '$2b$10$Ox1g7yb95MZrjgUmHG/gWu7uAKGnMGN/oYhc5GOe2SgXDgR8R0Fmy', 'kaprodi', 1),
-- ('dosen', '$2b$10$Ox1g7yb95MZrjgUmHG/gWu7uAKGnMGN/oYhc5GOe2SgXDgR8R0Fmy', 'dosen', 2),
-- ('hr', '$2b$10$Ox1g7yb95MZrjgUmHG/gWu7uAKGnMGN/oYhc5GOe2SgXDgR8R0Fmy', 'hr', NULL);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_penilaian_karyawan_date ON penilaian(id_karyawan, tanggal_penilaian);
CREATE INDEX IF NOT EXISTS idx_penilaian_kpi_date ON penilaian(id_kpi, tanggal_penilaian);
