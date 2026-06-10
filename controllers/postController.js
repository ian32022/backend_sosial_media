const pool = require('../config/database');

const createPost = async (req, res) => {
  try {
    const { konten, gambar_url } = req.body;

    const result = await pool.query(
      'INSERT INTO posts (user_id, konten, gambar_url) VALUES ($1, $2, $3) RETURNING id',
      [req.user.id, konten, gambar_url || null]
    );

    const { rows } = await pool.query(
      `SELECT p.*, u.nama AS author_name, u.foto_url AS author_foto
       FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = $1`,
      [result.rows[0].id]
    );

    return res.status(201).json({ success: true, message: 'Postingan berhasil dibuat', data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: countResult } = await pool.query(
      'SELECT COUNT(*)::int AS total FROM posts WHERE is_hidden = false'
    );
    const total = countResult[0].total;

    const { rows } = await pool.query(
      `SELECT p.id, p.konten, p.gambar_url, p.is_hidden, p.created_at, p.updated_at,
              u.nama AS author_name,
              (SELECT COUNT(*)::int FROM likes WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*)::int FROM comments WHERE post_id = p.id) AS comment_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.is_hidden = false
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      message: 'Daftar postingan berhasil diambil',
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

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT p.*, u.nama AS author_name, u.foto_url AS author_foto,
              (SELECT COUNT(*)::int FROM likes WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*)::int FROM comments WHERE post_id = p.id) AS comment_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan', data: null });
    }

    if (rows[0].is_hidden && rows[0].user_id !== req.user.id && req.user.role === 'user') {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan', data: null });
    }

    return res.status(200).json({ success: true, message: 'Detail postingan berhasil diambil', data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { konten, gambar_url } = req.body;

    const { rows: posts } = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan', data: null });
    }

    if (posts[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin untuk mengedit postingan ini', data: null });
    }

    await pool.query(
      'UPDATE posts SET konten = $1, gambar_url = $2 WHERE id = $3',
      [konten, gambar_url || null, id]
    );

    const { rows } = await pool.query(
      `SELECT p.*, u.nama AS author_name, u.foto_url AS author_foto,
              (SELECT COUNT(*)::int FROM likes WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*)::int FROM comments WHERE post_id = p.id) AS comment_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    return res.status(200).json({ success: true, message: 'Postingan berhasil diperbarui', data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: posts } = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan', data: null });
    }

    const post = posts[0];
    const isOwner = post.user_id === req.user.id;
    const isMod = req.user.role === 'admin' || req.user.role === 'moderator';

    if (!isOwner && !isMod) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin untuk menghapus postingan ini', data: null });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);

    return res.status(200).json({ success: true, message: 'Postingan berhasil dihapus', data: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const hidePost = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: posts } = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan', data: null });
    }

    const newHidden = !posts[0].is_hidden;
    await pool.query('UPDATE posts SET is_hidden = $1 WHERE id = $2', [newHidden, id]);

    return res.status(200).json({
      success: true,
      message: newHidden ? 'Postingan disembunyikan' : 'Postingan ditampilkan kembali',
      data: { is_hidden: newHidden }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost, hidePost };
