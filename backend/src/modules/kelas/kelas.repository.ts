import { KelasModel, KelasDocument, IKelas } from '@/modules/kelas/kelas.model';

export async function findAllKelas(): Promise<KelasDocument[]> {
  return KelasModel.find().sort({ createdAt: -1 }).exec();
}

export async function findKelasById(id: string): Promise<KelasDocument | null> {
  return KelasModel.findById(id).exec();
}

export async function createKelas(
  data: Omit<IKelas, 'id' | '_id' | 'createdAt' | 'updatedAt'>,
): Promise<KelasDocument> {
  return KelasModel.create(data);
}

export async function updateKelasById(
  id: string,
  data: Partial<Omit<IKelas, 'id' | '_id' | 'createdAt' | 'updatedAt'>>,
): Promise<KelasDocument | null> {
  return KelasModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
}

export async function deleteKelasById(id: string): Promise<KelasDocument | null> {
  return KelasModel.findByIdAndDelete(id).exec();
}
