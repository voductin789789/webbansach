import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// Yêu cầu đăng nhập cho tất cả order routes
router.use(authMiddleware);

// Customer routes
router.post('/', (req, res, next) => orderController.createOrder(req, res, next));
router.get('/my-orders', (req, res, next) => orderController.getMyOrders(req, res, next));
router.get('/:id', (req, res, next) => orderController.getOrderById(req, res, next));

// Admin routes
router.get('/', roleMiddleware('ADMIN'), (req, res, next) => orderController.getAllOrders(req, res, next));
router.patch('/:id/status', roleMiddleware('ADMIN'), (req, res, next) => orderController.updateOrderStatus(req, res, next));

export default router;

