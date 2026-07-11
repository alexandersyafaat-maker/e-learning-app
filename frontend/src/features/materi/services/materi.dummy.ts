import type {
  Materi,
  MateriView,
  CreateMateriInput,
  UpdateMateriInput,
} from "../types/materi.types";

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

let DUMMY_MATERI: Materi[] = [
  {
    id: "mat-001",
    judul: "Pengenalan Aljabar Dasar",
    konten: `Aljabar adalah cabang matematika yang menggunakan simbol dan aturan untuk memanipulasi simbol-simbol tersebut.\n\nKonsep Dasar:\n- Variabel: simbol yang mewakili nilai yang tidak diketahui (contoh: x, y, z)\n- Ekspresi aljabar: kombinasi variabel, konstanta, dan operasi matematika\n- Persamaan: pernyataan bahwa dua ekspresi memiliki nilai yang sama\n\nContoh Soal:\nJika x + 5 = 12, maka x = ?\n\nPenyelesaian:\nx = 12 - 5\nx = 7\n\nLatihan:\n1. Selesaikan: 2x + 4 = 10\n2. Selesaikan: 3y - 9 = 0\n3. Tentukan nilai z jika 5z = 35`,
    kelasId: "k-001",
    guruId: "u-002",
    lampiran: [
      { id: "lmp-001", nama: "materi-aljabar.pdf", ukuran: 204800, tipe: "application/pdf", url: "/uploads/materi-aljabar.pdf" },
    ],
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "mat-002",
    judul: "Fungsi dan Grafik",
    konten: `Fungsi adalah aturan yang menghubungkan setiap elemen dari himpunan domain ke tepat satu elemen himpunan kodomain.\n\nNotasi Fungsi:\nf(x) = 2x + 1\n\nArtinya: untuk setiap nilai x, nilai f(x) adalah dua kali x ditambah 1.\n\nContoh:\n- f(0) = 2(0) + 1 = 1\n- f(2) = 2(2) + 1 = 5\n- f(-1) = 2(-1) + 1 = -1\n\nGrafik Fungsi Linear:\nGrafik f(x) = 2x + 1 adalah garis lurus dengan:\n- Gradien (kemiringan) = 2\n- Titik potong sumbu y = 1`,
    kelasId: "k-001",
    guruId: "u-002",
    lampiran: [
      { id: "lmp-002", nama: "grafik-fungsi.png", ukuran: 512000, tipe: "image/png", url: "/uploads/grafik-fungsi.png" },
      { id: "lmp-003", nama: "penjelasan-fungsi.mp4", ukuran: 10485760, tipe: "video/mp4", url: "/uploads/penjelasan-fungsi.mp4" },
    ],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "mat-003",
    judul: "Sel dan Struktur Sel",
    konten: `Sel adalah unit terkecil kehidupan yang mampu melakukan semua proses kehidupan dasar.\n\nJenis Sel:\n1. Sel Prokariot â€” tidak memiliki membran inti\n   Contoh: bakteri, arkea\n\n2. Sel Eukariot â€” memiliki membran inti\n   Contoh: sel hewan, sel tumbuhan, sel jamur\n\nOrganela Sel Hewan:\n- Inti sel (nukleus): pusat kendali sel\n- Mitokondria: menghasilkan energi (ATP)\n- Ribosom: sintesis protein\n- Retikulum endoplasma: transportasi zat\n- Badan Golgi: modifikasi dan pengemasan protein\n- Lisosom: pencernaan intraseluler\n\nPerbedaan Sel Hewan dan Sel Tumbuhan:\nSel tumbuhan memiliki dinding sel, vakuola besar, dan kloroplas, sedangkan sel hewan tidak.`,
    kelasId: "k-002",
    guruId: "u-003",
    lampiran: [],
    createdAt: "2026-01-12T08:00:00.000Z",
    updatedAt: "2026-01-12T08:00:00.000Z",
  },
  {
    id: "mat-004",
    judul: "Turunan Fungsi",
    konten: `Turunan (diferensial) adalah ukuran seberapa cepat suatu fungsi berubah terhadap variabel independennya.\n\nDefinisi:\nf'(x) = lim[hâ†’0] (f(x+h) - f(x)) / h\n\nAturan Dasar Turunan:\n1. Turunan konstanta: d/dx (c) = 0\n2. Turunan pangkat: d/dx (xâ¿) = nÂ·xâ¿â»Â¹\n3. Aturan penjumlahan: (f + g)' = f' + g'\n4. Aturan perkalian: (fg)' = f'g + fg'\n\nContoh:\nf(x) = 3xÂ² + 2x + 5\nf'(x) = 6x + 2`,
    kelasId: "k-003",
    guruId: "u-002",
    lampiran: [],
    createdAt: "2026-01-20T08:00:00.000Z",
    updatedAt: "2026-01-20T08:00:00.000Z",
  },
];

let nextMateriId = 5;
let nextLampiranId = 4;

function toView(m: Materi): MateriView {
  return {
    ...m,
    kelasNama: KELAS_NAMA[m.kelasId] ?? m.kelasId,
    guruNama: GURU_NAMA[m.guruId] ?? m.guruId,
  };
}

export async function fetchMateriByGuru(guruId: string): Promise<MateriView[]> {
  return DUMMY_MATERI.filter((m) => m.guruId === guruId).map(toView);
}

export async function fetchMateriForSiswa(siswaId: string): Promise<MateriView[]> {
  const kelasId = SISWA_KELAS_MAP[siswaId];
  if (!kelasId) return [];
  return DUMMY_MATERI.filter((m) => m.kelasId === kelasId).map(toView);
}

export async function fetchMateriById(id: string): Promise<MateriView | null> {
  const m = DUMMY_MATERI.find((m) => m.id === id);
  return m ? toView(m) : null;
}

export async function createMateriRequest(input: CreateMateriInput): Promise<Materi> {
  const now = new Date().toISOString();
  const materi: Materi = {
    id: `mat-${String(nextMateriId++).padStart(3, "0")}`,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  DUMMY_MATERI.push(materi);
  return materi;
}

export async function updateMateriRequest(
  id: string,
  input: UpdateMateriInput
): Promise<Materi | null> {
  const idx = DUMMY_MATERI.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  DUMMY_MATERI[idx] = {
    ...DUMMY_MATERI[idx],
    judul: input.judul,
    konten: input.konten,
    kelasId: input.kelasId,
    lampiran: input.lampiran,
    updatedAt: new Date().toISOString(),
  };
  return DUMMY_MATERI[idx];
}

export async function deleteMateriRequest(id: string): Promise<boolean> {
  const before = DUMMY_MATERI.length;
  DUMMY_MATERI = DUMMY_MATERI.filter((m) => m.id !== id);
  return DUMMY_MATERI.length < before;
}

export function generateLampiranId(): string {
  return `lmp-${String(nextLampiranId++).padStart(3, "0")}`;
}
