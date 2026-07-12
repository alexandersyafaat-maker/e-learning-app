import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '@/utils/response';
import { fileToLampiran } from '@/middlewares/upload.middleware';
import { CreateMateriInput, UpdateMateriInput, MateriQuery } from '@/modules/materi/materi.types';
import {
  listMateri,
  getMateri,
  createMateriService,
  updateMateriService,
  deleteMateriService,
} from '@/modules/materi/materi.service';

export const listMateriController = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as MateriQuery;
  sendSuccess(res, await listMateri(query));
});

export const getMateriController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getMateri(req.params.id));
});

export const createMateriController = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateMateriInput;
  const guruId = req.user!.userId;
  sendCreated(res, await createMateriService(input, guruId), 'Materi berhasil dibuat');
});

export const updateMateriController = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateMateriInput;
  const guruId = req.user!.userId;
  sendSuccess(
    res,
    await updateMateriService(req.params.id, input, guruId),
    200,
    'Materi berhasil diperbarui',
  );
});

export const deleteMateriController = asyncHandler(async (req: Request, res: Response) => {
  await deleteMateriService(req.params.id, req.user!.userId);
  sendNoContent(res);
});

export const uploadLampiranController = asyncHandler((req: Request, res: Response) => {
  if (!req.file) {
    sendSuccess(res, null, 400, 'File tidak ditemukan');
    return Promise.resolve();
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const lampiran = fileToLampiran(req.file, baseUrl);
  sendCreated(res, lampiran, 'File berhasil diupload');
  return Promise.resolve();
});
