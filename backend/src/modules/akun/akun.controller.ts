import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '@/utils/response';
import { CreateAkunInput, UpdateAkunInput } from '@/modules/akun/akun.types';
import {
  listAkun,
  createAkun,
  updateAkun,
  deleteAkun,
} from '@/modules/akun/akun.service';

export const listAkunController = asyncHandler(async (_req: Request, res: Response) => {
  const data = await listAkun();
  sendSuccess(res, data);
});

export const createAkunController = asyncHandler(async (req: Request, res: Response) => {
  const data = await createAkun(req.body as CreateAkunInput);
  sendCreated(res, data, 'Akun berhasil dibuat');
});

export const updateAkunController = asyncHandler(async (req: Request, res: Response) => {
  const data = await updateAkun(req.params.id, req.body as UpdateAkunInput);
  sendSuccess(res, data, 200, 'Akun berhasil diperbarui');
});

export const deleteAkunController = asyncHandler(async (req: Request, res: Response) => {
  await deleteAkun(req.params.id);
  sendNoContent(res);
});
