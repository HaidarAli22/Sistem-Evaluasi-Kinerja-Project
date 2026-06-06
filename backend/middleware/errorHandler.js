/**
 * Centralized Express Error Handler Middleware.
 * Harus didaftarkan TERAKHIR sebelum app.listen().
 * Semua error yang di-next(err) akan masuk ke sini.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    // Tentukan HTTP status code
    const status = err.status || err.statusCode || 500;

    // Log error untuk debugging server-side
    if (status >= 500) {
        console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
    } else {
        console.warn(`[WARN] ${req.method} ${req.originalUrl} — ${err.message}`);
    }

    // Format respons konsisten
    const body = {
        success: false,
        error: err.message || 'Terjadi kesalahan pada server'
    };

    // Tambah detail validasi jika ada (dari Joi)
    if (err.details) {
        body.details = err.details.map(d => d.message);
    }

    // Jangan expose stack trace ke client di production
    if (process.env.NODE_ENV === 'development' && err.stack) {
        body.stack = err.stack;
    }

    res.status(status).json(body);
}

module.exports = errorHandler;
