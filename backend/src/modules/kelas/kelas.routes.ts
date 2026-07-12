import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { CreateKelasSchema, UpdateKelasSchema } from '@/modules/kelas/kelas.types';
import {
  listKelasController,
  getKelasController,
  createKelasController,
  updateKelasController,
  deleteKelasController,
} from '@/modules/kelas/kelas.controller';

const router = Router();

// GET — public (kelas list needed on register page pre-auth)
router.get('/', listKelasController);
router.get('/:id', authenticate, getKelasController);

// mutasi — ADMIN only
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(CreateKelasSchema),
  createKelasController,
);
router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validate(UpdateKelasSchema),
  updateKelasController,
);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteKelasController);

export default router;
