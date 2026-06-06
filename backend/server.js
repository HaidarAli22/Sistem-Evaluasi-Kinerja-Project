const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

// Middleware
const { authenticate, authorize } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Validators
const validate = require('./validators/validate');
const {
    loginSchema,
    registerSchema,
    karyawanSchema,
    kpiSchema,
    penilaianSchema,
    dashboardFilterSchema
} = require('./validators/schemas');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sipeka_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

//  Middleware Setup 
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from front end folder
app.use(express.static(path.join(__dirname, '../frontend')));

//  Database Pool 
// Menggunakan pool untuk mencegah connection drop
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistem_evaluasi_kinerja',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+07:00'
});

// Promisify pool untuk async/await
const dbQuery = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

// Test koneksi saat startup
db.getConnection((err, conn) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        console.error('Database config:', {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            database: process.env.DB_NAME || 'sistem_evaluasi_kinerja'
        });
        return;
    }
    console.log('Connected to database successfully (pool)');
    conn.release();
});

//  Helper 
function generateToken(user) {
    return jwt.sign(
        {
            id_user: user.id_user,
            username: user.username,
            role: user.role,
            id_karyawan: user.id_karyawan || null
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

// PUBLIC ROUTES 
//  Login 
app.post('/api/login', validate(loginSchema), async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const results = await dbQuery('SELECT * FROM user WHERE username = ?', [username]);

        if (results.length === 0) {
            const err = new Error('email salah');
            err.status = 401;
            return next(err);
        }

        const user = results[0];

        // Cek apakah akun aktif
        if (user.is_active === 0) {
            const err = new Error('Akun dinonaktifkan, hubungi administrator');
            err.status = 403;
            return next(err);
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            const err = new Error('password salah');
            err.status = 401;
            return next(err);
        }

        // Update last_login
        await dbQuery('UPDATE user SET last_login = NOW() WHERE id_user = ?', [user.id_user]);

        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login berhasil',
            token,
            user: {
                id_user: user.id_user,
                username: user.username,
                role: user.role,
                id_karyawan: user.id_karyawan
            }
        });
    } catch (err) {
        next(err);
    }
});

