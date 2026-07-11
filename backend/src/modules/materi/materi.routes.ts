import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { upload } from '@/middlewares/upload.middleware';
import { CreateMateriSchema, UpdateMateriSchema, MateriQuerySchema } from '@/modules/materi/materi.types';
import {
  listMateriController,
  getMateriController,
  createMateriController,
  updateMateriController,
  deleteMateriController,
  uploadLampiranController,
} from '@/modules/materi/materi.controller';

const router = Router();

router.use(authenticate);

// Read — guru & siswa
router.get('/', validate(MateriQuerySchema, 'query'), listMateriController);
router.get('/:id', getMateriController);

// Mutasi — guru only
router.post('/', requireRole('GURU'), validate(CreateMateriSchema), createMateriController);
router.put('/:id', requireRole('GURU'), validate(UpdateMateriSchema), updateMateriController);
router.delete('/:id', requireRole('GURU'), deleteMateriController);

// Upload lampiran — guru only, returns Lampiran object
router.post('/upload/lampiran', requireRole('GURU'), upload.single('file'), uploadLampiranController);

export default router;
