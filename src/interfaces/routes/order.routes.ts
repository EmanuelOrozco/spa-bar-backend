import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  postOrder,
  putOrder,
  removeOrder,
  getStats,
  getDashboard,
} from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createOrderSchema,
  updateOrderSchema,
  orderIdParamSchema,
  orderQuerySchema,
} from '../../application/dto/order.dto';

const router = Router();

router.use(authenticate);

router.get('/stats', getStats);
router.get('/dashboard', getDashboard);
router.get('/', validate(orderQuerySchema, 'query'), getOrders);
router.get('/:id', validate(orderIdParamSchema, 'params'), getOrderById);
router.post('/', validate(createOrderSchema), postOrder);
router.put('/:id', validate(orderIdParamSchema, 'params'), validate(updateOrderSchema), putOrder);
router.delete('/:id', requireAdmin, validate(orderIdParamSchema, 'params'), removeOrder);

export default router;
