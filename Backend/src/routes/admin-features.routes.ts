import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { adminFeaturesController } from '../controllers/admin-features.controller';

const router = Router();

router.use(authMiddleware, roleMiddleware('ADMIN'));
router.get('/coupons', (req, res, next) => adminFeaturesController.listCoupons(req, res, next));
router.post('/coupons', (req, res, next) => adminFeaturesController.createCoupon(req, res, next));
router.put('/coupons/:id', (req, res, next) => adminFeaturesController.updateCoupon(req, res, next));
router.delete('/coupons/:id', (req, res, next) => adminFeaturesController.deleteCoupon(req, res, next));
router.post('/inventory/receive', (req, res, next) => adminFeaturesController.receiveInventory(req, res, next));
router.get('/inventory/low-stock', (req, res, next) => adminFeaturesController.lowStock(req, res, next));
router.get('/reports/sales', (req, res, next) => adminFeaturesController.salesReport(req, res, next));

export default router;
