import { Router } from 'express';
import { bookController } from '../controllers/book.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Public routes
router.get('/', (req, res, next) => bookController.getAll(req, res, next));
router.get('/slug/:slug', (req, res, next) => bookController.getBySlug(req, res, next));
router.get('/:id', (req, res, next) => bookController.getById(req, res, next));

// Admin only routes (với upload file ảnh bìa coverImage)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  upload.single('coverImage'),
  (req, res, next) => bookController.create(req, res, next)
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  upload.single('coverImage'),
  (req, res, next) => bookController.update(req, res, next)
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  (req, res, next) => bookController.delete(req, res, next)
);

export default router;

