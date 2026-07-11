import { AppError } from '@/utils/AppError';
import { findKelasById } from '@/modules/kelas/kelas.repository';
import { findKelasIdBySiswaId } from '@/modules/akun/akun.repository';
import { createZoomMeeting, deleteZoomMeeting } from '@/lib/zoom.client';
import { CreatePertemuanInput, PertemuanQuery } from '@/modules/pertemuan/pertemuan.types';
import {
  findPertemuanList, findPertemuanById, createPertemuan, deletePertemuanById,
  computeStatus, PertemuanView,
} from '@/modules/pertemuan/pertemuan.repository';

type Role = 'ADMIN' | 'GURU' | 'SISWA';

function stripSiswa(view: PertemuanView, role: Role): Omit<PertemuanView, 'zoomStartUrl'> | PertemuanView {
  if (role === 'SISWA') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { zoomStartUrl, ...safe } = view;
    return safe;
  }
  return view;
}

export async function listPertemuanService(query: PertemuanQuery, role: Role) {
  let resolvedQuery = { ...query };
  if (query.siswaId && !query.kelasId) {
    const kelasId = await findKelasIdBySiswaId(query.siswaId);
    resolvedQuery = { kelasId: kelasId ?? undefined };
  }
  const list = await findPertemuanList(resolvedQuery);
  return list.map((p) => stripSiswa(p, role));
}

export async function createPertemuanService(input: CreatePertemuanInput, actorGuruId: string) {
  if (input.guruId !== actorGuruId) throw AppError.forbidden();

  const kelas = await findKelasById(input.kelasId);
  if (!kelas) throw AppError.notFound('Kelas');

  const meeting = await createZoomMeeting({
    topic: input.judul,
    startTime: input.jadwal,
    duration: input.durasi,
  });

  const doc = await createPertemuan({
    judul: input.judul,
    kelasId: input.kelasId,
    guruId: input.guruId,
    jadwal: new Date(input.jadwal),
    durasi: input.durasi,
    zoomMeetingId: String(meeting.id),
    zoomJoinUrl: meeting.join_url,
    zoomStartUrl: meeting.start_url,
    zoomPassword: meeting.password,
  });

  const view: PertemuanView = {
    ...(doc.toJSON() as unknown as PertemuanView),
    jadwal: doc.jadwal.toISOString(),
    status: computeStatus(doc.jadwal, doc.durasi),
    kelasNama: kelas.nama,
    guruNama: '',
  };

  return view;
}

export async function deletePertemuanService(id: string, actorGuruId: string): Promise<void> {
  const doc = await findPertemuanById(id);
  if (!doc) throw AppError.notFound('Pertemuan');
  if (doc.guruId !== actorGuruId) throw AppError.forbidden();

  // Best-effort: delete from Zoom, don't fail if already gone
  try {
    await deleteZoomMeeting(doc.zoomMeetingId);
  } catch {
    // Meeting may already be deleted on Zoom side — proceed to remove from DB
  }

  await deletePertemuanById(id);
}
