import { UserModel, UserDocument, IUser } from '@/modules/auth/user.model';

export async function findByEmail(email: string): Promise<UserDocument | null> {
  return UserModel.findOne({ email: email.toLowerCase() }).exec();
}

export async function findByIdentifier(identifier: string): Promise<UserDocument | null> {
  return UserModel.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { nisn: identifier },
      { nik: identifier },
    ],
  }).exec();
}

export async function findById(id: string): Promise<UserDocument | null> {
  return UserModel.findById(id).exec();
}

export async function createAuthUser(
  data: Pick<IUser, 'name' | 'email' | 'password' | 'role'> & { kelasId?: string; nisn?: string; nik?: string },
): Promise<UserDocument> {
  return UserModel.create({ ...data, email: data.email.toLowerCase() });
}

export async function updateAvatar(userId: string, avatarUrl: string): Promise<UserDocument | null> {
  return UserModel.findByIdAndUpdate(userId, { avatarUrl }, { new: true }).exec();
}
