import { AppError } from '@/utils/AppError';
import { findMateriDocById } from '@/modules/materi/materi.repository';
import { findKelasIdBySiswaId } from '@/modules/akun/akun.repository';
import { ObrolanRole } from '@/modules/obrolan/obrolan.model';
import { findPesanByMateri, createPesan } from '@/modules/obrolan/obrolan.repository';

export async function listPesan(materiId: string) {
  const materi = await findMateriDocById(materiId);
  if (!materi) throw AppError.notFound('Materi');
  const items = await findPesanByMateri(materiId);
  return items.map((p) => p.toJSON());
}

export async function sendPesan(
  materiId: string,
  teks: string,
  actor: { userId: string; name: string; role: ObrolanRole; kelasId?: string },
) {
  const materi = await findMateriDocById(materiId);
  if (!materi) throw AppError.notFound('Materi');

  // GURU: harus pemilik materi
  if (actor.role === 'GURU' && materi.guruId !== actor.userId) {
    throw AppError.forbidden('Anda bukan guru materi ini');
  }

  // SISWA: harus berada di kelas materi
  if (actor.role === 'SISWA') {
    const kelasId = actor.kelasId ?? (await findKelasIdBySiswaId(actor.userId));
    if (kelasId !== materi.kelasId) {
      throw AppError.forbidden('Anda tidak terdaftar di kelas materi ini');
    }
  }

  const pesan = await createPesan({
    materiId,
    userId: actor.userId,
    userNama: actor.name,
    userRole: actor.role,
    teks,
  });

  return pesan.toJSON();
}
