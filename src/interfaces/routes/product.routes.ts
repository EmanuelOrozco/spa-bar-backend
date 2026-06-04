import { Router } from 'express';
import {
  getProducts,
  getProductById,
  postProduct,
  putProduct,
  removeProduct,
} from '../controllers/product.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productQuerySchema,
} from '../../application/dto/product.dto';

const router = Router();

router.use(authenticate);

router.get('/', validate(productQuerySchema, 'query'), getProducts);
router.get('/:id', validate(productIdParamSchema, 'params'), getProductById);
router.post('/', requireAdmin, validate(createProductSchema), postProduct);
router.put(
  '/:id',
  requireAdmin,
  validate(productIdParamSchema, 'params'),
  validate(updateProductSchema),
  putProduct
);
router.delete('/:id', requireAdmin, validate(productIdParamSchema, 'params'), removeProduct);

export default router;
