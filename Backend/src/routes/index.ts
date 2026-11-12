import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import bookRoutes from './book.routes';
import orderRoutes from './order.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'API Book Store is running smoothly' });
});

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/books', bookRoutes);
router.use('/orders', orderRoutes);

export default router;
