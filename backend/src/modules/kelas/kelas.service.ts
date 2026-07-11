import { AppError } from '@/utils/AppError';
import { CreateKelasInput, UpdateKelasInput } from '@/modules/kelas/kelas.types';
import {
  findAllKelas,
  findKelasById,
  createKelas,
  updateKelasById,
  deleteKelasById,
} from '@/modules/kelas/kelas.repository';

export async function listKelas() {
  const data = await findAllKelas();
  return data.map((k) => k.toJSON());
}

export async function getKelas(id: string) {
  const kelas = await findKelasById(id);
  if (!kelas) throw AppError.notFound('Kelas');
  return kelas.toJSON();
}

export async function createKelasService(input: CreateKelasInput) {
  const kelas = await createKelas(input);
  return kelas.toJSON();
}

export async function updateKelasService(id: string, input: UpdateKelasInput) {
  const kelas = await updateKelasById(id, input);
  if (!kelas) throw AppError.notFound('Kelas');
  return kelas.toJSON();
}

export async function deleteKelasService(id: string): Promise<void> {
  const kelas = await deleteKelasById(id);
  if (!kelas) throw AppError.notFound('Kelas');
}
