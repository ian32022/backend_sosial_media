const pool = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: countResult } = await pool.query('SELECT COUNT(*)::int AS total FROM users');
    const total = countResult[0].total;

    const { rows } = await pool.query(
      'SELECT id, nama, email, role, bio, foto_url, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      message: 'Daftar user berhasil diambil',
      data: rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      'SELECT id, nama, email, role, bio, foto_url, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan', data: null });
    }

    return res.status(200).json({ success: true, message: 'Detail user berhasil diambil', data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'moderator', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role harus admin, moderator, atau user', data: null });
    }

    const { rows: users } = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan', data: null });
    }

    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);

    const { rows } = await pool.query(
      'SELECT id, nama, email, role, bio, foto_url, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    return res.status(200).json({ success: true, message: 'Role user berhasil diperbarui', data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun sendiri', data: null });
    }

    const { rows: users } = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan', data: null });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    return res.status(200).json({ success: true, message: 'User berhasil dihapus', data: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };
