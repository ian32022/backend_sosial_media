const pool = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nama, email, role, bio, foto_url, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan', data: null });
    }

    return res.status(200).json({ success: true, message: 'Profil berhasil diambil', data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nama, bio, foto_url } = req.body;

    await pool.query(
      'UPDATE users SET nama = COALESCE($1, nama), bio = COALESCE($2, bio), foto_url = COALESCE($3, foto_url) WHERE id = $4',
      [nama, bio, foto_url, req.user.id]
    );

    const { rows } = await pool.query(
      'SELECT id, nama, email, role, bio, foto_url, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );

    return res.status(200).json({ success: true, message: 'Profil berhasil diperbarui', data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

module.exports = { getProfile, updateProfile };
