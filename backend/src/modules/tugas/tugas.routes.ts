import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { upload } from '@/middlewares/upload.middleware';
import {
  CreateTugasSchema, UpdateTugasSchema, SubmitTugasSchema, NilaiTugasSchema, TugasQuerySchema,
} from '@/modules/tugas/tugas.types';
import {
  listTugasController, getTugasController,
  createTugasController, updateTugasController, deleteTugasController,
  listSubmisiController, cekSubmisiController,
  submitTugasController, beriNilaiTugasController,
  uploadLampiranTugasController,
} from '@/modules/tugas/tugas.controller';

const router = Router();

router.use(authenticate);

router.get('/', validate(TugasQuerySchema, 'query'), listTugasController);
router.get('/:id', getTugasController);

router.post('/', requireRole('GURU'), validate(CreateTugasSchema), createTugasController);
router.put('/:id', requireRole('GURU'), validate(UpdateTugasSchema), updateTugasController);
router.delete('/:id', requireRole('GURU'), deleteTugasController);

router.get('/:id/submisi', requireRole('GURU'), listSubmisiController);
router.patch('/:id/submisi/:submisiId/nilai', requireRole('GURU'), validate(NilaiTugasSchema), beriNilaiTugasController);

router.get('/:id/submisi/:siswaId', cekSubmisiController);

router.post('/:id/submit', requireRole('SISWA'), validate(SubmitTugasSchema), submitTugasController);

// Upload lampiran — guru & siswa (untuk submit tugas)
router.post('/upload/lampiran', upload.single('file'), uploadLampiranTugasController);

export default router;
