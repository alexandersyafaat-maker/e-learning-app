import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { ObrolanQuerySchema, SendPesanSchema } from '@/modules/obrolan/obrolan.types';
import { listPesanController, sendPesanController } from '@/modules/obrolan/obrolan.controller';

const router = Router();

router.use(authenticate);

// GURU dan SISWA boleh baca + kirim (ADMIN tidak punya akses ke obrolan materi)
router.get(
  '/',
  requireRole('GURU', 'SISWA'),
  validate(ObrolanQuerySchema, 'query'),
  listPesanController,
);
router.post('/', requireRole('GURU', 'SISWA'), validate(SendPesanSchema), sendPesanController);

export default router;
