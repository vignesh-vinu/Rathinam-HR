const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith('image/') || file.mimetype.includes('pdf') || file.mimetype.includes('word')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG, WEBP'));
    }
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let fileUrl = '';
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const filename = (req.file.fieldname || 'doc') + '-' + uniqueSuffix + ext;
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), req.file.buffer);
    fileUrl = `/uploads/${filename}`;
  } catch (err) {
    const mime = req.file.mimetype || 'application/octet-stream';
    const base64 = req.file.buffer.toString('base64');
    fileUrl = `data:${mime};base64,${base64}`;
  }

  res.json({
    message: 'File uploaded successfully',
    file: {
      id: `doc-${Date.now()}`,
      name: req.file.originalname,
      filename: req.file.originalname,
      type: req.body.docType || 'Document',
      size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      url: fileUrl
    }
  });
});

module.exports = router;
