const validatePost = (req, res, next) => {
  const errors = [];
  const { konten, gambar_url } = req.body;

  if (!konten || typeof konten !== 'string' || konten.trim().length < 1) {
    errors.push('Konten wajib diisi dan harus berupa string');
  } else if (konten.length > 500) {
    errors.push('Konten maksimal 500 karakter');
  }

  if (gambar_url) {
    if (typeof gambar_url !== 'string' || !gambar_url.startsWith('http')) {
      errors.push('gambar_url harus dimulai dengan http');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }

  next();
};

const validateComment = (req, res, next) => {
  const errors = [];
  const { konten } = req.body;

  if (!konten || typeof konten !== 'string' || konten.trim().length < 1) {
    errors.push('Konten wajib diisi dan harus berupa string');
  } else if (konten.length > 300) {
    errors.push('Konten maksimal 300 karakter');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }

  next();
};

const validateUpdateProfile = (req, res, next) => {
  const errors = [];
  const { nama, bio, foto_url } = req.body;

  if (nama !== undefined) {
    if (typeof nama !== 'string' || nama.trim().length < 1) {
      errors.push('Nama harus berupa string dan tidak boleh kosong');
    } else if (nama.length > 100) {
      errors.push('Nama maksimal 100 karakter');
    }
  }

  if (bio !== undefined) {
    if (typeof bio !== 'string') {
      errors.push('Bio harus berupa string');
    } else if (bio.length > 255) {
      errors.push('Bio maksimal 255 karakter');
    }
  }

  if (foto_url !== undefined && foto_url !== null) {
    if (typeof foto_url !== 'string' || !foto_url.startsWith('http')) {
      errors.push('foto_url harus dimulai dengan http');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }

  next();
};

module.exports = { validatePost, validateComment, validateUpdateProfile };
