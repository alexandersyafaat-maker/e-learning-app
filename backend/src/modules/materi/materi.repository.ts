import { MateriModel, MateriDocument, IMateri } from '@/modules/materi/materi.model';
import { UserModel } from '@/modules/auth/user.model';
import { KelasModel } from '@/modules/kelas/kelas.model';

export interface MateriView {
  id: string;
  judul: string;
  konten: string;
  kelasId: string;
  kelasNama: string;
  guruId: string;
  guruNama: string;
  lampiran: IMateri['lampiran'];
  createdAt: string;
  updatedAt: string;
}

async function enrichMateri(materi: MateriDocument): Promise<MateriView> {
  const [kelas, guru] = await Promise.all([
    KelasModel.findById(materi.kelasId).exec(),
    UserModel.findById(materi.guruId).exec(),
  ]);

  const base = materi.toJSON() as unknown as MateriView;
  return {
    ...base,
    kelasNama: kelas?.nama ?? '',
    guruNama: guru?.name ?? '',
  };
}

export async function findMateriList(filter: { guruId?: string; kelasId?: string }): Promise<MateriView[]> {
  const query: Record<string, string> = {};
  if (filter.guruId) query.guruId = filter.guruId;
  if (filter.kelasId) query.kelasId = filter.kelasId;

  const items = await MateriModel.find(query).sort({ createdAt: -1 }).exec();
  return Promise.all(items.map(enrichMateri));
}

export async function findMateriById(id: string): Promise<MateriView | null> {
  const materi = await MateriModel.findById(id).exec();
  if (!materi) return null;
  return enrichMateri(materi);
}

export async function findMateriDocById(id: string): Promise<MateriDocument | null> {
  return MateriModel.findById(id).exec();
}

export async function createMateri(
  data: Omit<IMateri, 'id' | '_id' | 'createdAt' | 'updatedAt'>,
): Promise<MateriDocument> {
  return MateriModel.create(data);
}

export async function updateMateriById(
  id: string,
  data: Partial<Omit<IMateri, 'id' | '_id' | 'createdAt' | 'updatedAt'>>,
): Promise<MateriDocument | null> {
  return MateriModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
}

export async function deleteMateriById(id: string): Promise<MateriDocument | null> {
  return MateriModel.findByIdAndDelete(id).exec();
}
