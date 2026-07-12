import {
  TugasModel,
  TugasDocument,
  ITugas,
  SubmisiTugasModel,
  SubmisiTugasDocument,
  ISubmisiTugas,
} from '@/modules/tugas/tugas.model';
import { UserModel } from '@/modules/auth/user.model';
import { KelasModel } from '@/modules/kelas/kelas.model';

// ── View types ────────────────────────────────────────────

export interface TugasView {
  id: string;
  judul: string;
  deskripsi: string;
  kelasId: string;
  kelasNama: string;
  guruId: string;
  guruNama: string;
  deadline?: string;
  lampiran: ITugas['lampiran'];
  createdAt: string;
  updatedAt: string;
}

export interface TugasWithStatus extends TugasView {
  submisi: Record<string, unknown> | null;
}

export interface SubmisiTugasView {
  id: string;
  tugasId: string;
  siswaId: string;
  siswaNama: string;
  siswaEmail: string;
  jawaban: string;
  catatan: string;
  lampiran: ISubmisiTugas['lampiran'];
  nilai?: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────

async function enrichTugas(doc: TugasDocument): Promise<TugasView> {
  const [kelas, guru] = await Promise.all([
    KelasModel.findById(doc.kelasId).exec(),
    UserModel.findById(doc.guruId).exec(),
  ]);
  const base = doc.toJSON() as unknown as TugasView;
  return {
    ...base,
    deadline: doc.deadline ? doc.deadline.toISOString() : undefined,
    kelasNama: kelas?.nama ?? '',
    guruNama: guru?.name ?? '',
  };
}

async function enrichSubmisi(doc: SubmisiTugasDocument): Promise<SubmisiTugasView> {
  const siswa = await UserModel.findById(doc.siswaId).exec();
  const base = doc.toJSON() as unknown as SubmisiTugasView;
  return {
    ...base,
    submittedAt: doc.submittedAt.toISOString(),
    siswaNama: siswa?.name ?? '',
    siswaEmail: siswa?.email ?? '',
  };
}

// ── Tugas queries ─────────────────────────────────────────

export async function findTugasList(filter: {
  guruId?: string;
  kelasId?: string;
}): Promise<TugasView[]> {
  const query: Record<string, string> = {};
  if (filter.guruId) query.guruId = filter.guruId;
  if (filter.kelasId) query.kelasId = filter.kelasId;
  const items = await TugasModel.find(query).sort({ createdAt: -1 }).exec();
  return Promise.all(items.map(enrichTugas));
}

export async function findTugasWithStatus(
  kelasId: string,
  siswaId: string,
): Promise<TugasWithStatus[]> {
  const items = await TugasModel.find({ kelasId }).sort({ createdAt: -1 }).exec();
  return Promise.all(
    items.map(async (doc) => {
      const [view, submisi] = await Promise.all([
        enrichTugas(doc),
        SubmisiTugasModel.findOne({ tugasId: doc.id, siswaId }).exec(),
      ]);
      return {
        ...view,
        submisi: submisi ? submisi.toJSON() : null,
      };
    }),
  );
}

export async function findTugasById(id: string): Promise<TugasDocument | null> {
  return TugasModel.findById(id).exec();
}

export async function findTugasDetailEnriched(id: string): Promise<TugasView | null> {
  const doc = await TugasModel.findById(id).exec();
  if (!doc) return null;
  return enrichTugas(doc);
}

export async function createTugas(
  data: Omit<ITugas, 'id' | '_id' | 'createdAt' | 'updatedAt'>,
): Promise<TugasDocument> {
  return TugasModel.create(data);
}

export async function updateTugasById(
  id: string,
  data: Partial<Omit<ITugas, 'id' | '_id' | 'createdAt' | 'updatedAt'>>,
): Promise<TugasDocument | null> {
  return TugasModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
}

export async function deleteTugasById(id: string): Promise<TugasDocument | null> {
  return TugasModel.findByIdAndDelete(id).exec();
}

// ── SubmisiTugas queries ──────────────────────────────────

export async function findSubmisiByTugas(tugasId: string): Promise<SubmisiTugasView[]> {
  const items = await SubmisiTugasModel.find({ tugasId }).sort({ submittedAt: -1 }).exec();
  return Promise.all(items.map(enrichSubmisi));
}

export async function findSubmisiBySiswa(
  tugasId: string,
  siswaId: string,
): Promise<SubmisiTugasDocument | null> {
  return SubmisiTugasModel.findOne({ tugasId, siswaId }).exec();
}

export async function findSubmisiById(id: string): Promise<SubmisiTugasDocument | null> {
  return SubmisiTugasModel.findById(id).exec();
}

export async function createSubmisi(
  data: Omit<ISubmisiTugas, 'id' | '_id' | 'createdAt' | 'updatedAt'>,
): Promise<SubmisiTugasDocument> {
  return SubmisiTugasModel.create(data);
}

export async function updateNilaiSubmisi(
  submisiId: string,
  nilai: number,
): Promise<SubmisiTugasDocument | null> {
  return SubmisiTugasModel.findByIdAndUpdate(
    submisiId,
    { nilai },
    { new: true, runValidators: true },
  ).exec();
}
