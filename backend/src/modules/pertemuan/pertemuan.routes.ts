import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { CreatePertemuanSchema, PertemuanQuerySchema } from '@/modules/pertemuan/pertemuan.types';
import {
  listPertemuanController,
  createPertemuanController,
  deletePertemuanController,
} from '@/modules/pertemuan/pertemuan.controller';

const router = Router();

router.use(authenticate);

router.get('/', validate(PertemuanQuerySchema, 'query'), listPertemuanController);
router.post('/', requireRole('GURU'), validate(CreatePertemuanSchema), createPertemuanController);
router.delete('/:id', requireRole('GURU'), deletePertemuanController);

export default router;
