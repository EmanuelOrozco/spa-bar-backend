import { Router } from 'express';
import {
  getUsers,
  getUserById,
  postUser,
  putUser,
  removeUser,
} from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userQuerySchema,
} from '../../application/dto/user.dto';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', validate(userQuerySchema, 'query'), getUsers);
router.get('/:id', validate(userIdParamSchema, 'params'), getUserById);
router.post('/', validate(createUserSchema), postUser);
router.put('/:id', validate(userIdParamSchema, 'params'), validate(updateUserSchema), putUser);
router.delete('/:id', validate(userIdParamSchema, 'params'), removeUser);

export default router;
