import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '@/utils/response';
import { fileToLampiran } from '@/middlewares/upload.middleware';
import {
  CreateTugasInput,
  UpdateTugasInput,
  SubmitTugasInput,
  NilaiTugasInput,
  TugasQuery,
} from '@/modules/tugas/tugas.types';
import {
  listTugasGuru,
  listTugasSiswa,
  getTugasDetail,
  createTugasService,
  updateTugasService,
  deleteTugasService,
  listSubmisiService,
  cekSubmisiSiswa,
  submitTugasService,
  beriNilaiTugasService,
} from '@/modules/tugas/tugas.service';

export const listTugasController = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as TugasQuery;
  const role = req.user!.role;
  const data =
    role === 'GURU'
      ? await listTugasGuru(query.guruId ?? req.user!.userId)
      : await listTugasSiswa(query);
  sendSuccess(res, data);
});

export const getTugasController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getTugasDetail(req.params.id));
});

export const createTugasController = asyncHandler(async (req: Request, res: Response) => {
  sendCreated(
    res,
    await createTugasService(req.body as CreateTugasInput, req.user!.userId),
    'Tugas berhasil dibuat',
  );
});

export const updateTugasController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await updateTugasService(req.params.id, req.body as UpdateTugasInput, req.user!.userId),
    200,
    'Tugas berhasil diperbarui',
  );
});

export const deleteTugasController = asyncHandler(async (req: Request, res: Response) => {
  await deleteTugasService(req.params.id, req.user!.userId);
  sendNoContent(res);
});

export const listSubmisiController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await listSubmisiService(req.params.id, req.user!.userId));
});

export const cekSubmisiController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await cekSubmisiSiswa(req.params.id, req.params.siswaId));
});

export const submitTugasController = asyncHandler(async (req: Request, res: Response) => {
  sendCreated(
    res,
    await submitTugasService(req.params.id, req.body as SubmitTugasInput, req.user!.userId),
    'Tugas berhasil dikumpulkan',
  );
});

export const beriNilaiTugasController = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await beriNilaiTugasService(
      req.params.id,
      req.params.submisiId,
      req.body as NilaiTugasInput,
      req.user!.userId,
    ),
    200,
    'Nilai berhasil disimpan',
  );
});

export const uploadLampiranTugasController = asyncHandler((req: Request, res: Response) => {
  if (!req.file) {
    sendSuccess(res, null, 400, 'File tidak ditemukan');
    return Promise.resolve();
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const lampiran = fileToLampiran(req.file, baseUrl);
  sendCreated(res, lampiran, 'File berhasil diupload');
  return Promise.resolve();
});
