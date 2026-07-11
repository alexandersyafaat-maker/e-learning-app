import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/async-handler';
import { sendSuccess, sendCreated } from '@/utils/response';
import { ObrolanQuery, SendPesanInput } from '@/modules/obrolan/obrolan.types';
import { ObrolanRole } from '@/modules/obrolan/obrolan.model';
import { listPesan, sendPesan } from '@/modules/obrolan/obrolan.service';

export const listPesanController = asyncHandler(async (req: Request, res: Response) => {
  const { materiId } = req.query as ObrolanQuery;
  sendSuccess(res, await listPesan(materiId));
});

export const sendPesanController = asyncHandler(async (req: Request, res: Response) => {
  const { materiId, teks } = req.body as SendPesanInput;
  const { userId, name, role, kelasId } = req.user!;
  const pesan = await sendPesan(materiId, teks, {
    userId,
    name,
    role: role as ObrolanRole,
    kelasId,
  });
  sendCreated(res, pesan, 'Pesan berhasil dikirim');
});
