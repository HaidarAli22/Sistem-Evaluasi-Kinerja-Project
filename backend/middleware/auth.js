const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sipeka_secret_change_in_production';

/**
 * Middleware: Verifikasi JWT Bearer token.
 * Meng-inject req.user jika token valid.
 */
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const err = new Error('Token autentikasi tidak ditemukan');
        err.status = 401;
        return next(err);
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (jwtErr) {
        const err = new Error(
            jwtErr.name === 'TokenExpiredError'
                ? 'Token sudah kadaluarsa, silahkan login ulang'
                : 'Token tidak valid'
        );
        err.status = 401;
        next(err);
    }
}

/**
 * Middleware factory: RBAC — hanya izinkan role tertentu.
 * @param  {...string} roles  Role yang diizinkan (e.g. 'hr', 'kaprodi')
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            const err = new Error('Tidak terautentikasi');
            err.status = 401;
            return next(err);
        }
        if (!roles.includes(req.user.role)) {
            const err = new Error(
                `Akses ditolak. Role '${req.user.role}' tidak memiliki izin untuk aksi ini.`
            );
            err.status = 403;
            return next(err);
        }
        next();
    };
}

module.exports = { authenticate, authorize };
