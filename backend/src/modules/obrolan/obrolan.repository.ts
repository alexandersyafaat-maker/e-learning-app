import { ObrolanModel, ObrolanDocument, ObrolanRole } from '@/modules/obrolan/obrolan.model';

export async function findPesanByMateri(materiId: string): Promise<ObrolanDocument[]> {
  return ObrolanModel.find({ materiId }).sort({ createdAt: 1 }).exec();
}

export async function createPesan(data: {
  materiId: string;
  userId: string;
  userNama: string;
  userRole: ObrolanRole;
  teks: string;
}): Promise<ObrolanDocument> {
  return ObrolanModel.create(data);
}
