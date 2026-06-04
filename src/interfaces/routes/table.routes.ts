import { Router } from 'express';
import {
  getTables,
  getTableById,
  postTable,
  putTable,
  patchTableStatus,
  removeTable,
} from '../controllers/table.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createTableSchema,
  updateTableSchema,
  updateTableStatusSchema,
  tableIdParamSchema,
  tableQuerySchema,
} from '../../application/dto/table.dto';

const router = Router();

router.use(authenticate);

router.get('/', validate(tableQuerySchema, 'query'), getTables);
router.get('/:id', validate(tableIdParamSchema, 'params'), getTableById);
router.post('/', requireAdmin, validate(createTableSchema), postTable);
router.patch(
  '/:id/status',
  validate(tableIdParamSchema, 'params'),
  validate(updateTableStatusSchema),
  patchTableStatus
);
router.put(
  '/:id',
  requireAdmin,
  validate(tableIdParamSchema, 'params'),
  validate(updateTableSchema),
  putTable
);
router.delete('/:id', requireAdmin, validate(tableIdParamSchema, 'params'), removeTable);

export default router;
