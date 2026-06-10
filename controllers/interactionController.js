const pool = require('../config/database');

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { rows: posts } = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan', data: null });
    }

    const { rows: existing } = await pool.query('SELECT id FROM likes WHERE user_id = $1 AND post_id = $2', [userId, id]);

    if (existing.length > 0) {
      await pool.query('DELETE FROM likes WHERE id = $1', [existing[0].id]);
      return res.status(200).json({ success: true, message: 'Berhasil unlike postingan', data: { action: 'unliked' } });
    } else {
      await pool.query('INSERT INTO likes (user_id, post_id) VALUES ($1, $2)', [userId, id]);
      return res.status(201).json({ success: true, message: 'Berhasil like postingan', data: { action: 'liked' } });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { rows: posts } = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan', data: null });
    }

    const { rows: existing } = await pool.query('SELECT id FROM bookmarks WHERE user_id = $1 AND post_id = $2', [userId, id]);

    if (existing.length > 0) {
      await pool.query('DELETE FROM bookmarks WHERE id = $1', [existing[0].id]);
      return res.status(200).json({ success: true, message: 'Bookmark berhasil dihapus', data: { action: 'unbookmarked' } });
    } else {
      await pool.query('INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2)', [userId, id]);
      return res.status(201).json({ success: true, message: 'Postingan berhasil dibookmark', data: { action: 'bookmarked' } });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: countResult } = await pool.query(
      'SELECT COUNT(*)::int AS total FROM bookmarks WHERE user_id = $1',
      [req.user.id]
    );
    const total = countResult[0].total;

    const { rows } = await pool.query(
      `SELECT b.id AS bookmark_id, b.created_at AS bookmark_date,
              p.id, p.konten, p.gambar_url, p.created_at,
              u.nama AS author_name, u.foto_url AS author_foto,
              (SELECT COUNT(*)::int FROM likes WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*)::int FROM comments WHERE post_id = p.id) AS comment_count
       FROM bookmarks b
       JOIN posts p ON b.post_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return res.status(200).json({
      success: true,
      message: 'Bookmark berhasil diambil',
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

module.exports = { toggleLike, toggleBookmark, getBookmarks };
