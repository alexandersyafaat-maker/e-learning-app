import type {
  HasilLatihanNilai,
  SubmisiTugasNilai,
  NilaiSiswa,
  UpdateNilaiInput,
} from "../types/nilai.types";

const GURU_KELAS_MAP: Record<string, string[]> = {
  "u-002": ["k-001"],
  "u-003": ["k-002", "k-003"],
};

let DUMMY_HASIL_LATIHAN: HasilLatihanNilai[] = [
  {
    id: "hl-001",
    latihanId: "lat-001",
    latihanJudul: "Latihan Aljabar Dasar",
    siswaId: "u-004",
    siswaNama: "Andi Pratama",
    siswaEmail: "andi@siswa.com",
    kelasId: "k-001",
    kelasNama: "Kelas VII",
    jawaban: "1. x = 3\n2. y = 3\n3. z = 7\nPenjelasan: menggunakan operasi invers pada kedua ruas.",
    lampiran: [],
    nilai: 85,
    submittedAt: "2026-01-20T10:00:00.000Z",
    createdAt: "2026-01-20T10:00:00.000Z",
    updatedAt: "2026-01-20T10:00:00.000Z",
  },
  {
    id: "hl-002",
    latihanId: "lat-001",
    latihanJudul: "Latihan Aljabar Dasar",
    siswaId: "u-005",
    siswaNama: "Siti Rahayu",
    siswaEmail: "siti@siswa.com",
    kelasId: "k-001",
    kelasNama: "Kelas VII",
    jawaban: "1. x = 3\n2. y = 3 (ragu-ragu)\n3. z = 6 (salah)\nSaya masih bingung soal no 3.",
    lampiran: [],
    nilai: undefined,
    submittedAt: "2026-01-20T11:30:00.000Z",
    createdAt: "2026-01-20T11:30:00.000Z",
    updatedAt: "2026-01-20T11:30:00.000Z",
  },
  {
    id: "hl-003",
    latihanId: "lat-002",
    latihanJudul: "Latihan Fungsi Linear",
    siswaId: "u-004",
    siswaNama: "Andi Pratama",
    siswaEmail: "andi@siswa.com",
    kelasId: "k-001",
    kelasNama: "Kelas VII",
    jawaban: "f(x) = 2x+1, gradien = 2, titik potong y = 1. Grafik naik ke kanan.",
    lampiran: [],
    nilai: 92,
    submittedAt: "2026-02-05T09:00:00.000Z",
    createdAt: "2026-02-05T09:00:00.000Z",
    updatedAt: "2026-02-05T09:00:00.000Z",
  },
  {
    id: "hl-004",
    latihanId: "lat-003",
    latihanJudul: "Latihan Struktur Sel",
    siswaId: "u-006",
    siswaNama: "Reza Firmansyah",
    siswaEmail: "reza@siswa.com",
    kelasId: "k-002",
    kelasNama: "Kelas VIII",
    jawaban: "Sel prokariot tidak memiliki membran inti. Sel eukariot memiliki membran inti. Mitokondria = penghasil energi.",
    lampiran: [],
    nilai: 78,
    submittedAt: "2026-01-25T14:00:00.000Z",
    createdAt: "2026-01-25T14:00:00.000Z",
    updatedAt: "2026-01-25T14:00:00.000Z",
  },
];

let DUMMY_SUBMISI_TUGAS: SubmisiTugasNilai[] = [
  {
    id: "st-001",
    tugasId: "tgs-001",
    tugasJudul: "Tugas Persamaan Kuadrat",
    siswaId: "u-004",
    siswaNama: "Andi Pratama",
    siswaEmail: "andi@siswa.com",
    kelasId: "k-001",
    kelasNama: "Kelas VII",
    jawaban: "",
    catatan: "Terlampir di file PDF. Saya menggunakan metode faktorisasi dan rumus ABC.",
    lampiran: [],
    nilai: 90,
    submittedAt: "2026-02-10T08:00:00.000Z",
    createdAt: "2026-02-10T08:00:00.000Z",
    updatedAt: "2026-02-10T08:00:00.000Z",
  },
  {
    id: "st-002",
    tugasId: "tgs-001",
    tugasJudul: "Tugas Persamaan Kuadrat",
    siswaId: "u-005",
    siswaNama: "Siti Rahayu",
    siswaEmail: "siti@siswa.com",
    kelasId: "k-001",
    kelasNama: "Kelas VII",
    jawaban: "",
    catatan: "Saya mengerjakan semua soal tapi soal no 5 tidak yakin.",
    lampiran: [],
    nilai: undefined,
    submittedAt: "2026-02-10T15:00:00.000Z",
    createdAt: "2026-02-10T15:00:00.000Z",
    updatedAt: "2026-02-10T15:00:00.000Z",
  },
  {
    id: "st-003",
    tugasId: "tgs-002",
    tugasJudul: "Tugas Laporan Praktikum Sel",
    siswaId: "u-006",
    siswaNama: "Reza Firmansyah",
    siswaEmail: "reza@siswa.com",
    kelasId: "k-002",
    kelasNama: "Kelas VIII",
    jawaban: "",
    catatan: "Laporan observasi sel bawang merah menggunakan mikroskop. Hasil terlampir.",
    lampiran: [],
    nilai: 55,
    submittedAt: "2026-01-28T10:00:00.000Z",
    createdAt: "2026-01-28T10:00:00.000Z",
    updatedAt: "2026-01-28T10:00:00.000Z",
  },
];

export async function fetchHasilLatihanByGuru(guruId: string): Promise<HasilLatihanNilai[]> {
  const kelasList = GURU_KELAS_MAP[guruId] ?? [];
  return DUMMY_HASIL_LATIHAN.filter((h) => kelasList.includes(h.kelasId));
}

export async function fetchSubmisiTugasByGuru(guruId: string): Promise<SubmisiTugasNilai[]> {
  const kelasList = GURU_KELAS_MAP[guruId] ?? [];
  return DUMMY_SUBMISI_TUGAS.filter((s) => kelasList.includes(s.kelasId));
}

export async function updateHasilLatihanNilaiRequest(
  _latihanId: string,
  hasilId: string,
  input: UpdateNilaiInput
): Promise<void> {
  const idx = DUMMY_HASIL_LATIHAN.findIndex((h) => h.id === hasilId);
  if (idx === -1) throw new Error("Hasil latihan tidak ditemukan.");
  DUMMY_HASIL_LATIHAN[idx] = {
    ...DUMMY_HASIL_LATIHAN[idx],
    nilai: input.nilai,
    updatedAt: new Date().toISOString(),
  };
}

export async function updateSubmisiTugasNilaiRequest(
  _tugasId: string,
  submisiId: string,
  input: UpdateNilaiInput
): Promise<void> {
  const idx = DUMMY_SUBMISI_TUGAS.findIndex((s) => s.id === submisiId);
  if (idx === -1) throw new Error("Submisi tugas tidak ditemukan.");
  DUMMY_SUBMISI_TUGAS[idx] = {
    ...DUMMY_SUBMISI_TUGAS[idx],
    nilai: input.nilai,
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchNilaiSiswa(siswaId: string): Promise<NilaiSiswa> {
  return {
    latihan: DUMMY_HASIL_LATIHAN.filter((h) => h.siswaId === siswaId),
    tugas: DUMMY_SUBMISI_TUGAS.filter((s) => s.siswaId === siswaId),
  };
}
