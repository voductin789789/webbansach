import { Router } from 'express';
import { paymentsController } from '../controllers/payments.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/orders/:id/session', authMiddleware, (req, res, next) => paymentsController.createSession(req, res, next));
router.get('/vnpay/return', (req, res, next) => paymentsController.vnpayReturn(req, res, next));
router.get('/vnpay/ipn', (req, res, next) => paymentsController.vnpayIpn(req, res, next));
router.get('/momo/return', (req, res, next) => paymentsController.momoReturn(req, res, next));
router.post('/momo/ipn', (req, res, next) => paymentsController.momoIpn(req, res, next));

export default router;
