const Joi = require('joi');

// ── Password Policy ─────────────────────────────────────────────────────────
// Min 8 karakter, min 1 huruf besar, min 1 angka, min 1 karakter spesial
const passwordPolicy = Joi.string()
    .min(8)
    .pattern(/[A-Z]/, 'huruf besar')
    .pattern(/[0-9]/, 'angka')
    .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'karakter spesial')
    .required()
    .messages({
        'string.min': 'Password minimal 8 karakter',
        'string.pattern.name': 'Password harus mengandung minimal satu {#name}',
        'any.required': 'Password wajib diisi'
    });

// ── Auth Schemas ─────────────────────────────────────────────────────────────
const loginSchema = Joi.object({
    username: Joi.string().email().pattern(/@sipeka\.ac\.id$/).required().messages({
        'string.email': 'email salah',
        'string.pattern.base': 'email salah',
        'any.required': 'Email wajib diisi'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password wajib diisi'
    })
});

const registerSchema = Joi.object({
    username: Joi.string().email().pattern(/@sipeka\.ac\.id$/).required().messages({
        'string.email': 'email salah',
        'string.pattern.base': 'email salah',
        'any.required': 'Email wajib diisi'
    }),
    password: passwordPolicy,
    role: Joi.string().valid('hr', 'kaprodi', 'dosen').required().messages({
        'any.only': 'Role harus salah satu dari: hr, kaprodi, dosen',
        'any.required': 'Role wajib diisi'
    }),
    id_karyawan: Joi.number().integer().positive().allow(null).optional()
});

// ── Karyawan Schema ───────────────────────────────────────────────────────────
const karyawanSchema = Joi.object({
    nama: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Nama minimal 2 karakter',
        'string.max': 'Nama maksimal 100 karakter',
        'any.required': 'Nama wajib diisi'
    }),
    jabatan: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Jabatan minimal 2 karakter',
        'string.max': 'Jabatan maksimal 100 karakter',
        'any.required': 'Jabatan wajib diisi'
    })
});

// ── KPI Schema ────────────────────────────────────────────────────────────────
const kpiSchema = Joi.object({
    nama_kpi: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Nama KPI minimal 2 karakter',
        'any.required': 'Nama KPI wajib diisi'
    }),
    deskripsi: Joi.string().max(1000).allow('', null).optional(),
    bobot: Joi.number().min(0).max(100).required().messages({
        'number.min': 'Bobot tidak boleh kurang dari 0',
        'number.max': 'Bobot tidak boleh lebih dari 100',
        'any.required': 'Bobot wajib diisi'
    })
});

// ── Penilaian Schema ──────────────────────────────────────────────────────────
const penilaianSchema = Joi.object({
    id_karyawan: Joi.number().integer().positive().required().messages({
        'any.required': 'Karyawan wajib dipilih'
    }),
    id_kpi: Joi.number().integer().positive().required().messages({
        'any.required': 'KPI wajib dipilih'
    }),
    nilai: Joi.number().min(0).max(100).required().messages({
        'number.min': 'Nilai tidak boleh kurang dari 0',
        'number.max': 'Nilai tidak boleh lebih dari 100',
        'any.required': 'Nilai wajib diisi'
    }),
    tanggal_penilaian: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            'string.pattern.base': 'Format tanggal harus YYYY-MM-DD',
            'any.required': 'Tanggal penilaian wajib diisi'
        }),
    catatan: Joi.string().max(2000).allow('', null).optional()
});

// ── Dashboard Filter Schema ───────────────────────────────────────────────────
const dashboardFilterSchema = Joi.object({
    dateFrom: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().allow(''),
    dateTo: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().allow(''),
    role: Joi.string().valid('hr', 'kaprodi', 'dosen', 'all').optional().allow('')
});

module.exports = {
    loginSchema,
    registerSchema,
    karyawanSchema,
    kpiSchema,
    penilaianSchema,
    dashboardFilterSchema
};
