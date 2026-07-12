import { AppError } from '@/utils/AppError';
import { findKelasById } from '@/modules/kelas/kelas.repository';
import { findKelasIdBySiswaId } from '@/modules/akun/akun.repository';
import { CreateMateriInput, UpdateMateriInput, MateriQuery } from '@/modules/materi/materi.types';
import {
  findMateriList,
  findMateriById,
  findMateriDocById,
  createMateri,
  updateMateriById,
  deleteMateriById,
} from '@/modules/materi/materi.repository';

export async function listMateri(
  query: MateriQuery,
  actor: { userId: string; role: 'ADMIN' | 'GURU' | 'SISWA' },
) {
  if (actor.role === 'SISWA') {
    const kelasId = await findKelasIdBySiswaId(actor.userId);
    return findMateriList({ kelasId: kelasId ?? undefined });
  }
  if (actor.role === 'GURU') {
    return findMateriList({ ...query, guruId: actor.userId });
  }
  return findMateriList(query);
}

export async function getMateri(
  id: string,
  actor: { userId: string; role: 'ADMIN' | 'GURU' | 'SISWA' },
) {
  const materi = await findMateriById(id);
  if (!materi) throw AppError.notFound('Materi');

  if (actor.role === 'SISWA') {
    const kelasId = await findKelasIdBySiswaId(actor.userId);
    if (kelasId !== materi.kelasId) throw AppError.forbidden();
  }
  if (actor.role === 'GURU' && materi.guruId !== actor.userId) throw AppError.forbidden();

  return materi;
}

export async function createMateriService(input: CreateMateriInput, actorGuruId: string) {
  // Hanya guru yang bersangkutan boleh membuat (guruId di body harus match actor)
  if (input.guruId !== actorGuruId) throw AppError.forbidden();

  const kelas = await findKelasById(input.kelasId);
  if (!kelas) throw AppError.notFound('Kelas');

  const materi = await createMateri({
    judul: input.judul,
    konten: input.konten,
    kelasId: input.kelasId,
    guruId: input.guruId,
    lampiran: input.lampiran,
  });

  return materi.toJSON();
}

export async function updateMateriService(
  id: string,
  input: UpdateMateriInput,
  actorGuruId: string,
) {
  const existing = await findMateriDocById(id);
  if (!existing) throw AppError.notFound('Materi');
  if (existing.guruId !== actorGuruId) throw AppError.forbidden();

  const kelas = await findKelasById(input.kelasId);
  if (!kelas) throw AppError.notFound('Kelas');

  const updated = await updateMateriById(id, {
    judul: input.judul,
    konten: input.konten,
    kelasId: input.kelasId,
    lampiran: input.lampiran,
  });

  return updated!.toJSON();
}

export async function deleteMateriService(id: string, actorGuruId: string): Promise<void> {
  const existing = await findMateriDocById(id);
  if (!existing) throw AppError.notFound('Materi');
  if (existing.guruId !== actorGuruId) throw AppError.forbidden();
  await deleteMateriById(id);
}
