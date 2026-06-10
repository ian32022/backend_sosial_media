const pool = require('../config/database');

const toggleFollow = async (req, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    if (parseInt(id) === followerId) {
      return res.status(400).json({ success: false, message: 'Tidak bisa mengikuti diri sendiri', data: null });
    }

    const { rows: users } = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan', data: null });
    }

    const { rows: existing } = await pool.query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, id]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM follows WHERE id = $1', [existing[0].id]);
      return res.status(200).json({ success: true, message: 'Berhasil unfollow', data: { action: 'unfollowed' } });
    } else {
      await pool.query('INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)', [followerId, id]);
      return res.status(201).json({ success: true, message: 'Berhasil follow', data: { action: 'followed' } });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: users } = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan', data: null });
    }

    const { rows: countResult } = await pool.query(
      'SELECT COUNT(*)::int AS total FROM follows WHERE following_id = $1',
      [id]
    );
    const total = countResult[0].total;

    const { rows } = await pool.query(
      `SELECT u.id, u.nama, u.email, u.bio, u.foto_url, f.created_at AS followed_at
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    return res.status(200).json({
      success: true,
      message: 'Daftar followers berhasil diambil',
      data: {
        followers: rows,
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

const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: users } = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan', data: null });
    }

    const { rows: countResult } = await pool.query(
      'SELECT COUNT(*)::int AS total FROM follows WHERE follower_id = $1',
      [id]
    );
    const total = countResult[0].total;

    const { rows } = await pool.query(
      `SELECT u.id, u.nama, u.email, u.bio, u.foto_url, f.created_at AS followed_at
       FROM follows f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    return res.status(200).json({
      success: true,
      message: 'Daftar following berhasil diambil',
      data: {
        following: rows,
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

module.exports = { toggleFollow, getFollowers, getFollowing };
