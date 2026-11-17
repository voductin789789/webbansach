import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { customerFeaturesController } from '../controllers/customer-features.controller';
import { contentController } from '../controllers/content.controller';

const router = Router();

router.get('/blog', (req, res, next) => contentController.listPublished(req, res, next));
router.get('/blog/:slug', (req, res, next) => contentController.getPublished(req, res, next));
router.post('/newsletter', (req, res, next) => customerFeaturesController.subscribe(req, res, next));

router.get('/admin/blog', authMiddleware, roleMiddleware('ADMIN'), (req, res, next) => contentController.listAll(req, res, next));
router.post('/admin/blog', authMiddleware, roleMiddleware('ADMIN'), (req, res, next) => contentController.create(req, res, next));
router.put('/admin/blog/:id', authMiddleware, roleMiddleware('ADMIN'), (req, res, next) => contentController.update(req, res, next));
router.delete('/admin/blog/:id', authMiddleware, roleMiddleware('ADMIN'), (req, res, next) => contentController.delete(req, res, next));

export default router;
