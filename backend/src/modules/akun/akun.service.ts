import { AppError } from '@/utils/AppError';
import { hashPassword } from '@/utils/password';
import { CreateAkunInput, UpdateAkunInput } from '@/modules/akun/akun.types';
import {
  findAllUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUserById,
  deleteUserById,
} from '@/modules/akun/akun.repository';

export async function listAkun() {
  const users = await findAllUsers();
  return users.map((u) => u.toJSON());
}

export async function createAkun(input: CreateAkunInput) {
  const existing = await findUserByEmail(input.email);
  if (existing) throw AppError.alreadyExists('Email');

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    _id: undefined as unknown as string,
    name: input.name,
    email: input.email,
    password: passwordHash,
    role: input.role,
    nisn: input.nisn || undefined,
    nik: input.nik || undefined,
    kelasId: input.kelasId || undefined,
  });

  return user.toJSON();
}

export async function updateAkun(id: string, input: UpdateAkunInput) {
  const existing = await findUserByEmail(input.email);
  if (existing && existing.id !== id) throw AppError.alreadyExists('Email');

  const updateData: Record<string, unknown> = {
    name: input.name,
    email: input.email,
    role: input.role,
    nisn: input.nisn || undefined,
    nik: input.nik || undefined,
    kelasId: input.kelasId || undefined,
  };

  if (input.password && input.password.length > 0) {
    updateData.password = await hashPassword(input.password);
  }

  const user = await updateUserById(id, updateData);
  if (!user) throw AppError.notFound('Akun');

  return user.toJSON();
}

export async function deleteAkun(id: string): Promise<void> {
  const user = await deleteUserById(id);
  if (!user) throw AppError.notFound('Akun');
}

export async function getAkunById(id: string) {
  const user = await findUserById(id);
  if (!user) throw AppError.notFound('Akun');
  return user.toJSON();
}
