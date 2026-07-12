import { AppError } from '@/utils/AppError';
import { findKelasById } from '@/modules/kelas/kelas.repository';
import { findKelasIdBySiswaId } from '@/modules/akun/akun.repository';
import {
  CreateTugasInput,
  UpdateTugasInput,
  SubmitTugasInput,
  NilaiTugasInput,
  TugasQuery,
} from '@/modules/tugas/tugas.types';
import {
  findTugasList,
  findTugasWithStatus,
  findTugasById,
  findTugasDetailEnriched,
  createTugas,
  updateTugasById,
  deleteTugasById,
  findSubmisiByTugas,
  findSubmisiBySiswa,
  findSubmisiById,
  createSubmisi,
  updateNilaiSubmisi,
} from '@/modules/tugas/tugas.repository';

// ── Guru ──────────────────────────────────────────────────

export async function listTugasGuru(guruId: string) {
  return findTugasList({ guruId });
}

export async function getTugasDetail(id: string) {
  const view = await findTugasDetailEnriched(id);
  if (!view) throw AppError.notFound('Tugas');
  return view;
}

export async function createTugasService(input: CreateTugasInput, actorGuruId: string) {
  if (input.guruId !== actorGuruId) throw AppError.forbidden();
  const kelas = await findKelasById(input.kelasId);
  if (!kelas) throw AppError.notFound('Kelas');

  const doc = await createTugas({
    judul: input.judul,
    deskripsi: input.deskripsi,
    kelasId: input.kelasId,
    guruId: input.guruId,
    deadline: input.deadline ? new Date(input.deadline) : undefined,
    lampiran: input.lampiran,
  });
  return doc.toJSON();
}

export async function updateTugasService(id: string, input: UpdateTugasInput, actorGuruId: string) {
  const existing = await findTugasById(id);
  if (!existing) throw AppError.notFound('Tugas');
  if (existing.guruId !== actorGuruId) throw AppError.forbidden();

  const kelas = await findKelasById(input.kelasId);
  if (!kelas) throw AppError.notFound('Kelas');

  const updated = await updateTugasById(id, {
    judul: input.judul,
    deskripsi: input.deskripsi,
    kelasId: input.kelasId,
    deadline: input.deadline ? new Date(input.deadline) : undefined,
    lampiran: input.lampiran,
  });
  return updated!.toJSON();
}

export async function deleteTugasService(id: string, actorGuruId: string): Promise<void> {
  const existing = await findTugasById(id);
  if (!existing) throw AppError.notFound('Tugas');
  if (existing.guruId !== actorGuruId) throw AppError.forbidden();
  await deleteTugasById(id);
}

export async function listSubmisiService(tugasId: string, actorGuruId: string) {
  const tugas = await findTugasById(tugasId);
  if (!tugas) throw AppError.notFound('Tugas');
  if (tugas.guruId !== actorGuruId) throw AppError.forbidden();
  return findSubmisiByTugas(tugasId);
}

export async function beriNilaiTugasService(
  tugasId: string,
  submisiId: string,
  input: NilaiTugasInput,
  actorGuruId: string,
) {
  const tugas = await findTugasById(tugasId);
  if (!tugas) throw AppError.notFound('Tugas');
  if (tugas.guruId !== actorGuruId) throw AppError.forbidden();

  const submisi = await findSubmisiById(submisiId);
  if (!submisi || submisi.tugasId !== tugasId) throw AppError.notFound('Submisi tugas');

  const updated = await updateNilaiSubmisi(submisiId, input.nilai);
  return updated!.toJSON();
}

// ── Siswa ─────────────────────────────────────────────────

export async function listTugasSiswa(query: TugasQuery) {
  if (!query.siswaId) throw AppError.badRequest('siswaId wajib untuk siswa');
  const kelasId = query.kelasId ?? (await findKelasIdBySiswaId(query.siswaId));
  if (!kelasId) throw AppError.badRequest('Siswa belum terdaftar di kelas');
  return findTugasWithStatus(kelasId, query.siswaId);
}

export async function cekSubmisiSiswa(tugasId: string, siswaId: string) {
  const tugas = await findTugasById(tugasId);
  if (!tugas) throw AppError.notFound('Tugas');
  const submisi = await findSubmisiBySiswa(tugasId, siswaId);
  return submisi ? submisi.toJSON() : null;
}

export async function submitTugasService(
  tugasId: string,
  input: SubmitTugasInput,
  actorSiswaId: string,
) {
  if (input.siswaId !== actorSiswaId) throw AppError.forbidden();

  const tugas = await findTugasById(tugasId);
  if (!tugas) throw AppError.notFound('Tugas');

  if (tugas.deadline && new Date() > tugas.deadline) throw AppError.deadlinePassed();

  const sudahSubmit = await findSubmisiBySiswa(tugasId, input.siswaId);
  if (sudahSubmit) throw AppError.alreadySubmitted();

  const submisi = await createSubmisi({
    tugasId,
    siswaId: input.siswaId,
    jawaban: input.jawaban,
    catatan: input.catatan,
    lampiran: input.lampiran,
    submittedAt: new Date(),
  });
  return submisi.toJSON();
}
