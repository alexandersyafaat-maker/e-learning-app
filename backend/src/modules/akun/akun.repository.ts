import { UserModel, UserDocument, IUser } from '@/modules/auth/user.model';

export async function findAllUsers(): Promise<UserDocument[]> {
  return UserModel.find().sort({ createdAt: -1 }).exec();
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  return UserModel.findById(id).exec();
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  return UserModel.findOne({ email: email.toLowerCase() }).exec();
}

export async function createUser(
  data: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<UserDocument> {
  return UserModel.create(data);
}

export async function updateUserById(
  id: string,
  data: Partial<Omit<IUser, 'id' | '_id' | 'createdAt' | 'updatedAt'>>,
): Promise<UserDocument | null> {
  return UserModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
}

export async function deleteUserById(id: string): Promise<UserDocument | null> {
  return UserModel.findByIdAndDelete(id).exec();
}

export async function findKelasIdBySiswaId(siswaId: string): Promise<string | null> {
  const user = await UserModel.findById(siswaId).exec();
  return user?.kelasId ?? null;
}
