const pool = require('../config/database');

const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: countResult } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM posts p
       JOIN follows f ON p.user_id = f.following_id
       WHERE f.follower_id = $1 AND p.is_hidden = false`,
      [req.user.id]
    );
    const total = countResult[0].total;

    const { rows } = await pool.query(
      `SELECT p.*, u.nama AS author_name, u.foto_url AS author_foto,
              (SELECT COUNT(*)::int FROM likes WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*)::int FROM comments WHERE post_id = p.id) AS comment_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       JOIN follows f ON p.user_id = f.following_id
       WHERE f.follower_id = $1 AND p.is_hidden = false
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return res.status(200).json({
      success: true,
      message: 'Feed berhasil diambil',
      data: {
        posts: rows,
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

const getRankedFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: countResult } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM posts p
       JOIN follows f ON p.user_id = f.following_id
       WHERE f.follower_id = $1 AND p.is_hidden = false`,
      [req.user.id]
    );
    const total = countResult[0].total;

    const { rows } = await pool.query(
      `SELECT p.*, u.nama AS author_name, u.foto_url AS author_foto,
              (SELECT COUNT(*)::int FROM likes WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*)::int FROM comments WHERE post_id = p.id) AS comment_count,
              ((SELECT COUNT(*)::int FROM likes WHERE post_id = p.id) +
               (SELECT COUNT(*)::int FROM comments WHERE post_id = p.id) * 2 -
               EXTRACT(EPOCH FROM NOW() - p.created_at) / 3600 * 0.5) AS score
       FROM posts p
       JOIN users u ON p.user_id = u.id
       JOIN follows f ON p.user_id = f.following_id
       WHERE f.follower_id = $1 AND p.is_hidden = false
       ORDER BY score DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return res.status(200).json({
      success: true,
      message: 'Ranked feed berhasil diambil',
      data: {
        posts: rows,
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

module.exports = { getFeed, getRankedFeed };
