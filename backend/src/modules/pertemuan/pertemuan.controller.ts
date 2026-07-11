import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '@/utils/response';
import { CreatePertemuanInput, PertemuanQuery } from '@/modules/pertemuan/pertemuan.types';
import {
  listPertemuanService, createPertemuanService, deletePertemuanService,
} from '@/modules/pertemuan/pertemuan.service';

export const listPertemuanController = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as PertemuanQuery;
  sendSuccess(res, await listPertemuanService(query, req.user!.role));
});

export const createPertemuanController = asyncHandler(async (req: Request, res: Response) => {
  sendCreated(
    res,
    await createPertemuanService(req.body as CreatePertemuanInput, req.user!.userId),
    'Pertemuan berhasil dibuat',
  );
});

export const deletePertemuanController = asyncHandler(async (req: Request, res: Response) => {
  await deletePertemuanService(req.params.id, req.user!.userId);
  sendNoContent(res);
});
