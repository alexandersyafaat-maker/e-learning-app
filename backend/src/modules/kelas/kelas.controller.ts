import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '@/utils/response';
import { CreateKelasInput, UpdateKelasInput } from '@/modules/kelas/kelas.types';
import {
  listKelas,
  getKelas,
  createKelasService,
  updateKelasService,
  deleteKelasService,
} from '@/modules/kelas/kelas.service';

export const listKelasController = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await listKelas());
});

export const getKelasController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getKelas(req.params.id));
});

export const createKelasController = asyncHandler(async (req: Request, res: Response) => {
  sendCreated(res, await createKelasService(req.body as CreateKelasInput), 'Kelas berhasil dibuat');
});

export const updateKelasController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await updateKelasService(req.params.id, req.body as UpdateKelasInput),
    200,
    'Kelas berhasil diperbarui',
  );
});

export const deleteKelasController = asyncHandler(async (req: Request, res: Response) => {
  await deleteKelasService(req.params.id);
  sendNoContent(res);
});
