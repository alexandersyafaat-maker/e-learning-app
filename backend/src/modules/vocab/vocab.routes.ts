import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { CreateVocabSchema, ReviewSchema, VocabQuerySchema, ReviewQuerySchema } from '@/modules/vocab/vocab.types';
import {
  listVocabController, createVocabController, deleteVocabController,
  getReviewQueueController, submitReviewController,
} from '@/modules/vocab/vocab.controller';

const router = Router();

router.use(authenticate);

// /vocab/review MUST come before /vocab/:id — Express matches in order
router.get('/review', requireRole('SISWA'), validate(ReviewQuerySchema, 'query'), getReviewQueueController);
router.post('/review', requireRole('SISWA'), validate(ReviewSchema), submitReviewController);

router.get('/', validate(VocabQuerySchema, 'query'), listVocabController);
router.post('/', requireRole('GURU'), validate(CreateVocabSchema), createVocabController);
router.delete('/:id', requireRole('GURU'), deleteVocabController);

export default router;
