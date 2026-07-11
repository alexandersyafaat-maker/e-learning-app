import { AppError } from '@/utils/AppError';
import { findKelasById } from '@/modules/kelas/kelas.repository';
import { findKelasIdBySiswaId } from '@/modules/akun/akun.repository';
import {
  CreateLatihanInput,
  UpdateLatihanInput,
  SubmitLatihanInput,
  NilaiInput,
  LatihanQuery,
} from '@/modules/latihan/latihan.types';
import {
  findLatihanList,
  findLatihanWithStatus,
  findLatihanById,
  findLatihanDetailEnriched,
  createLatihan,
  updateLatihanById,
  deleteLatihanById,
  findHasilByLatihan,
  findHasilBySiswa,
  findHasilById,
  createHasilLatihan,
  updateNilai,
} from '@/modules/latihan/latihan.repository';

// ── Guru ──────────────────────────────────────────────────

export async function listLatihanGuru(guruId: string) {
  return findLatihanList({ guruId });
}

export async function getLatihanDetail(id: string) {
  const view = await findLatihanDetailEnriched(id);
  if (!view) throw AppError.notFound('Latihan');
  return view;
}

export async function createLatihanService(input: CreateLatihanInput, actorGuruId: string) {
  if (input.guruId !== actorGuruId) throw AppError.forbidden();

  const kelas = await findKelasById(input.kelasId);
  if (!kelas) throw AppError.notFound('Kelas');

  const doc = await createLatihan({
    judul: input.judul,
    deskripsi: input.deskripsi,
    kelasId: input.kelasId,
    guruId: input.guruId,
    deadline: input.deadline ? new Date(input.deadline) : undefined,
    lampiran: input.lampiran,
  });

  return doc.toJSON();
}

export async function updateLatihanService(
  id: string,
  input: UpdateLatihanInput,
  actorGuruId: string,
) {
  const existing = await findLatihanById(id);
  if (!existing) throw AppError.notFound('Latihan');
  if (existing.guruId !== actorGuruId) throw AppError.forbidden();

  const kelas = await findKelasById(input.kelasId);
  if (!kelas) throw AppError.notFound('Kelas');

  const updated = await updateLatihanById(id, {
    judul: input.judul,
    deskripsi: input.deskripsi,
    kelasId: input.kelasId,
    deadline: input.deadline ? new Date(input.deadline) : undefined,
    lampiran: input.lampiran,
  });

  return updated!.toJSON();
}

export async function deleteLatihanService(id: string, actorGuruId: string): Promise<void> {
  const existing = await findLatihanById(id);
  if (!existing) throw AppError.notFound('Latihan');
  if (existing.guruId !== actorGuruId) throw AppError.forbidden();
  await deleteLatihanById(id);
}

export async function listHasilService(latihanId: string, actorGuruId: string) {
  const latihan = await findLatihanById(latihanId);
  if (!latihan) throw AppError.notFound('Latihan');
  if (latihan.guruId !== actorGuruId) throw AppError.forbidden();
  return findHasilByLatihan(latihanId);
}

export async function beriNilaiService(
  latihanId: string,
  hasilId: string,
  input: NilaiInput,
  actorGuruId: string,
) {
  const latihan = await findLatihanById(latihanId);
  if (!latihan) throw AppError.notFound('Latihan');
  if (latihan.guruId !== actorGuruId) throw AppError.forbidden();

  const hasil = await findHasilById(hasilId);
  if (!hasil || hasil.latihanId !== latihanId) throw AppError.notFound('Hasil latihan');

  const updated = await updateNilai(hasilId, input.nilai);
  return updated!.toJSON();
}

// ── Siswa ─────────────────────────────────────────────────

export async function listLatihanSiswa(query: LatihanQuery) {
  if (!query.siswaId) throw AppError.badRequest('siswaId wajib untuk siswa');
  const kelasId = query.kelasId ?? (await findKelasIdBySiswaId(query.siswaId));
  if (!kelasId) throw AppError.badRequest('Siswa belum terdaftar di kelas');
  return findLatihanWithStatus(kelasId, query.siswaId);
}

export async function cekHasilSiswa(latihanId: string, siswaId: string) {
  const latihan = await findLatihanById(latihanId);
  if (!latihan) throw AppError.notFound('Latihan');
  const hasil = await findHasilBySiswa(latihanId, siswaId);
  return hasil ? hasil.toJSON() : null;
}

export async function submitLatihanService(
  latihanId: string,
  input: SubmitLatihanInput,
  actorSiswaId: string,
) {
  if (input.siswaId !== actorSiswaId) throw AppError.forbidden();

  const latihan = await findLatihanById(latihanId);
  if (!latihan) throw AppError.notFound('Latihan');

  if (latihan.deadline && new Date() > latihan.deadline) {
    throw AppError.deadlinePassed();
  }

  const sudahSubmit = await findHasilBySiswa(latihanId, input.siswaId);
  if (sudahSubmit) throw AppError.alreadySubmitted();

  const hasil = await createHasilLatihan({
    latihanId,
    siswaId: input.siswaId,
    jawaban: input.jawaban,
    lampiran: input.lampiran,
    submittedAt: new Date(),
  });

  return hasil.toJSON();
}
