import { PertemuanModel, PertemuanDocument, IPertemuan } from '@/modules/pertemuan/pertemuan.model';
import { UserModel } from '@/modules/auth/user.model';
import { KelasModel } from '@/modules/kelas/kelas.model';

export type PertemuanStatus = 'TERJADWAL' | 'BERLANGSUNG' | 'SELESAI';

export interface PertemuanView {
  id: string;
  judul: string;
  kelasId: string;
  kelasNama: string;
  guruId: string;
  guruNama: string;
  jadwal: string;
  durasi: number;
  zoomMeetingId: string;
  zoomJoinUrl: string;
  zoomStartUrl: string;
  zoomPassword: string;
  status: PertemuanStatus;
  createdAt: string;
  updatedAt: string;
}

export function computeStatus(jadwal: Date, durasi: number): PertemuanStatus {
  const now = Date.now();
  const start = jadwal.getTime();
  const end = start + durasi * 60_000;
  if (now < start) return 'TERJADWAL';
  if (now <= end) return 'BERLANGSUNG';
  return 'SELESAI';
}

async function enrichPertemuan(doc: PertemuanDocument): Promise<PertemuanView> {
  const [kelas, guru] = await Promise.all([
    KelasModel.findById(doc.kelasId).exec(),
    UserModel.findById(doc.guruId).exec(),
  ]);
  const base = doc.toJSON() as unknown as PertemuanView;
  return {
    ...base,
    jadwal: doc.jadwal.toISOString(),
    kelasNama: kelas?.nama ?? '',
    guruNama: guru?.name ?? '',
    status: computeStatus(doc.jadwal, doc.durasi),
  };
}

export async function findPertemuanList(filter: {
  guruId?: string;
  kelasId?: string;
}): Promise<PertemuanView[]> {
  const query: Record<string, string> = {};
  if (filter.guruId) query.guruId = filter.guruId;
  if (filter.kelasId) query.kelasId = filter.kelasId;
  const items = await PertemuanModel.find(query).sort({ jadwal: -1 }).exec();
  return Promise.all(items.map(enrichPertemuan));
}

export async function findPertemuanById(id: string): Promise<PertemuanDocument | null> {
  return PertemuanModel.findById(id).exec();
}

export async function createPertemuan(
  data: Omit<IPertemuan, 'id' | '_id' | 'createdAt' | 'updatedAt'>,
): Promise<PertemuanDocument> {
  return PertemuanModel.create(data);
}

export async function deletePertemuanById(id: string): Promise<PertemuanDocument | null> {
  return PertemuanModel.findByIdAndDelete(id).exec();
}
