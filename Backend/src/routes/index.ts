import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import bookRoutes from './book.routes';
import orderRoutes from './order.routes';
import customerFeaturesRoutes from './customer-features.routes';
import adminFeaturesRoutes from './admin-features.routes';
import contentRoutes from './content.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'API Book Store is running smoothly' });
});

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/books', bookRoutes);
router.use('/orders', orderRoutes);
router.use('/storefront', customerFeaturesRoutes);
router.use('/admin', adminFeaturesRoutes);
router.use('/', contentRoutes);

export default router;
