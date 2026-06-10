const pool = require('../config/database');

const createReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { alasan } = req.body;

    if (!alasan) {
      return res.status(400).json({ success: false, message: 'Alasan laporan tidak boleh kosong', data: null });
    }

    const { rows: posts } = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan', data: null });
    }

    const result = await pool.query(
      'INSERT INTO reports (reporter_id, post_id, alasan) VALUES ($1, $2, $3) RETURNING id',
      [req.user.id, id, alasan]
    );

    const { rows } = await pool.query('SELECT * FROM reports WHERE id = $1', [result.rows[0].id]);

    return res.status(201).json({ success: true, message: 'Laporan berhasil dikirim', data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: countResult } = await pool.query('SELECT COUNT(*)::int AS total FROM reports');
    const total = countResult[0].total;

    const { rows } = await pool.query(
      `SELECT r.*, u.nama AS reporter_name, u.foto_url AS reporter_foto,
              p.konten AS post_konten
       FROM reports r
       JOIN users u ON r.reporter_id = u.id
       JOIN posts p ON r.post_id = p.id
       ORDER BY r.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      message: 'Daftar laporan berhasil diambil',
      data: {
        reports: rows,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: reports } = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    if (reports.length === 0) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan', data: null });
    }

    await pool.query('UPDATE reports SET status = $1 WHERE id = $2', ['resolved', id]);

    const { rows } = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);

    return res.status(200).json({ success: true, message: 'Laporan berhasil diselesaikan', data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const moderatePost = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: posts } = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan', data: null });
    }

    const newHidden = !posts[0].is_hidden;
    await pool.query('UPDATE posts SET is_hidden = $1 WHERE id = $2', [newHidden, id]);

    const { rows } = await pool.query(
      `SELECT p.*, u.nama AS author_name, u.foto_url AS author_foto
       FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = $1`,
      [id]
    );

    const statusText = newHidden ? 'disembunyikan' : 'ditampilkan kembali';
    return res.status(200).json({ success: true, message: `Postingan berhasil ${statusText}`, data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

module.exports = { createReport, getReports, resolveReport, moderatePost };
