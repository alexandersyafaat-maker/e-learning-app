import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '@/utils/response';
import { CreateVocabInput, ReviewInput, VocabQuery, ReviewQuery } from '@/modules/vocab/vocab.types';
import {
  listVocabService, createVocabService, deleteVocabService,
  getReviewQueueService, submitReviewService,
} from '@/modules/vocab/vocab.service';

export const listVocabController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await listVocabService(req.query as VocabQuery));
});

export const createVocabController = asyncHandler(async (req: Request, res: Response) => {
  sendCreated(res, await createVocabService(req.body as CreateVocabInput, req.user!.userId), 'Kartu vocab berhasil dibuat');
});

export const deleteVocabController = asyncHandler(async (req: Request, res: Response) => {
  await deleteVocabService(req.params.id, req.user!.userId);
  sendNoContent(res);
});

export const getReviewQueueController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getReviewQueueService(req.query as ReviewQuery));
});

export const submitReviewController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await submitReviewService(req.body as ReviewInput, req.user!.userId), 200, 'Review berhasil disimpan');
});
