import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { upload } from '@/middlewares/upload.middleware';
import {
  CreateLatihanSchema,
  UpdateLatihanSchema,
  SubmitLatihanSchema,
  NilaiSchema,
  LatihanQuerySchema,
} from '@/modules/latihan/latihan.types';
import {
  listLatihanController,
  getLatihanController,
  createLatihanController,
  updateLatihanController,
  deleteLatihanController,
  listHasilController,
  cekHasilController,
  submitLatihanController,
  beriNilaiController,
  uploadLampiranLatihanController,
} from '@/modules/latihan/latihan.controller';

const router = Router();

router.use(authenticate);

// List + detail — guru & siswa (logika dibedakan di controller by role)
router.get('/', validate(LatihanQuerySchema, 'query'), listLatihanController);
router.get('/:id', getLatihanController);

// Guru CRUD
router.post('/', requireRole('GURU'), validate(CreateLatihanSchema), createLatihanController);
router.put('/:id', requireRole('GURU'), validate(UpdateLatihanSchema), updateLatihanController);
router.delete('/:id', requireRole('GURU'), deleteLatihanController);

// Guru: lihat hasil + beri nilai
router.get('/:id/hasil', requireRole('GURU'), listHasilController);
router.patch('/:id/hasil/:hasilId/nilai', requireRole('GURU'), validate(NilaiSchema), beriNilaiController);

// Cek status submit siswa (guru & siswa bisa akses)
router.get('/:id/hasil/:siswaId', cekHasilController);

// Siswa: submit
router.post('/:id/submit', requireRole('SISWA'), validate(SubmitLatihanSchema), submitLatihanController);

// Upload lampiran — guru & siswa (untuk submit jawaban)
router.post('/upload/lampiran', upload.single('file'), uploadLampiranLatihanController);

export default router;
