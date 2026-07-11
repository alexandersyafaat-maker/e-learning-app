import {
  LatihanModel, LatihanDocument, ILatihan,
  HasilLatihanModel, HasilLatihanDocument, IHasilLatihan,
} from '@/modules/latihan/latihan.model';
import { UserModel } from '@/modules/auth/user.model';
import { KelasModel } from '@/modules/kelas/kelas.model';

// ── Shared view types ─────────────────────────────────────

export interface LatihanView {
  id: string;
  judul: string;
  deskripsi: string;
  kelasId: string;
  kelasNama: string;
  guruId: string;
  guruNama: string;
  deadline?: string;
  lampiran: ILatihan['lampiran'];
  createdAt: string;
  updatedAt: string;
}

export interface LatihanWithStatus extends LatihanView {
  hasilLatihan: Record<string, unknown> | null;
}

export interface HasilLatihanView {
  id: string;
  latihanId: string;
  siswaId: string;
  siswaNama: string;
  siswaEmail: string;
  jawaban: string;
  lampiran: IHasilLatihan['lampiran'];
  nilai?: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────

async function enrichLatihan(doc: LatihanDocument): Promise<LatihanView> {
  const [kelas, guru] = await Promise.all([
    KelasModel.findById(doc.kelasId).exec(),
    UserModel.findById(doc.guruId).exec(),
  ]);
  const base = doc.toJSON() as unknown as LatihanView;
  return {
    ...base,
    deadline: doc.deadline ? doc.deadline.toISOString() : undefined,
    kelasNama: kelas?.nama ?? '',
    guruNama: guru?.name ?? '',
  };
}

async function enrichHasil(doc: HasilLatihanDocument): Promise<HasilLatihanView> {
  const siswa = await UserModel.findById(doc.siswaId).exec();
  const base = doc.toJSON() as unknown as HasilLatihanView;
  return {
    ...base,
    submittedAt: doc.submittedAt.toISOString(),
    siswaNama: siswa?.name ?? '',
    siswaEmail: siswa?.email ?? '',
  };
}

// ── Latihan queries ───────────────────────────────────────

export async function findLatihanList(filter: {
  guruId?: string;
  kelasId?: string;
}): Promise<LatihanView[]> {
  const query: Record<string, string> = {};
  if (filter.guruId) query.guruId = filter.guruId;
  if (filter.kelasId) query.kelasId = filter.kelasId;
  const items = await LatihanModel.find(query).sort({ createdAt: -1 }).exec();
  return Promise.all(items.map(enrichLatihan));
}

export async function findLatihanWithStatus(
  kelasId: string,
  siswaId: string,
): Promise<LatihanWithStatus[]> {
  const items = await LatihanModel.find({ kelasId }).sort({ createdAt: -1 }).exec();
  return Promise.all(
    items.map(async (doc) => {
      const [view, hasil] = await Promise.all([
        enrichLatihan(doc),
        HasilLatihanModel.findOne({ latihanId: doc.id, siswaId }).exec(),
      ]);
      return {
        ...view,
        hasilLatihan: hasil ? (hasil.toJSON() as Record<string, unknown>) : null,
      };
    }),
  );
}

export async function findLatihanById(id: string): Promise<LatihanDocument | null> {
  return LatihanModel.findById(id).exec();
}

export async function findLatihanDetailEnriched(id: string): Promise<LatihanView | null> {
  const doc = await LatihanModel.findById(id).exec();
  if (!doc) return null;
  return enrichLatihan(doc);
}

export async function createLatihan(
  data: Omit<ILatihan, 'id' | '_id' | 'createdAt' | 'updatedAt'>,
): Promise<LatihanDocument> {
  return LatihanModel.create(data);
}

export async function updateLatihanById(
  id: string,
  data: Partial<Omit<ILatihan, 'id' | '_id' | 'createdAt' | 'updatedAt'>>,
): Promise<LatihanDocument | null> {
  return LatihanModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
}

export async function deleteLatihanById(id: string): Promise<LatihanDocument | null> {
  return LatihanModel.findByIdAndDelete(id).exec();
}

// ── HasilLatihan queries ──────────────────────────────────

export async function findHasilByLatihan(latihanId: string): Promise<HasilLatihanView[]> {
  const items = await HasilLatihanModel.find({ latihanId }).sort({ submittedAt: -1 }).exec();
  return Promise.all(items.map(enrichHasil));
}

export async function findHasilBySiswa(
  latihanId: string,
  siswaId: string,
): Promise<HasilLatihanDocument | null> {
  return HasilLatihanModel.findOne({ latihanId, siswaId }).exec();
}

export async function findHasilById(id: string): Promise<HasilLatihanDocument | null> {
  return HasilLatihanModel.findById(id).exec();
}

export async function createHasilLatihan(
  data: Omit<IHasilLatihan, 'id' | '_id' | 'createdAt' | 'updatedAt'>,
): Promise<HasilLatihanDocument> {
  return HasilLatihanModel.create(data);
}

export async function updateNilai(
  hasilId: string,
  nilai: number,
): Promise<HasilLatihanDocument | null> {
  return HasilLatihanModel.findByIdAndUpdate(
    hasilId,
    { nilai },
    { new: true, runValidators: true },
  ).exec();
}
