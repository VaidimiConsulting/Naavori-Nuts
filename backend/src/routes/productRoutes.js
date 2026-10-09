import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as productController from '../controllers/productController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Upload directory — goes into /uploads folder at project root
const uploadsDir = path.join(__dirname, '../../../uploads/products');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const slug = req.body.slug || 'product-' + Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    // Save as slug-250g.webp (or jpg/png)
    cb(null, `${slug}-250g${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, webp) are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// ─── Public Routes ──────────────────────────────────────────────────────────
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductDetails);

// ─── Protected Admin Routes ─────────────────────────────────────────────────
router.post(
  '/upload',
  requireAuth,
  requireRole(['owner', 'manager']),
  upload.single('image'),
  productController.uploadImage
);
router.post('/', requireAuth, requireRole(['owner', 'manager']), productController.createProduct);
router.put('/:id', requireAuth, requireRole(['owner', 'manager']), productController.updateProduct);
router.delete('/:id', requireAuth, requireRole(['owner', 'manager']), productController.deleteProduct);

// ─── Multer error handler ────────────────────────────────────────────────────
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes('Only image')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

export default router;
