import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '@/utils/response';
import { fileToLampiran } from '@/middlewares/upload.middleware';
import {
  CreateLatihanInput,
  UpdateLatihanInput,
  SubmitLatihanInput,
  NilaiInput,
  LatihanQuery,
} from '@/modules/latihan/latihan.types';
import {
  listLatihanGuru,
  listLatihanSiswa,
  getLatihanDetail,
  createLatihanService,
  updateLatihanService,
  deleteLatihanService,
  listHasilService,
  cekHasilSiswa,
  submitLatihanService,
  beriNilaiService,
} from '@/modules/latihan/latihan.service';

export const listLatihanController = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as LatihanQuery;
  const role = req.user!.role;

  let data;
  if (role === 'GURU') {
    data = await listLatihanGuru(req.user!.userId);
  } else {
    data = await listLatihanSiswa(query);
  }
  sendSuccess(res, data);
});

export const getLatihanController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getLatihanDetail(req.params.id));
});

export const createLatihanController = asyncHandler(async (req: Request, res: Response) => {
  sendCreated(
    res,
    await createLatihanService(req.body as CreateLatihanInput, req.user!.userId),
    'Latihan berhasil dibuat',
  );
});

export const updateLatihanController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await updateLatihanService(req.params.id, req.body as UpdateLatihanInput, req.user!.userId),
    200,
    'Latihan berhasil diperbarui',
  );
});

export const deleteLatihanController = asyncHandler(async (req: Request, res: Response) => {
  await deleteLatihanService(req.params.id, req.user!.userId);
  sendNoContent(res);
});

export const listHasilController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await listHasilService(req.params.id, req.user!.userId));
});

export const cekHasilController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await cekHasilSiswa(req.params.id, req.params.siswaId, {
      userId: req.user!.userId,
      role: req.user!.role,
    }),
  );
});

export const submitLatihanController = asyncHandler(async (req: Request, res: Response) => {
  sendCreated(
    res,
    await submitLatihanService(req.params.id, req.body as SubmitLatihanInput, req.user!.userId),
    'Jawaban berhasil dikumpulkan',
  );
});

export const beriNilaiController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await beriNilaiService(
      req.params.id,
      req.params.hasilId,
      req.body as NilaiInput,
      req.user!.userId,
    ),
    200,
    'Nilai berhasil disimpan',
  );
});

export const uploadLampiranLatihanController = asyncHandler((req: Request, res: Response) => {
  if (!req.file) {
    sendSuccess(res, null, 400, 'File tidak ditemukan');
    return Promise.resolve();
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const lampiran = fileToLampiran(req.file, baseUrl);
  sendCreated(res, lampiran, 'File berhasil diupload');
  return Promise.resolve();
});
