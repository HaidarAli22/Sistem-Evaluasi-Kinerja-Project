/**
 * Middleware factory untuk validasi request body menggunakan Joi schema.
 * Jika validasi gagal, error diteruskan ke centralized error handler.
 * 
 * @param {import('joi').ObjectSchema} schema - Joi schema untuk validasi
 * @param {'body'|'query'|'params'} [source='body'] - Sumber data yang divalidasi
 */
function validate(schema, source = 'body') {
    return (req, res, next) => {
        const data = req[source];
        const { error, value } = schema.validate(data, {
            abortEarly: false,     // Kumpulkan semua error sekaligus
            stripUnknown: true     // Buang field yang tidak dikenal
        });

        if (error) {
            // Beri tanda sebagai validation error (400)
            error.status = 400;
            return next(error);
        }

        // Ganti dengan nilai yang sudah di-sanitize oleh Joi
        req[source] = value;
        next();
    };
}

module.exports = validate;
