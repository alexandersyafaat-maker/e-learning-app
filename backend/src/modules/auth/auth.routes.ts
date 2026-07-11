import { Router } from 'express';
import { validate } from '@/middlewares/validate.middleware';
import { LoginSchema, RegisterSchema } from '@/modules/auth/auth.types';
import { loginController, logoutController, meController, registerController, uploadAvatarController } from '@/modules/auth/auth.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { uploadAvatar } from '@/middlewares/upload.middleware';

const router = Router();

router.post('/register', validate(RegisterSchema), registerController);
router.post('/login', validate(LoginSchema), loginController);
router.post('/logout', logoutController);
router.get('/me', authenticate, meController);
router.post('/me/avatar', authenticate, uploadAvatar.single('foto'), uploadAvatarController);

export default router;