// Register 
app.post('/api/register', validate(registerSchema), async (req, res, next) => {
    try {
        const { username, password, role, id_karyawan } = req.body;

        // Cek username sudah ada
        const existing = await dbQuery('SELECT id_user FROM user WHERE username = ?', [username]);
        if (existing.length > 0) {
            const err = new Error('Username sudah terdaftar');
            err.status = 409;
            return next(err);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

        const result = await dbQuery(
            'INSERT INTO user (username, password, role, id_karyawan) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role, id_karyawan || null]
        );

        res.status(201).json({
            success: true,
            message: 'Akun berhasil dibuat',
            id_user: result.insertId
        });
    } catch (err) {
        next(err);
    }
});

// PROTECTED ROUTES 
//  Karyawan 
// GET semua karyawan — hr, kaprodi, dosen (semua boleh lihat)
app.get('/api/karyawan', authenticate, async (req, res, next) => {
    try {
        const results = await dbQuery('SELECT * FROM karyawan ORDER BY nama');
        res.json({ success: true, data: results });
    } catch (err) {
        next(err);
    }
});

// GET karyawan by ID
app.get('/api/karyawan/:id', authenticate, async (req, res, next) => {
    try {
        const results = await dbQuery('SELECT * FROM karyawan WHERE id_karyawan = ?', [req.params.id]);
        if (results.length === 0) {
            const err = new Error('Karyawan tidak ditemukan');
            err.status = 404;
            return next(err);
        }
        res.json({ success: true, data: results[0] });
    } catch (err) {
        next(err);
    }
});

// POST buat karyawan — hanya hr
app.post('/api/karyawan', authenticate, authorize('hr'), validate(karyawanSchema), async (req, res, next) => {
    try {
        const { nama, jabatan } = req.body;
        const result = await dbQuery(
            'INSERT INTO karyawan (nama, jabatan) VALUES (?, ?)',
            [nama, jabatan]
        );
        res.status(201).json({
            success: true,
            message: 'Karyawan berhasil ditambahkan',
            id_karyawan: result.insertId
        });
    } catch (err) {
        next(err);
    }
});

// PUT update karyawan — hanya hr
app.put('/api/karyawan/:id', authenticate, authorize('hr'), validate(karyawanSchema), async (req, res, next) => {
    try {
        const { nama, jabatan } = req.body;
        const result = await dbQuery(
            'UPDATE karyawan SET nama = ?, jabatan = ? WHERE id_karyawan = ?',
            [nama, jabatan, req.params.id]
        );
        if (result.affectedRows === 0) {
            const err = new Error('Karyawan tidak ditemukan');
            err.status = 404;
            return next(err);
        }
        res.json({ success: true, message: 'Karyawan berhasil diperbarui' });
    } catch (err) {
        next(err);
    }
});

// DELETE karyawan — hanya hr
app.delete('/api/karyawan/:id', authenticate, authorize('hr'), async (req, res, next) => {
    try {
        const idKaryawan = req.params.id;

        // Karena penilaian.id_karyawan punya foreign key ke karyawan, hapus penilaian dulu
        // agar penghapusan karyawan tidak gagal (FK constraint fails).
        await dbQuery('DELETE FROM penilaian WHERE id_karyawan = ?', [idKaryawan]);

        const result = await dbQuery(
            'DELETE FROM karyawan WHERE id_karyawan = ?',
            [idKaryawan]
        );

        if (result.affectedRows === 0) {
            const err = new Error('Karyawan tidak ditemukan');
            err.status = 404;
            return next(err);
        }

        res.json({ success: true, message: 'Karyawan berhasil dihapus' });
    } catch (err) {
        next(err);
    }
});

//  KPI 

// GET semua KPI — semua role boleh
app.get('/api/kpi', authenticate, async (req, res, next) => {
    try {
        const results = await dbQuery('SELECT * FROM kpi ORDER BY nama_kpi');
        res.json({ success: true, data: results });
    } catch (err) {
        next(err);
    }
});

// GET KPI by ID
app.get('/api/kpi/:id', authenticate, async (req, res, next) => {
    try {
        const results = await dbQuery('SELECT * FROM kpi WHERE id_kpi = ?', [req.params.id]);
        if (results.length === 0) {
            const err = new Error('KPI tidak ditemukan');
            err.status = 404;
            return next(err);
        }
        res.json({ success: true, data: results[0] });
    } catch (err) {
        next(err);
    }
});

// POST buat KPI — hanya hr
app.post('/api/kpi', authenticate, authorize('hr'), validate(kpiSchema), async (req, res, next) => {
    try {
        const { nama_kpi, deskripsi, bobot } = req.body;
        const result = await dbQuery(
            'INSERT INTO kpi (nama_kpi, deskripsi, bobot) VALUES (?, ?, ?)',
            [nama_kpi, deskripsi || null, bobot]
        );
        res.status(201).json({
            success: true,
            message: 'KPI berhasil ditambahkan',
            id_kpi: result.insertId
        });
    } catch (err) {
        next(err);
    }
});

// PUT update KPI — hanya hr
app.put('/api/kpi/:id', authenticate, authorize('hr'), validate(kpiSchema), async (req, res, next) => {
    try {
        const { nama_kpi, deskripsi, bobot } = req.body;
        const result = await dbQuery(
            'UPDATE kpi SET nama_kpi = ?, deskripsi = ?, bobot = ? WHERE id_kpi = ?',
            [nama_kpi, deskripsi || null, bobot, req.params.id]
        );
        if (result.affectedRows === 0) {
            const err = new Error('KPI tidak ditemukan');
            err.status = 404;
            return next(err);
        }
        res.json({ success: true, message: 'KPI berhasil diperbarui' });
    } catch (err) {
        next(err);
    }
});

// DELETE KPI — hanya hr
app.delete('/api/kpi/:id', authenticate, authorize('hr'), async (req, res, next) => {
    try {
        const result = await dbQuery('DELETE FROM kpi WHERE id_kpi = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            const err = new Error('KPI tidak ditemukan');
            err.status = 404;
            return next(err);
        }
        res.json({ success: true, message: 'KPI berhasil dihapus' });
    } catch (err) {
        next(err);
    }
});

//  Penilaian 

// GET penilaian — filter by role server-side
app.get('/api/penilaian', authenticate, async (req, res, next) => {
    try {
        const { role, id_karyawan: userKaryawanId } = req.user;

        let sql, params;

        if (role === 'dosen') {
            // Dosen hanya lihat penilaian miliknya sendiri
            if (!userKaryawanId) {
                return res.json({ success: true, data: [] });
            }
            sql = `SELECT p.*, k.nama AS nama_karyawan, kpi.nama_kpi
                   FROM penilaian p
                   LEFT JOIN karyawan k ON p.id_karyawan = k.id_karyawan
                   LEFT JOIN kpi ON p.id_kpi = kpi.id_kpi
                   WHERE p.id_karyawan = ?
                   ORDER BY p.tanggal_penilaian DESC`;
            params = [userKaryawanId];
        } else {
            // hr & kaprodi: lihat semua, bisa filter by id_karyawan query param
            const filterKaryawan = req.query.id_karyawan;
            if (filterKaryawan) {
                sql = `SELECT p.*, k.nama AS nama_karyawan, kpi.nama_kpi
                       FROM penilaian p
                       LEFT JOIN karyawan k ON p.id_karyawan = k.id_karyawan
                       LEFT JOIN kpi ON p.id_kpi = kpi.id_kpi
                       WHERE p.id_karyawan = ?
                       ORDER BY p.tanggal_penilaian DESC`;
                params = [filterKaryawan];
            } else {
                sql = `SELECT p.*, k.nama AS nama_karyawan, kpi.nama_kpi
                       FROM penilaian p
                       LEFT JOIN karyawan k ON p.id_karyawan = k.id_karyawan
                       LEFT JOIN kpi ON p.id_kpi = kpi.id_kpi
                       ORDER BY p.tanggal_penilaian DESC`;
                params = [];
            }
        }

        const results = await dbQuery(sql, params);
        res.json({ success: true, data: results });
    } catch (err) {
        next(err);
    }
});

// GET penilaian by ID
app.get('/api/penilaian/:id', authenticate, async (req, res, next) => {
    try {
        const results = await dbQuery(
            `SELECT p.*, k.nama AS nama_karyawan, kpi.nama_kpi
             FROM penilaian p
             LEFT JOIN karyawan k ON p.id_karyawan = k.id_karyawan
             LEFT JOIN kpi ON p.id_kpi = kpi.id_kpi
             WHERE p.id_penilaian = ?`,
            [req.params.id]
        );
        if (results.length === 0) {
            const err = new Error('Penilaian tidak ditemukan');
            err.status = 404;
            return next(err);
        }

        // Dosen hanya bisa lihat penilaian miliknya
        const p = results[0];
        if (req.user.role === 'dosen' && p.id_karyawan !== req.user.id_karyawan) {
            const err = new Error('Akses ditolak');
            err.status = 403;
            return next(err);
        }

        res.json({ success: true, data: p });
    } catch (err) {
        next(err);
    }
});

// POST buat penilaian — hanya hr
app.post('/api/penilaian', authenticate, authorize('hr'), validate(penilaianSchema), async (req, res, next) => {
    try {
        const { id_karyawan, id_kpi, nilai, tanggal_penilaian, catatan } = req.body;
        const result = await dbQuery(
            'INSERT INTO penilaian (id_karyawan, id_kpi, nilai, tanggal_penilaian, catatan) VALUES (?, ?, ?, ?, ?)',
            [id_karyawan, id_kpi, nilai, tanggal_penilaian, catatan || null]
        );
        res.status(201).json({
            success: true,
            message: 'Penilaian berhasil ditambahkan',
            id_penilaian: result.insertId
        });
    } catch (err) {
        next(err);
    }
});

// PUT update penilaian — hanya hr
app.put('/api/penilaian/:id', authenticate, authorize('hr'), validate(penilaianSchema), async (req, res, next) => {
    try {
        const { id_karyawan, id_kpi, nilai, tanggal_penilaian, catatan } = req.body;
        const result = await dbQuery(
            'UPDATE penilaian SET id_karyawan = ?, id_kpi = ?, nilai = ?, tanggal_penilaian = ?, catatan = ? WHERE id_penilaian = ?',
            [id_karyawan, id_kpi, nilai, tanggal_penilaian, catatan || null, req.params.id]
        );
        if (result.affectedRows === 0) {
            const err = new Error('Penilaian tidak ditemukan');
            err.status = 404;
            return next(err);
        }
        res.json({ success: true, message: 'Penilaian berhasil diperbarui' });
    } catch (err) {
        next(err);
    }
});

// DELETE penilaian — hanya hr
app.delete('/api/penilaian/:id', authenticate, authorize('hr'), async (req, res, next) => {
    try {
        const result = await dbQuery('DELETE FROM penilaian WHERE id_penilaian = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            const err = new Error('Penilaian tidak ditemukan');
            err.status = 404;
            return next(err);
        }
        res.json({ success: true, message: 'Penilaian berhasil dihapus' });
    } catch (err) {
        next(err);
    }
});

// POST seed penilaian — hr
// Membuat baris penilaian untuk setiap kombinasi (karyawan x KPI) per bulan.
// Requirement:
// - untuk setiap karyawan dan setiap KPI harus ada baris penilaian per bulan 01/2026 - 12/2026
// - catatan diisi '-' untuk semua baris pada rentang tanggal 2026-01-01 s/d 2026-12-31
app.post('/api/penilaian/seed', authenticate, authorize('hr'), async (req, res, next) => {
    try {
        // 1) Insert missing rows (karyawan x KPI x bulan 2026), tanggal_penilaian = tanggal 15
        const insertResult = await dbQuery(
            `INSERT INTO penilaian (id_karyawan, id_kpi, nilai, tanggal_penilaian, catatan)
             SELECT
                k.id_karyawan,
                kp.id_kpi,
                -- nilai dummy agar semua dashboard komputasi punya data
                ROUND(40 + RAND() * 50, 2) AS nilai,
                d.tanggal_penilaian,
                '-' AS catatan
             FROM karyawan k
             CROSS JOIN kpi kp
             CROSS JOIN (
                SELECT DATE(CONCAT('2026-', mth, '-15')) AS tanggal_penilaian
                FROM (
                    SELECT '01' AS mth UNION ALL SELECT '02' UNION ALL SELECT '03' UNION ALL SELECT '04' UNION ALL
                    SELECT '05' UNION ALL SELECT '06' UNION ALL SELECT '07' UNION ALL SELECT '08' UNION ALL
                    SELECT '09' UNION ALL SELECT '10' UNION ALL SELECT '11' UNION ALL SELECT '12'
                ) x
             ) d
             WHERE NOT EXISTS (
                SELECT 1 FROM penilaian p
                WHERE p.id_karyawan = k.id_karyawan
                  AND p.id_kpi = kp.id_kpi
                  AND p.tanggal_penilaian = d.tanggal_penilaian
             )`,
            []
        );

        // 2) Force catatan '-' untuk SEMUA baris yang berada di rentang 2026
        const updateCatatanResult = await dbQuery(
            `UPDATE penilaian p
             SET p.catatan = '-'
             WHERE p.tanggal_penilaian >= '2026-01-01'
               AND p.tanggal_penilaian <= '2026-12-31'`,
            []
        );

        res.json({
            success: true,
            message: 'Penilaian berhasil di-seed untuk 01/2026-12/2026 dan catatan dipaksa "-"',
            affectedRows: (insertResult.affectedRows || 0) + (updateCatatanResult.affectedRows || 0)
        });
    } catch (err) {
        next(err);
    }
});


// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD API — semua role terautentikasi
// ═════════════════════════════════════════════════════════════════════════════

// Helper: build date WHERE clause
function buildDateFilter(dateFrom, dateTo, tableAlias) {
    const conditions = [];
    const params = [];
    const col = tableAlias ? `${tableAlias}.tanggal_penilaian` : 'tanggal_penilaian';
    if (dateFrom) {
        conditions.push(`${col} >= ?`);
        params.push(dateFrom);
    }
    if (dateTo) {
        conditions.push(`${col} <= ?`);
        params.push(dateTo);
    }
    return { conditions, params };
}

// GET /api/dashboard/stats — total counts + rata-rata nilai
app.get('/api/dashboard/stats', authenticate, validate(dashboardFilterSchema, 'query'), async (req, res, next) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const { conditions, params } = buildDateFilter(dateFrom, dateTo);
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const [karyawanCount, kpiCount, penilaianStats] = await Promise.all([
            dbQuery('SELECT COUNT(*) AS total FROM karyawan'),
            dbQuery('SELECT COUNT(*) AS total FROM kpi'),
            dbQuery(
                `SELECT COUNT(*) AS total, AVG(nilai) AS rata_rata, MAX(nilai) AS nilai_tertinggi, MIN(nilai) AS nilai_terendah
                 FROM penilaian ${whereClause}`,
                params
            )
        ]);

        res.json({
            success: true,
            data: {
                totalKaryawan: karyawanCount[0].total,
                totalKPI: kpiCount[0].total,
                totalPenilaian: penilaianStats[0].total,
                rataRataNilai: penilaianStats[0].rata_rata
                    ? parseFloat(penilaianStats[0].rata_rata).toFixed(2)
                    : 0,
                nilaiTertinggi: penilaianStats[0].nilai_tertinggi || 0,
                nilaiTerendah: penilaianStats[0].nilai_terendah || 0
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/dashboard/kpi-scores — rata-rata nilai per KPI (Bar Chart)
app.get('/api/dashboard/kpi-scores', authenticate, validate(dashboardFilterSchema, 'query'), async (req, res, next) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const { conditions, params } = buildDateFilter(dateFrom, dateTo);
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const results = await dbQuery(
            `SELECT kpi.nama_kpi, AVG(p.nilai) AS rata_rata, COUNT(p.id_penilaian) AS jumlah
             FROM penilaian p
             INNER JOIN kpi ON p.id_kpi = kpi.id_kpi
             ${whereClause}
             GROUP BY p.id_kpi, kpi.nama_kpi
             ORDER BY rata_rata DESC`,
            params
        );

        res.json({
            success: true,
            data: results.map(r => ({
                nama_kpi: r.nama_kpi,
                rata_rata: parseFloat(r.rata_rata).toFixed(2),
                jumlah: r.jumlah
            }))
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/dashboard/monthly-trend — jumlah penilaian per bulan (Line Chart)
app.get('/api/dashboard/monthly-trend', authenticate, validate(dashboardFilterSchema, 'query'), async (req, res, next) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const { conditions, params } = buildDateFilter(dateFrom, dateTo);
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const results = await dbQuery(
            `SELECT DATE_FORMAT(tanggal_penilaian, '%Y-%m') AS bulan,
                    COUNT(*) AS jumlah,
                    AVG(nilai) AS rata_rata
             FROM penilaian
             ${whereClause}
             GROUP BY bulan
             ORDER BY bulan ASC`,
            params
        );

        res.json({
            success: true,
            data: results.map(r => ({
                bulan: r.bulan,
                jumlah: r.jumlah,
                rata_rata: parseFloat(r.rata_rata).toFixed(2)
            }))
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/dashboard/score-distribution — distribusi nilai (Doughnut Chart)
app.get('/api/dashboard/score-distribution', authenticate, validate(dashboardFilterSchema, 'query'), async (req, res, next) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const { conditions, params } = buildDateFilter(dateFrom, dateTo);
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const results = await dbQuery(
            `SELECT
               SUM(CASE WHEN nilai >= 85 THEN 1 ELSE 0 END) AS sangat_baik,
               SUM(CASE WHEN nilai >= 70 AND nilai < 85 THEN 1 ELSE 0 END) AS baik,
               SUM(CASE WHEN nilai >= 55 AND nilai < 70 THEN 1 ELSE 0 END) AS cukup,
               SUM(CASE WHEN nilai >= 40 AND nilai < 55 THEN 1 ELSE 0 END) AS kurang,
               SUM(CASE WHEN nilai < 40 THEN 1 ELSE 0 END) AS sangat_kurang
             FROM penilaian
             ${whereClause}`,
            params
        );

        const d = results[0];
        res.json({
            success: true,
            data: {
                labels: ['Sangat Baik (≥85)', 'Baik (70-84)', 'Cukup (55-69)', 'Kurang (40-54)', 'Sangat Kurang (<40)'],
                values: [
                    d.sangat_baik || 0,
                    d.baik || 0,
                    d.cukup || 0,
                    d.kurang || 0,
                    d.sangat_kurang || 0
                ]
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/dashboard/karyawan-scores — rata-rata nilai per karyawan (Trend Chart)
app.get('/api/dashboard/karyawan-scores', authenticate, validate(dashboardFilterSchema, 'query'), async (req, res, next) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const { conditions, params } = buildDateFilter(dateFrom, dateTo);
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const results = await dbQuery(
            `SELECT k.id_karyawan, 
                    k.nama, 
                    AVG(p.nilai) AS rata_rata,
                    COUNT(p.nilai) AS jumlah_penilaian
             FROM karyawan k
             LEFT JOIN penilaian p ON k.id_karyawan = p.id_karyawan ${whereClause}
             GROUP BY k.id_karyawan, k.nama
             ORDER BY k.id_karyawan ASC`,
            params
        );

        res.json({
            success: true,
            data: results.map(r => ({
                id_karyawan: r.id_karyawan,
                nama: r.nama,
                rata_rata: r.rata_rata ? parseFloat(r.rata_rata).toFixed(2) : '0.00',
                jumlah_penilaian: r.jumlah_penilaian || 0
            }))
        });
    } catch (err) {
        next(err);
    }
});

// ═════════════════════════════════════════════════════════════════════════════
// AUDIT DASHBOARD: Skor Komposit, Tren Peningkatan, Area Perbaikan
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/dashboard/composite-scores
// Menghasilkan skor komposit per karyawan menggunakan weighted average berdasarkan kpi.bobot
// composite = SUM(nilai * bobot) / SUM(bobot)
app.get('/api/dashboard/composite-scores', authenticate, validate(dashboardFilterSchema, 'query'), async (req, res, next) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const { conditions, params } = buildDateFilter(dateFrom, dateTo, 'p');
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const role = req.user.role;
        const userKaryawanId = req.user.id_karyawan;

        // Untuk dosen: hanya data miliknya (jika tidak punya id_karyawan -> kosong)
        if (role === 'dosen') {
            if (!userKaryawanId) return res.json({ success: true, data: [] });

            const results = await dbQuery(
                `SELECT k.id_karyawan,
                        k.nama,
                        SUM(p.nilai * kp.bobot) / NULLIF(SUM(kp.bobot), 0) AS skor_komposit,
                        COUNT(p.id_penilaian) AS jumlah_penilaian
                 FROM penilaian p
                 INNER JOIN karyawan k ON k.id_karyawan = p.id_karyawan
                 INNER JOIN kpi kp ON kp.id_kpi = p.id_kpi
                 ${whereClause}
                 AND p.id_karyawan = ?
                 GROUP BY k.id_karyawan, k.nama`,
                [...params, userKaryawanId]
            );

            return res.json({
                success: true,
                data: results.map(r => ({
                    id_karyawan: r.id_karyawan,
                    nama: r.nama,
                    skor_komposit: r.skor_komposit !== null ? parseFloat(r.skor_komposit).toFixed(2) : '0.00',
                    jumlah_penilaian: r.jumlah_penilaian || 0
                }))
            });
        }

        // Untuk hr/kaprodi: semua karyawan
        const results = await dbQuery(
            `SELECT k.id_karyawan,
                    k.nama,
                    SUM(p.nilai * kp.bobot) / NULLIF(SUM(kp.bobot), 0) AS skor_komposit,
                    COUNT(p.id_penilaian) AS jumlah_penilaian
             FROM penilaian p
             INNER JOIN karyawan k ON k.id_karyawan = p.id_karyawan
             INNER JOIN kpi kp ON kp.id_kpi = p.id_kpi
             ${whereClause}
             GROUP BY k.id_karyawan, k.nama
             ORDER BY skor_komposit ASC`,
            params
        );

        res.json({
            success: true,
            data: results.map(r => ({
                id_karyawan: r.id_karyawan,
                nama: r.nama,
                skor_komposit: r.skor_komposit !== null ? parseFloat(r.skor_komposit).toFixed(2) : '0.00',
                jumlah_penilaian: r.jumlah_penilaian || 0
            }))
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/dashboard/composite-improvement-trend
// Tren: avg skor komposit per bulan (weighted per karyawan, lalu dirata-rata)
app.get('/api/dashboard/composite-improvement-trend', authenticate, validate(dashboardFilterSchema, 'query'), async (req, res, next) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const { conditions, params } = buildDateFilter(dateFrom, dateTo, 'p');
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const role = req.user.role;
        const userKaryawanId = req.user.id_karyawan;

        const roleWhere = (role === 'dosen' && userKaryawanId) ? 'AND p.id_karyawan = ?' : '';
        const roleParams = (role === 'dosen' && userKaryawanId) ? [userKaryawanId] : [];

        if (role === 'dosen' && !userKaryawanId) {
            return res.json({ success: true, data: { labels: [], values: [], deltaOverall: 0 } });
        }

        // Komputasi:
        // 1) composite per karyawan per bulan
        // 2) avg composite per bulan
        const results = await dbQuery(
            `SELECT bulan,
                    AVG(skor_komposit) AS avg_skor_komposit
             FROM (
                 SELECT DATE_FORMAT(p.tanggal_penilaian, '%Y-%m') AS bulan,
                        p.id_karyawan,
                        SUM(p.nilai * kp.bobot) / NULLIF(SUM(kp.bobot), 0) AS skor_komposit
                 FROM penilaian p
                 INNER JOIN kpi kp ON kp.id_kpi = p.id_kpi
                 ${whereClause}
                 ${roleWhere}
                 GROUP BY bulan, p.id_karyawan
             ) t
             GROUP BY bulan
             ORDER BY bulan ASC`,
            [...params, ...roleParams]
        );

        const labels = results.map(r => r.bulan);
        const values = results.map(r => r.avg_skor_komposit !== null ? parseFloat(r.avg_skor_komposit).toFixed(2) : '0.00');

        let deltaOverall = 0;
        if (values.length >= 2) {
            const first = parseFloat(values[0]);
            const last = parseFloat(values[values.length - 1]);
            deltaOverall = last - first;
        }

        res.json({
            success: true,
            data: {
                labels,
                values,
                deltaOverall: parseFloat(deltaOverall.toFixed(2))
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/dashboard/areas-of-improvement
// Area perbaikan: KPI terendah + (opsional) Karyawan skor komposit terendah
app.get('/api/dashboard/areas-of-improvement', authenticate, validate(dashboardFilterSchema, 'query'), async (req, res, next) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const { conditions, params } = buildDateFilter(dateFrom, dateTo, 'p');
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const role = req.user.role;
        const userKaryawanId = req.user.id_karyawan;

        const roleWhere = (role === 'dosen' && userKaryawanId) ? 'AND p.id_karyawan = ?' : '';
        const roleParams = (role === 'dosen' && userKaryawanId) ? [userKaryawanId] : [];

        if (role === 'dosen' && !userKaryawanId) {
            return res.json({
                success: true,
                data: { kpis: [], karyawans: [] }
            });
        }

        // KPI terendah (by rata-rata nilai KPI)
        const kpis = await dbQuery(
            `SELECT kp.id_kpi,
                    kp.nama_kpi,
                    AVG(p.nilai) AS rata_rata,
                    COUNT(p.id_penilaian) AS jumlah_penilaian
             FROM penilaian p
             INNER JOIN kpi kp ON kp.id_kpi = p.id_kpi
             ${whereClause}
             ${roleWhere}
             GROUP BY kp.id_kpi, kp.nama_kpi
             ORDER BY rata_rata ASC
             LIMIT 5`,
            [...params, ...roleParams]
        );

        // Karyawan skor komposit terendah (top 5)
        const karyawans = await dbQuery(
            `SELECT k.id_karyawan,
                    k.nama,
                    SUM(p.nilai * kp.bobot) / NULLIF(SUM(kp.bobot), 0) AS skor_komposit,
                    COUNT(p.id_penilaian) AS jumlah_penilaian
             FROM penilaian p
             INNER JOIN kpi kp ON kp.id_kpi = p.id_kpi
             INNER JOIN karyawan k ON k.id_karyawan = p.id_karyawan
             ${whereClause}
             ${roleWhere}
             GROUP BY k.id_karyawan, k.nama
             ORDER BY skor_komposit ASC
             LIMIT 5`,
            [...params, ...roleParams]
        );

        res.json({
            success: true,
            data: {
                kpis: kpis.map(r => ({
                    id_kpi: r.id_kpi,
                    nama_kpi: r.nama_kpi,
                    rata_rata: r.rata_rata !== null ? parseFloat(r.rata_rata).toFixed(2) : '0.00',
                    jumlah_penilaian: r.jumlah_penilaian || 0
                })),
                karyawans: karyawans.map(r => ({
                    id_karyawan: r.id_karyawan,
                    nama: r.nama,
                    skor_komposit: r.skor_komposit !== null ? parseFloat(r.skor_komposit).toFixed(2) : '0.00',
                    jumlah_penilaian: r.jumlah_penilaian || 0
                }))
            }
        });
    } catch (err) {
        next(err);
    }
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        const err = new Error(`Endpoint '${req.method} ${req.originalUrl}' tidak ditemukan`);
        err.status = 404;
        return next(err);
    }
    // Non-API: fallback ke SPA index.html
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Centralized Error Handler (harus TERAKHIR) ────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   JWT Expires : ${JWT_EXPIRES_IN}`);
});