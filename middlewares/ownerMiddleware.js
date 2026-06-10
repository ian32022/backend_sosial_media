const pool = require('../config/database');

const ownerMiddleware = (model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      const { rows } = await pool.query(`SELECT * FROM ${model} WHERE id = $1`, [resourceId]);

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Data tidak ditemukan', data: null });
      }

      const resource = rows[0];

      if (req.user.role === 'admin' || req.user.role === 'moderator') {
        req.resource = resource;
        return next();
      }

      if (resource.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Anda bukan pemilik data ini.', data: null });
      }

      req.resource = resource;
      next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
    }
  };
};

module.exports = ownerMiddleware;
