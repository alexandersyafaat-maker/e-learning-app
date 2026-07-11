import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { CreateAkunSchema, UpdateAkunSchema } from '@/modules/akun/akun.types';
import {
  listAkunController,
  createAkunController,
  updateAkunController,
  deleteAkunController,
} from '@/modules/akun/akun.controller';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/', listAkunController);
router.post('/', validate(CreateAkunSchema), createAkunController);
router.put('/:id', validate(UpdateAkunSchema), updateAkunController);
router.delete('/:id', deleteAkunController);

export default router;
