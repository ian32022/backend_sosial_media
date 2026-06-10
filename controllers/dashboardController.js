const pool = require('../config/database');

const getDashboard = async (req, res) => {
  try {
    const { rows: userCount } = await pool.query('SELECT COUNT(*)::int AS total FROM users');
    const { rows: postCount } = await pool.query('SELECT COUNT(*)::int AS total FROM posts');
    const { rows: likeCount } = await pool.query('SELECT COUNT(*)::int AS total FROM likes');
    const { rows: pendingReports } = await pool.query(
      "SELECT COUNT(*)::int AS total FROM reports WHERE status = 'pending'"
    );

    const data = {
      total_users: userCount[0].total,
      total_posts: postCount[0].total,
      total_likes: likeCount[0].total,
      total_pending_reports: pendingReports[0].total
    };

    return res.status(200).json({ success: true, message: 'Data dashboard berhasil diambil', data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', data: null });
  }
};

module.exports = { getDashboard };
