import { Router } from 'express';
import {
  getReservations,
  getReservationById,
  postReservation,
  putReservation,
  removeReservation,
} from '../controllers/reservation.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createReservationSchema,
  updateReservationSchema,
  reservationIdParamSchema,
  reservationQuerySchema,
} from '../../application/dto/reservation.dto';

const router = Router();

router.use(authenticate);

router.get('/', validate(reservationQuerySchema, 'query'), getReservations);
router.get('/:id', validate(reservationIdParamSchema, 'params'), getReservationById);
router.post('/', validate(createReservationSchema), postReservation);
router.put(
  '/:id',
  validate(reservationIdParamSchema, 'params'),
  validate(updateReservationSchema),
  putReservation
);
router.delete('/:id', validate(reservationIdParamSchema, 'params'), removeReservation);

export default router;
