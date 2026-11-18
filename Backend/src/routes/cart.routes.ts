import { Router, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { authMiddleware } from '../middlewares/auth.middleware';
import { cartService } from '../services/cart.service';
import { sendSuccess } from '../utils/response';

const router = Router();
router.use(authMiddleware);
const handle = (fn: (req: AuthRequest) => Promise<unknown>) => (req: AuthRequest, res: Response, next: NextFunction) => {
  Promise.resolve().then(() => fn(req)).then(items => sendSuccess(res, items)).catch(next);
};
router.get('/', handle(req => cartService.get(req.user!.id)));
router.post('/items', handle(req => cartService.add(req.user!.id, req.body.bookId, req.body.quantity)));
router.patch('/items/:bookId', handle(req => cartService.setQuantity(req.user!.id, Number(req.params.bookId), req.body.quantity)));
router.delete('/items/:bookId', handle(req => cartService.remove(req.user!.id, Number(req.params.bookId))));
router.delete('/', handle(req => cartService.clear(req.user!.id)));
router.post('/merge', handle(req => cartService.merge(req.user!.id, req.body.items)));
export default router;
