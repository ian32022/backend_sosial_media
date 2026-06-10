const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Koneksi database gagal:', err.message);
  } else {
    console.log('Koneksi database berhasil');
    release();
  }
});

module.exports = pool;
