import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { customerFeaturesController } from '../controllers/customer-features.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/wishlist', (req, res, next) => customerFeaturesController.getWishlist(req, res, next));
router.post('/wishlist/:bookId', (req, res, next) => customerFeaturesController.addToWishlist(req, res, next));
router.delete('/wishlist/:bookId', (req, res, next) => customerFeaturesController.removeFromWishlist(req, res, next));
router.get('/addresses', (req, res, next) => customerFeaturesController.getAddresses(req, res, next));
router.post('/addresses', (req, res, next) => customerFeaturesController.createAddress(req, res, next));
router.put('/addresses/:id', (req, res, next) => customerFeaturesController.updateAddress(req, res, next));
router.delete('/addresses/:id', (req, res, next) => customerFeaturesController.deleteAddress(req, res, next));
router.post('/books/:bookId/reviews', (req, res, next) => customerFeaturesController.createReview(req, res, next));
router.post('/review-images', upload.single('reviewImage'), (req, res, next) => customerFeaturesController.uploadReviewImage(req, res, next));
router.post('/reviews/:reviewId/helpful', (req, res, next) => customerFeaturesController.markReviewHelpful(req, res, next));

export default router;
