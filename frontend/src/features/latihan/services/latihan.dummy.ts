import type {
  Latihan,
  LatihanView,
  LatihanWithStatus,
  HasilLatihan,
  HasilLatihanView,
  CreateLatihanInput,
  UpdateLatihanInput,
  SubmitLatihanInput,
} from "../types/latihan.types";

const KELAS_NAMA: Record<string, string> = {
  "k-001": "Kelas VII",
  "k-002": "Kelas VIII",
  "k-003": "Kelas IX",
};

const GURU_NAMA: Record<string, string> = {
  "u-002": "Budi Santoso",
  "u-003": "Dewi Kurnia",
};

const SISWA_INFO: Record<string, { nama: string; email: string }> = {
  "u-004": { nama: "Siti Rahayu", email: "siti@example.com" },
  "u-005": { nama: "Andi Wijaya", email: "andi@example.com" },
  "u-006": { nama: "Rini Susanti", email: "rini@example.com" },
};

const SISWA_KELAS_MAP: Record<string, string> = {
  "u-004": "k-001",
  "u-005": "k-002",
  "u-006": "k-003",
};

let DUMMY_LATIHAN: Latihan[] = [
  {
    id: "lat-001",
    judul: "Latihan Aljabar Bab 1",
    deskripsi: "Kerjakan soal-soal berikut dengan menunjukkan langkah penyelesaian:\n\n1. Selesaikan persamaan: 3x + 7 = 22\n2. Tentukan nilai y jika 2y - 4 = 10\n3. Sederhanakan: 4(x + 3) - 2(x - 1)\n4. Selesaikan sistem persamaan:\n   x + y = 10\n   x - y = 4\n\nTuliskan jawaban Anda dengan jelas. Bisa melampirkan foto coretan/hitungan Anda.",
    kelasId: "k-001",
    guruId: "u-002",
    deadline: "2026-07-10T23:59:00.000Z",
    lampiran: [
      { id: "lmp-l01", nama: "soal-latihan-1.pdf", ukuran: 153600, tipe: "application/pdf", url: "/uploads/soal-latihan-1.pdf" },
    ],
    createdAt: "2026-06-20T08:00:00.000Z",
    updatedAt: "2026-06-20T08:00:00.000Z",
  },
  {
    id: "lat-002",
    judul: "Latihan Fungsi Bab 2",
    deskripsi: "Kerjakan soal fungsi berikut:\n\n1. Diketahui f(x) = 2x + 3. Tentukan f(4) dan f(-2).\n2. Gambarkan grafik g(x) = xÂ² - 4 untuk x = -3 sampai x = 3.\n3. Tentukan domain dan range dari h(x) = 1/(x-2).\n\nBoleh melampirkan foto gambar grafik hasil kerjaan Anda.",
    kelasId: "k-001",
    guruId: "u-002",
    deadline: "2026-07-17T23:59:00.000Z",
    lampiran: [],
    createdAt: "2026-06-22T08:00:00.000Z",
    updatedAt: "2026-06-22T08:00:00.000Z",
  },
  {
    id: "lat-003",
    judul: "Latihan Biologi Sel",
    deskripsi: "Jawab pertanyaan berikut berdasarkan materi sel:\n\n1. Sebutkan 5 perbedaan sel hewan dan sel tumbuhan!\n2. Jelaskan fungsi mitokondria dalam sel!\n3. Apa yang dimaksud dengan membran semipermeabel?\n4. Gambarkan struktur sel hewan beserta keterangannya.\n\nGambar bisa difoto dan dilampirkan.",
    kelasId: "k-002",
    guruId: "u-003",
    deadline: "2026-07-12T23:59:00.000Z",
    lampiran: [],
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
  },
];

let DUMMY_HASIL: HasilLatihan[] = [
  {
    id: "hl-001",
    latihanId: "lat-001",
    siswaId: "u-004",
    jawaban: "1. 3x = 22 - 7 = 15, x = 5\n2. 2y = 14, y = 7\n3. 4x + 12 - 2x + 2 = 2x + 14\n4. Dari persamaan: x = 7, y = 3",
    lampiran: [
      { id: "lmp-hl01", nama: "foto-jawaban.jpg", ukuran: 204800, tipe: "image/jpeg", url: "/uploads/foto-jawaban.jpg" },
    ],
    submittedAt: "2026-06-25T10:30:00.000Z",
    createdAt: "2026-06-25T10:30:00.000Z",
    updatedAt: "2026-06-25T10:30:00.000Z",
  },
];

let nextLatihanId = 4;
let nextHasilId = 2;

function toView(l: Latihan): LatihanView {
  return {
    ...l,
    kelasNama: KELAS_NAMA[l.kelasId] ?? l.kelasId,
    guruNama: GURU_NAMA[l.guruId] ?? l.guruId,
  };
}

export async function fetchLatihanByGuru(guruId: string): Promise<LatihanView[]> {
  return DUMMY_LATIHAN.filter((l) => l.guruId === guruId).map(toView);
}

export async function fetchLatihanForSiswa(siswaId: string): Promise<LatihanWithStatus[]> {
  const kelasId = SISWA_KELAS_MAP[siswaId];
  if (!kelasId) return [];
  return DUMMY_LATIHAN.filter((l) => l.kelasId === kelasId).map((l) => ({
    ...toView(l),
    hasilLatihan: DUMMY_HASIL.find((h) => h.latihanId === l.id && h.siswaId === siswaId) ?? null,
  }));
}

export async function fetchLatihanById(id: string): Promise<LatihanView | null> {
  const l = DUMMY_LATIHAN.find((l) => l.id === id);
  return l ? toView(l) : null;
}

export async function fetchHasilBySiswa(
  latihanId: string,
  siswaId: string
): Promise<HasilLatihan | null> {
  return DUMMY_HASIL.find((h) => h.latihanId === latihanId && h.siswaId === siswaId) ?? null;
}

export async function fetchHasilByLatihan(latihanId: string): Promise<HasilLatihanView[]> {
  return DUMMY_HASIL.filter((h) => h.latihanId === latihanId).map((h) => ({
    ...h,
    siswaNama: SISWA_INFO[h.siswaId]?.nama ?? h.siswaId,
    siswaEmail: SISWA_INFO[h.siswaId]?.email ?? "",
  }));
}

export async function createLatihanRequest(input: CreateLatihanInput): Promise<Latihan> {
  const now = new Date().toISOString();
  const latihan: Latihan = {
    id: `lat-${String(nextLatihanId++).padStart(3, "0")}`,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  DUMMY_LATIHAN.push(latihan);
  return latihan;
}

export async function updateLatihanRequest(
  id: string,
  input: UpdateLatihanInput
): Promise<Latihan | null> {
  const idx = DUMMY_LATIHAN.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  DUMMY_LATIHAN[idx] = { ...DUMMY_LATIHAN[idx], ...input, updatedAt: new Date().toISOString() };
  return DUMMY_LATIHAN[idx];
}

export async function deleteLatihanRequest(id: string): Promise<boolean> {
  const before = DUMMY_LATIHAN.length;
  DUMMY_LATIHAN = DUMMY_LATIHAN.filter((l) => l.id !== id);
  return DUMMY_LATIHAN.length < before;
}

export async function submitLatihanRequest(input: SubmitLatihanInput): Promise<HasilLatihan> {
  const now = new Date().toISOString();
  const hasil: HasilLatihan = {
    id: `hl-${String(nextHasilId++).padStart(3, "0")}`,
    ...input,
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  DUMMY_HASIL.push(hasil);
  return hasil;
}
