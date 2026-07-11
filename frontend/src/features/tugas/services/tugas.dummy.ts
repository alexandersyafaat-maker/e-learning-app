import type {
  Tugas,
  TugasView,
  TugasWithStatus,
  SubmisiTugas,
  SubmisiTugasView,
  CreateTugasInput,
  UpdateTugasInput,
  SubmitTugasInput,
} from "../types/tugas.types";

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

let DUMMY_TUGAS: Tugas[] = [
  {
    id: "tgs-001",
    judul: "Tugas Aljabar â€” Persamaan Linear",
    deskripsi: "Buat rangkuman materi persamaan linear satu variabel minimal 2 halaman.\n\nKetentuan:\n- Tulis tangan atau ketik, foto/scan lalu kumpulkan\n- Sertakan minimal 5 contoh soal beserta penyelesaiannya\n- Deadline: 10 Juli 2026\n\nKumpulkan dalam format PDF atau foto yang jelas.",
    kelasId: "k-001",
    guruId: "u-002",
    deadline: "2026-07-10T23:59:00.000Z",
    lampiran: [
      { id: "lmp-t01", nama: "panduan-tugas.pdf", ukuran: 102400, tipe: "application/pdf", url: "/uploads/panduan-tugas.pdf" },
    ],
    createdAt: "2026-06-18T08:00:00.000Z",
    updatedAt: "2026-06-18T08:00:00.000Z",
  },
  {
    id: "tgs-002",
    judul: "Tugas Fungsi â€” Membuat Grafik",
    deskripsi: "Gambar grafik dari 3 fungsi berbeda yang telah dipelajari:\n1. f(x) = x + 2\n2. g(x) = xÂ² - 1\n3. h(x) = 2x - 3\n\nGambar pada kertas millimeter blok, beri keterangan lengkap, lalu foto dengan jelas.\n\nKumpulkan dalam format gambar (JPG/PNG) atau PDF.",
    kelasId: "k-001",
    guruId: "u-002",
    deadline: "2026-07-20T23:59:00.000Z",
    lampiran: [],
    createdAt: "2026-06-23T08:00:00.000Z",
    updatedAt: "2026-06-23T08:00:00.000Z",
  },
  {
    id: "tgs-003",
    judul: "Tugas Biologi â€” Laporan Pengamatan Sel",
    deskripsi: "Buat laporan pengamatan sel bawang merah menggunakan mikroskop.\n\nIsi laporan:\n1. Tujuan pengamatan\n2. Alat dan bahan\n3. Langkah kerja\n4. Hasil pengamatan (gambar sel + keterangan)\n5. Kesimpulan\n\nFoto laporan atau scan, kumpulkan dalam PDF.",
    kelasId: "k-002",
    guruId: "u-003",
    deadline: "2026-07-15T23:59:00.000Z",
    lampiran: [],
    createdAt: "2026-06-19T08:00:00.000Z",
    updatedAt: "2026-06-19T08:00:00.000Z",
  },
];

let DUMMY_SUBMISI: SubmisiTugas[] = [
  {
    id: "st-001",
    tugasId: "tgs-001",
    siswaId: "u-004",
    catatan: "Terlampir rangkuman materi persamaan linear yang sudah saya buat.",
    lampiran: [
      { id: "lmp-st01", nama: "rangkuman-aljabar-siti.pdf", ukuran: 307200, tipe: "application/pdf", url: "/uploads/rangkuman-aljabar-siti.pdf" },
    ],
    submittedAt: "2026-06-26T09:00:00.000Z",
    createdAt: "2026-06-26T09:00:00.000Z",
    updatedAt: "2026-06-26T09:00:00.000Z",
  },
];

let nextTugasId = 4;
let nextSubmisiId = 2;

function toView(t: Tugas): TugasView {
  return {
    ...t,
    kelasNama: KELAS_NAMA[t.kelasId] ?? t.kelasId,
    guruNama: GURU_NAMA[t.guruId] ?? t.guruId,
  };
}

export async function fetchTugasByGuru(guruId: string): Promise<TugasView[]> {
  return DUMMY_TUGAS.filter((t) => t.guruId === guruId).map(toView);
}

export async function fetchTugasForSiswa(siswaId: string): Promise<TugasWithStatus[]> {
  const kelasId = SISWA_KELAS_MAP[siswaId];
  if (!kelasId) return [];
  return DUMMY_TUGAS.filter((t) => t.kelasId === kelasId).map((t) => ({
    ...toView(t),
    submisi: DUMMY_SUBMISI.find((s) => s.tugasId === t.id && s.siswaId === siswaId) ?? null,
  }));
}

export async function fetchTugasById(id: string): Promise<TugasView | null> {
  const t = DUMMY_TUGAS.find((t) => t.id === id);
  return t ? toView(t) : null;
}

export async function fetchSubmisiBySiswa(
  tugasId: string,
  siswaId: string
): Promise<SubmisiTugas | null> {
  return DUMMY_SUBMISI.find((s) => s.tugasId === tugasId && s.siswaId === siswaId) ?? null;
}

export async function fetchSubmisiByTugas(tugasId: string): Promise<SubmisiTugasView[]> {
  return DUMMY_SUBMISI.filter((s) => s.tugasId === tugasId).map((s) => ({
    ...s,
    siswaNama: SISWA_INFO[s.siswaId]?.nama ?? s.siswaId,
    siswaEmail: SISWA_INFO[s.siswaId]?.email ?? "",
  }));
}

export async function createTugasRequest(input: CreateTugasInput): Promise<Tugas> {
  const now = new Date().toISOString();
  const tugas: Tugas = {
    id: `tgs-${String(nextTugasId++).padStart(3, "0")}`,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  DUMMY_TUGAS.push(tugas);
  return tugas;
}

export async function updateTugasRequest(
  id: string,
  input: UpdateTugasInput
): Promise<Tugas | null> {
  const idx = DUMMY_TUGAS.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  DUMMY_TUGAS[idx] = { ...DUMMY_TUGAS[idx], ...input, updatedAt: new Date().toISOString() };
  return DUMMY_TUGAS[idx];
}

export async function deleteTugasRequest(id: string): Promise<boolean> {
  const before = DUMMY_TUGAS.length;
  DUMMY_TUGAS = DUMMY_TUGAS.filter((t) => t.id !== id);
  return DUMMY_TUGAS.length < before;
}

export async function submitTugasRequest(input: SubmitTugasInput): Promise<SubmisiTugas> {
  const now = new Date().toISOString();
  const submisi: SubmisiTugas = {
    id: `st-${String(nextSubmisiId++).padStart(3, "0")}`,
    ...input,
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  DUMMY_SUBMISI.push(submisi);
  return submisi;
}
