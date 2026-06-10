const pool = require('../config/database');

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { konten } = req.body;

    const { rows: posts } = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan', data: null });
    }

    const result = await pool.query(
      'INSERT INTO comments (user_id, post_id, konten) VALUES ($1, $2, $3) RETURNING id',
      [req.user.id, id, konten]
    );

    const { rows } = await pool.query(
      `SELECT c.*, u.nama AS user_name, u.foto_url AS user_foto
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );

    return res.status(201).json({ success: true, message: 'Komentar berhasil ditambahkan', data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: posts } = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan', data: null });
    }

    const { rows: countResult } = await pool.query(
      'SELECT COUNT(*)::int AS total FROM comments WHERE post_id = $1',
      [id]
    );
    const total = countResult[0].total;

    const { rows } = await pool.query(
      `SELECT c.id, c.konten, c.created_at, u.nama AS user_name, u.foto_url AS user_foto
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    return res.status(200).json({
      success: true,
      message: 'Komentar berhasil diambil',
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

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { konten } = req.body;

    const { rows: comments } = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
    if (comments.length === 0) {
      return res.status(404).json({ success: false, message: 'Komentar tidak ditemukan', data: null });
    }

    if (comments[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin untuk mengedit komentar ini', data: null });
    }

    await pool.query('UPDATE comments SET konten = $1 WHERE id = $2', [konten, id]);

    const { rows } = await pool.query(
      `SELECT c.*, u.nama AS user_name, u.foto_url AS user_foto
       FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = $1`,
      [id]
    );

    return res.status(200).json({ success: true, message: 'Komentar berhasil diperbarui', data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: comments } = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
    if (comments.length === 0) {
      return res.status(404).json({ success: false, message: 'Komentar tidak ditemukan', data: null });
    }

    const comment = comments[0];
    const isOwner = comment.user_id === req.user.id;
    const isMod = req.user.role === 'admin' || req.user.role === 'moderator';

    if (!isOwner && !isMod) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin untuk menghapus komentar ini', data: null });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [id]);

    return res.status(200).json({ success: true, message: 'Komentar berhasil dihapus', data: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

module.exports = { addComment, getComments, updateComment, deleteComment };
