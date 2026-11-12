import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// Public routes
router.get('/', (req, res, next) => categoryController.getAll(req, res, next));
router.get('/:id', (req, res, next) => categoryController.getById(req, res, next));

// Admin only routes
router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  (req, res, next) => categoryController.create(req, res, next)
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  (req, res, next) => categoryController.update(req, res, next)
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  (req, res, next) => categoryController.delete(req, res, next)
);

export default router;

