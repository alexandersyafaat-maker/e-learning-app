import type { Pertemuan, PertemuanView, CreatePertemuanInput } from "../types/pertemuan.types";
import { PertemuanStatus } from "../types/pertemuan.types";

const KELAS_NAMA: Record<string, string> = {
  "k-001": "Kelas VII",
  "k-002": "Kelas VIII",
  "k-003": "Kelas IX",
};

const GURU_NAMA: Record<string, string> = {
  "u-002": "Budi Santoso",
  "u-003": "Dewi Kurnia",
};

const SISWA_KELAS_MAP: Record<string, string> = {
  "u-004": "k-001",
  "u-005": "k-002",
  "u-006": "k-003",
};

function computeStatus(jadwal: string, durasi: number): PertemuanStatus {
  const start = new Date(jadwal).getTime();
  const end = start + durasi * 60 * 1000;
  const now = Date.now();
  if (now < start) return PertemuanStatus.TERJADWAL;
  if (now < end) return PertemuanStatus.BERLANGSUNG;
  return PertemuanStatus.SELESAI;
}

let DUMMY_PERTEMUAN: Pertemuan[] = [
  {
    id: "ptm-001",
    judul: "Diskusi Aljabar Bab 1 — Tanya Jawab",
    kelasId: "k-001",
    guruId: "u-002",
    jadwal: "2026-07-05T09:00:00.000Z",
    durasi: 60,
    zoomMeetingId: "123 456 7890",
    zoomJoinUrl: "https://zoom.us/j/12345678901?pwd=dummypassword1",
    zoomStartUrl: "https://zoom.us/s/12345678901?zak=dummyzaktoken1",
    zoomPassword: "Aljabar1",
    status: PertemuanStatus.TERJADWAL,
    createdAt: "2026-06-25T08:00:00.000Z",
    updatedAt: "2026-06-25T08:00:00.000Z",
  },
  {
    id: "ptm-002",
    judul: "Pembahasan Latihan Fungsi",
    kelasId: "k-001",
    guruId: "u-002",
    jadwal: "2026-07-12T09:00:00.000Z",
    durasi: 90,
    zoomMeetingId: "234 567 8901",
    zoomJoinUrl: "https://zoom.us/j/23456789012?pwd=dummypassword2",
    zoomStartUrl: "https://zoom.us/s/23456789012?zak=dummyzaktoken2",
    zoomPassword: "Fungsi2",
    status: PertemuanStatus.TERJADWAL,
    createdAt: "2026-06-25T08:00:00.000Z",
    updatedAt: "2026-06-25T08:00:00.000Z",
  },
  {
    id: "ptm-003",
    judul: "Review Materi Sel — Presentasi Siswa",
    kelasId: "k-002",
    guruId: "u-003",
    jadwal: "2026-07-08T10:00:00.000Z",
    durasi: 60,
    zoomMeetingId: "345 678 9012",
    zoomJoinUrl: "https://zoom.us/j/34567890123?pwd=dummypassword3",
    zoomStartUrl: "https://zoom.us/s/34567890123?zak=dummyzaktoken3",
    zoomPassword: "Biologi3",
    status: PertemuanStatus.TERJADWAL,
    createdAt: "2026-06-25T08:00:00.000Z",
    updatedAt: "2026-06-25T08:00:00.000Z",
  },
  {
    id: "ptm-004",
    judul: "Pertemuan Pengantar Semester Ganjil",
    kelasId: "k-001",
    guruId: "u-002",
    jadwal: "2026-06-20T08:00:00.000Z",
    durasi: 60,
    zoomMeetingId: "456 789 0123",
    zoomJoinUrl: "https://zoom.us/j/45678901234?pwd=dummypassword4",
    zoomStartUrl: "https://zoom.us/s/45678901234?zak=dummyzaktoken4",
    zoomPassword: "Pengantar4",
    status: PertemuanStatus.SELESAI,
    createdAt: "2026-06-15T08:00:00.000Z",
    updatedAt: "2026-06-15T08:00:00.000Z",
  },
];

let nextId = 5;

function toView(p: Pertemuan): PertemuanView {
  return {
    ...p,
    status: computeStatus(p.jadwal, p.durasi),
    kelasNama: KELAS_NAMA[p.kelasId] ?? p.kelasId,
    guruNama: GURU_NAMA[p.guruId] ?? p.guruId,
  };
}

export async function fetchPertemuanByGuru(guruId: string): Promise<PertemuanView[]> {
  return DUMMY_PERTEMUAN.filter((p) => p.guruId === guruId)
    .sort((a, b) => new Date(b.jadwal).getTime() - new Date(a.jadwal).getTime())
    .map(toView);
}

export async function fetchPertemuanForSiswa(siswaId: string): Promise<PertemuanView[]> {
  const kelasId = SISWA_KELAS_MAP[siswaId];
  if (!kelasId) return [];
  return DUMMY_PERTEMUAN.filter((p) => p.kelasId === kelasId)
    .sort((a, b) => new Date(b.jadwal).getTime() - new Date(a.jadwal).getTime())
    .map(toView);
}

export async function createPertemuanRequest(
  input: CreatePertemuanInput
): Promise<Pertemuan> {
  const now = new Date().toISOString();
  const meetingNum = Math.floor(10000000000 + Math.random() * 90000000000);
  const password = Math.random().toString(36).slice(2, 10);

  const pertemuan: Pertemuan = {
    id: `ptm-${String(nextId++).padStart(3, "0")}`,
    judul: input.judul,
    kelasId: input.kelasId,
    guruId: input.guruId,
    jadwal: input.jadwal,
    durasi: input.durasi,
    zoomMeetingId: String(meetingNum),
    zoomJoinUrl: `https://zoom.us/j/${meetingNum}?pwd=${password}`,
    zoomStartUrl: `https://zoom.us/s/${meetingNum}?zak=${crypto.randomUUID()}`,
    zoomPassword: password,
    status: computeStatus(input.jadwal, input.durasi),
    createdAt: now,
    updatedAt: now,
  };
  DUMMY_PERTEMUAN.push(pertemuan);
  return pertemuan;
}

export async function deletePertemuanRequest(id: string): Promise<boolean> {
  const before = DUMMY_PERTEMUAN.length;
  DUMMY_PERTEMUAN = DUMMY_PERTEMUAN.filter((p) => p.id !== id);
  return DUMMY_PERTEMUAN.length < before;
}
