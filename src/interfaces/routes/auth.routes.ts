import { Router } from 'express';
import { register, login, refresh, getMe, patchProfile } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
} from '../../application/dto/auth.dto';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), patchProfile);

export default router;
