import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import tableRoutes from './table.routes';
import reservationRoutes from './reservation.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'SpaBar API v1',
    data: { version: '1.0.0', name: 'SpaBar API' },
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/tables', tableRoutes);
router.use('/reservations', reservationRoutes);

export default router;
