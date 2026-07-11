import type { PesanObrolan, SendPesanInput } from "../types/obrolan.types";

let nextId = 20;

function genId(): string {
  return `msg-${String(nextId++).padStart(3, "0")}`;
}

let DUMMY_PESAN: PesanObrolan[] = [
  // mat-001 — Pengenalan Aljabar Dasar (Kelas VII, Guru Budi u-002)
  {
    id: "msg-001",
    materiId: "mat-001",
    userId: "u-002",
    userNama: "Budi Santoso",
    userRole: "GURU",
    teks: "Selamat pagi semua! Hari ini kita mulai materi Pengenalan Aljabar Dasar. Silakan dibaca dulu materinya, nanti ada latihan di bawah.",
    createdAt: "2026-06-20T07:30:00.000Z",
    updatedAt: "2026-06-20T07:30:00.000Z",
  },
  {
    id: "msg-002",
    materiId: "mat-001",
    userId: "u-004",
    userNama: "Siti Rahayu",
    userRole: "SISWA",
    teks: "Pak, saya masih bingung cara mengisolasi variabel x. Kalau ada konstanta di kiri dan kanan bagaimana?",
    createdAt: "2026-06-20T08:15:00.000Z",
    updatedAt: "2026-06-20T08:15:00.000Z",
  },
  {
    id: "msg-003",
    materiId: "mat-001",
    userId: "u-002",
    userNama: "Budi Santoso",
    userRole: "GURU",
    teks: "Siti, caranya pindahkan konstanta ke ruas lain dengan operasi invers. Contoh: 2x + 4 = 10 → 2x = 10 - 4 → 2x = 6 → x = 3. Paham?",
    createdAt: "2026-06-20T08:20:00.000Z",
    updatedAt: "2026-06-20T08:20:00.000Z",
  },
  {
    id: "msg-004",
    materiId: "mat-001",
    userId: "u-005",
    userNama: "Andi Wijaya",
    userRole: "SISWA",
    teks: "Pak, apakah ada contoh soal tambahan selain yang ada di materi? Saya ingin lebih banyak latihan.",
    createdAt: "2026-06-20T08:45:00.000Z",
    updatedAt: "2026-06-20T08:45:00.000Z",
  },
  {
    id: "msg-005",
    materiId: "mat-001",
    userId: "u-002",
    userNama: "Budi Santoso",
    userRole: "GURU",
    teks: "Andi, ada! Nanti saya upload di latihan. Untuk sekarang coba kerjakan soal-soal di bagian Latihan yang sudah saya buat.",
    createdAt: "2026-06-20T08:50:00.000Z",
    updatedAt: "2026-06-20T08:50:00.000Z",
  },
  {
    id: "msg-006",
    materiId: "mat-001",
    userId: "u-004",
    userNama: "Siti Rahayu",
    userRole: "SISWA",
    teks: "Terima kasih Pak, sekarang sudah mengerti!",
    createdAt: "2026-06-20T08:55:00.000Z",
    updatedAt: "2026-06-20T08:55:00.000Z",
  },

  // mat-002 — Fungsi dan Grafik (Kelas VII, Guru Budi u-002)
  {
    id: "msg-007",
    materiId: "mat-002",
    userId: "u-002",
    userNama: "Budi Santoso",
    userRole: "GURU",
    teks: "Untuk materi Fungsi dan Grafik, perhatikan baik-baik notasi f(x). Ini akan sering dipakai di materi berikutnya.",
    createdAt: "2026-06-22T08:00:00.000Z",
    updatedAt: "2026-06-22T08:00:00.000Z",
  },
  {
    id: "msg-008",
    materiId: "mat-002",
    userId: "u-004",
    userNama: "Siti Rahayu",
    userRole: "SISWA",
    teks: "Pak, apa perbedaan domain dan range?",
    createdAt: "2026-06-22T08:30:00.000Z",
    updatedAt: "2026-06-22T08:30:00.000Z",
  },
  {
    id: "msg-009",
    materiId: "mat-002",
    userId: "u-002",
    userNama: "Budi Santoso",
    userRole: "GURU",
    teks: "Domain = himpunan nilai x (input), Range = himpunan nilai f(x) (output). Contoh: f(x) = x+1, domain {1,2,3} → range {2,3,4}.",
    createdAt: "2026-06-22T08:35:00.000Z",
    updatedAt: "2026-06-22T08:35:00.000Z",
  },

  // mat-003 — Sel dan Struktur Sel (Kelas VIII, Guru u-003)
  {
    id: "msg-010",
    materiId: "mat-003",
    userId: "u-003",
    userNama: "Dewi Kurnia",
    userRole: "GURU",
    teks: "Halo Kelas VIII! Silakan baca materi Sel dan Struktur Sel. Kalau ada pertanyaan tanya di sini.",
    createdAt: "2026-06-21T07:00:00.000Z",
    updatedAt: "2026-06-21T07:00:00.000Z",
  },
  {
    id: "msg-011",
    materiId: "mat-003",
    userId: "u-005",
    userNama: "Andi Wijaya",
    userRole: "SISWA",
    teks: "Bu, apa perbedaan utama sel prokariot dan sel eukariot?",
    createdAt: "2026-06-21T09:10:00.000Z",
    updatedAt: "2026-06-21T09:10:00.000Z",
  },
  {
    id: "msg-012",
    materiId: "mat-003",
    userId: "u-003",
    userNama: "Dewi Kurnia",
    userRole: "GURU",
    teks: "Perbedaan utamanya: prokariot tidak punya membran inti (contoh: bakteri), eukariot punya membran inti (contoh: sel hewan dan tumbuhan). Sudah ada di materi ya.",
    createdAt: "2026-06-21T09:15:00.000Z",
    updatedAt: "2026-06-21T09:15:00.000Z",
  },
  {
    id: "msg-013",
    materiId: "mat-003",
    userId: "u-006",
    userNama: "Rini Susanti",
    userRole: "SISWA",
    teks: "Bu, fungsi mitokondria itu apa ya? Katanya ada hubungannya dengan energi?",
    createdAt: "2026-06-21T09:30:00.000Z",
    updatedAt: "2026-06-21T09:30:00.000Z",
  },
  {
    id: "msg-014",
    materiId: "mat-003",
    userId: "u-003",
    userNama: "Dewi Kurnia",
    userRole: "GURU",
    teks: "Betul Rini! Mitokondria dijuluki 'pembangkit tenaga sel' karena menghasilkan ATP (energi) melalui respirasi seluler.",
    createdAt: "2026-06-21T09:35:00.000Z",
    updatedAt: "2026-06-21T09:35:00.000Z",
  },
];

export async function fetchPesanByMateri(materiId: string): Promise<PesanObrolan[]> {
  return DUMMY_PESAN.filter((p) => p.materiId === materiId).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function sendPesanRequest(
  materiId: string,
  input: SendPesanInput
): Promise<PesanObrolan> {
  const now = new Date().toISOString();
  const pesan: PesanObrolan = {
    id: genId(),
    materiId,
    userId: input.userId,
    userNama: input.userNama,
    userRole: input.userRole,
    teks: input.teks,
    createdAt: now,
    updatedAt: now,
  };
  DUMMY_PESAN.push(pesan);
  return pesan;
}
