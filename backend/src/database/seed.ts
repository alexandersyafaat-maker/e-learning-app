import { randomUUID } from 'crypto';
import { isProd } from '@/config/env'; // validate env first
import { connectDatabase, disconnectDatabase } from '@/config/database';
import { logger } from '@/config/logger';
import { hashPassword } from '@/utils/password';
import { UserModel, UserDocument } from '@/modules/auth/user.model';
import { KelasModel, KelasDocument } from '@/modules/kelas/kelas.model';
import { MateriModel, MateriDocument, ILampiran } from '@/modules/materi/materi.model';
import {
  LatihanModel,
  LatihanDocument,
  HasilLatihanModel,
  IHasilLatihan,
} from '@/modules/latihan/latihan.model';
import {
  TugasModel,
  TugasDocument,
  SubmisiTugasModel,
  ISubmisiTugas,
} from '@/modules/tugas/tugas.model';
import { PertemuanModel, IPertemuan } from '@/modules/pertemuan/pertemuan.model';
import {
  VocabCardModel,
  VocabCardDocument,
  IVocabCard,
  SRSProgressModel,
  ISRSProgress,
} from '@/modules/vocab/vocab.model';
import { ObrolanModel, IObrolan } from '@/modules/obrolan/obrolan.model';

type SeedInput<T> = Omit<T, 'id' | '_id' | 'createdAt' | 'updatedAt'>;

// Default password untuk semua akun seed (dev only).
const DEFAULT_PASSWORD = 'password123';

const DAY_MS = 24 * 60 * 60 * 1000;
const addDays = (days: number): Date => new Date(Date.now() + days * DAY_MS);

const lampiranPdf = (nama: string): ILampiran => ({
  id: randomUUID(),
  nama,
  ukuran: 245_000,
  tipe: 'application/pdf',
  url: `https://storage.elearning.id/lampiran/${encodeURIComponent(nama)}`,
});

async function assertSafeToSeed(): Promise<void> {
  if (!isProd) return;

  const counts = await Promise.all([
    UserModel.countDocuments(),
    KelasModel.countDocuments(),
    MateriModel.countDocuments(),
    LatihanModel.countDocuments(),
    HasilLatihanModel.countDocuments(),
    TugasModel.countDocuments(),
    SubmisiTugasModel.countDocuments(),
    PertemuanModel.countDocuments(),
    VocabCardModel.countDocuments(),
    SRSProgressModel.countDocuments(),
    ObrolanModel.countDocuments(),
  ]);
  const total = counts.reduce((a, b) => a + b, 0);

  if (total > 0) {
    throw new Error(
      `[seed] Database production sudah berisi ${total} dokumen — seed dibatalkan untuk mencegah menghapus data production. ` +
        'Seed cuma boleh jalan di database kosong (first deploy).',
    );
  }
}

async function seed(): Promise<void> {
  await connectDatabase();
  await assertSafeToSeed();

  logger.info('[seed] Clearing existing collections...');
  await Promise.all([
    UserModel.deleteMany({}),
    KelasModel.deleteMany({}),
    MateriModel.deleteMany({}),
    LatihanModel.deleteMany({}),
    HasilLatihanModel.deleteMany({}),
    TugasModel.deleteMany({}),
    SubmisiTugasModel.deleteMany({}),
    PertemuanModel.deleteMany({}),
    VocabCardModel.deleteMany({}),
    SRSProgressModel.deleteMany({}),
    ObrolanModel.deleteMany({}),
  ]);

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  // ── Kelas ─────────────────────────────────────────────────
  logger.info('[seed] Creating kelas...');
  const [kelasVII, kelasVIII, kelasIX]: KelasDocument[] = await KelasModel.create([
    { nama: 'VII-1', tingkat: 'VII', tahunAjaran: '2025/2026', deskripsi: 'Kelas VII SMP' },
    { nama: 'VIII-1', tingkat: 'VIII', tahunAjaran: '2025/2026', deskripsi: 'Kelas VIII SMP' },
    { nama: 'IX-1', tingkat: 'IX', tahunAjaran: '2025/2026', deskripsi: 'Kelas IX SMP' },
  ]);

  // ── Users ─────────────────────────────────────────────────
  logger.info('[seed] Creating users...');
  const [
    admin,
    guru1,
    guru2,
    siswaVII1,
    siswaVII2,
    siswaVIII1,
    siswaVIII2,
    siswaIX1,
    siswaIX2,
  ]: UserDocument[] = await UserModel.create([
    { name: 'Admin Sekolah', email: 'admin@elearning.id', password: passwordHash, role: 'ADMIN' },
    {
      name: 'Budi Santoso',
      email: 'budi.guru@elearning.id',
      password: passwordHash,
      role: 'GURU',
      nik: '3201012345670001',
    },
    {
      name: 'Siti Aminah',
      email: 'siti.guru@elearning.id',
      password: passwordHash,
      role: 'GURU',
      nik: '3201012345670002',
    },
    {
      name: 'Andi Pratama',
      email: 'andi.siswa@elearning.id',
      password: passwordHash,
      role: 'SISWA',
      nisn: '0051234561',
      kelasId: String(kelasVII.id),
    },
    {
      name: 'Dewi Lestari',
      email: 'dewi.siswa@elearning.id',
      password: passwordHash,
      role: 'SISWA',
      nisn: '0051234562',
      kelasId: String(kelasVII.id),
    },
    {
      name: 'Rizki Hidayat',
      email: 'rizki.siswa@elearning.id',
      password: passwordHash,
      role: 'SISWA',
      nisn: '0051234563',
      kelasId: String(kelasVIII.id),
    },
    {
      name: 'Putri Wulandari',
      email: 'putri.siswa@elearning.id',
      password: passwordHash,
      role: 'SISWA',
      nisn: '0051234564',
      kelasId: String(kelasVIII.id),
    },
    {
      name: 'Fajar Nugroho',
      email: 'fajar.siswa@elearning.id',
      password: passwordHash,
      role: 'SISWA',
      nisn: '0051234565',
      kelasId: String(kelasIX.id),
    },
    {
      name: 'Ayu Kusuma',
      email: 'ayu.siswa@elearning.id',
      password: passwordHash,
      role: 'SISWA',
      nisn: '0051234566',
      kelasId: String(kelasIX.id),
    },
  ]);

  // guru1 = wali kelas VII & VIII, guru2 = wali kelas VIII & IX (tim mengajar)
  const kelasByGuru1 = [kelasVII, kelasVIII];
  const kelasByGuru2 = [kelasVIII, kelasIX];

  // ── Materi ────────────────────────────────────────────────
  logger.info('[seed] Creating materi...');
  const materiDocs: MateriDocument[] = await MateriModel.create([
    {
      judul: 'Simple Present Tense',
      konten: '<p>Simple present tense digunakan untuk kebiasaan dan fakta umum.</p>',
      kelasId: String(kelasVII.id),
      guruId: String(guru1.id),
      lampiran: [lampiranPdf('simple-present-tense.pdf')],
    },
    {
      judul: 'Narrative Text',
      konten: '<p>Struktur narrative text: orientation, complication, resolution.</p>',
      kelasId: String(kelasVIII.id),
      guruId: String(guru1.id),
      lampiran: [],
    },
    {
      judul: 'Descriptive Text',
      konten: '<p>Descriptive text menggambarkan orang, tempat, atau benda secara rinci.</p>',
      kelasId: String(kelasVIII.id),
      guruId: String(guru2.id),
      lampiran: [lampiranPdf('descriptive-text.pdf')],
    },
    {
      judul: 'Report Text',
      konten: '<p>Report text menyajikan informasi umum tentang suatu fenomena.</p>',
      kelasId: String(kelasIX.id),
      guruId: String(guru2.id),
      lampiran: [],
    },
  ]);
  const [materiPresentTense, materiNarrative] = materiDocs;

  // ── Latihan + HasilLatihan ────────────────────────────────
  logger.info('[seed] Creating latihan...');
  const [latihanVII, latihanVIII]: LatihanDocument[] = await LatihanModel.create([
    {
      judul: 'Latihan Simple Present Tense',
      deskripsi: 'Kerjakan 10 soal pilihan ganda tentang simple present tense.',
      kelasId: String(kelasVII.id),
      guruId: String(guru1.id),
      deadline: addDays(7),
      lampiran: [],
    },
    {
      judul: 'Latihan Narrative Text',
      deskripsi: 'Identifikasi struktur narrative text dari cerpen yang diberikan.',
      kelasId: String(kelasVIII.id),
      guruId: String(guru1.id),
      deadline: addDays(-2), // sudah lewat deadline — uji status telat
      lampiran: [],
    },
  ]);

  const hasilLatihanSeeds: SeedInput<IHasilLatihan>[] = [
    // siswaVII1 sudah submit & sudah dinilai
    {
      latihanId: String(latihanVII.id),
      siswaId: String(siswaVII1.id),
      jawaban: 'A, C, B, A, D, B, C, A, D, B',
      lampiran: [],
      nilai: 90,
      submittedAt: addDays(-1),
    },
    // siswaVII2 sudah submit tapi belum dinilai guru
    {
      latihanId: String(latihanVII.id),
      siswaId: String(siswaVII2.id),
      jawaban: 'A, B, B, A, D, C, C, A, D, B',
      lampiran: [],
      submittedAt: addDays(0),
    },
    // siswaVIII1 submit telat (setelah deadline)
    {
      latihanId: String(latihanVIII.id),
      siswaId: String(siswaVIII1.id),
      jawaban: 'Orientation: ..., Complication: ..., Resolution: ...',
      lampiran: [],
      nilai: 75,
      submittedAt: addDays(-1),
    },
    // siswaVIII2 belum submit sama sekali → LatihanWithStatus.hasilLatihan = null
  ];
  await HasilLatihanModel.create(hasilLatihanSeeds);

  // ── Tugas + SubmisiTugas ──────────────────────────────────
  logger.info('[seed] Creating tugas...');
  const [tugasVII, tugasIX]: TugasDocument[] = await TugasModel.create([
    {
      judul: 'Tugas Membuat Kalimat Simple Present',
      deskripsi: 'Buat 5 kalimat simple present tense tentang rutinitas harianmu.',
      kelasId: String(kelasVII.id),
      guruId: String(guru1.id),
      deadline: addDays(10),
      lampiran: [],
    },
    {
      judul: 'Tugas Report Text',
      deskripsi: 'Tulis report text tentang fenomena alam pilihanmu, minimal 200 kata.',
      kelasId: String(kelasIX.id),
      guruId: String(guru2.id),
      deadline: addDays(5),
      lampiran: [],
    },
  ]);

  const submisiTugasSeeds: SeedInput<ISubmisiTugas>[] = [
    // siswaVII1 sudah kumpul & sudah dinilai
    {
      tugasId: String(tugasVII.id),
      siswaId: String(siswaVII1.id),
      jawaban:
        'I wake up at 6 AM. I brush my teeth. I eat breakfast. I go to school. I study every day.',
      catatan: 'Mohon dikoreksi grammar-nya, Pak.',
      lampiran: [lampiranPdf('tugas-andi.pdf')],
      nilai: 88,
      submittedAt: addDays(-3),
    },
    // siswaVII2 belum kumpul → TugasWithStatus.submisi = null
    // siswaIX1 sudah kumpul, belum dinilai
    {
      tugasId: String(tugasIX.id),
      siswaId: String(siswaIX1.id),
      jawaban: 'Report text tentang gunung berapi...',
      catatan: '',
      lampiran: [],
      submittedAt: addDays(-1),
    },
  ];
  await SubmisiTugasModel.create(submisiTugasSeeds);

  // ── Pertemuan Virtual (Zoom) ──────────────────────────────
  logger.info('[seed] Creating pertemuan...');
  const pertemuanSeeds: SeedInput<IPertemuan>[] = [
    {
      // status: SELESAI (sudah lewat jadwal + durasi)
      judul: 'Kelas VII - Review Simple Present Tense',
      kelasId: String(kelasVII.id),
      guruId: String(guru1.id),
      jadwal: addDays(-3),
      durasi: 60,
      zoomMeetingId: '81234567890',
      zoomJoinUrl: 'https://zoom.us/j/81234567890?pwd=seedjoin1',
      zoomStartUrl: 'https://zoom.us/s/81234567890?zak=seedstart1',
      zoomPassword: '123456',
    },
    {
      // status: BERLANGSUNG (jadwal sudah lewat, durasi belum habis)
      judul: 'Kelas VIII - Diskusi Narrative Text',
      kelasId: String(kelasVIII.id),
      guruId: String(guru1.id),
      jadwal: new Date(Date.now() - 15 * 60 * 1000),
      durasi: 60,
      zoomMeetingId: '81234567891',
      zoomJoinUrl: 'https://zoom.us/j/81234567891?pwd=seedjoin2',
      zoomStartUrl: 'https://zoom.us/s/81234567891?zak=seedstart2',
      zoomPassword: '123456',
    },
    {
      // status: TERJADWAL (belum mulai)
      judul: 'Kelas IX - Pembahasan Report Text',
      kelasId: String(kelasIX.id),
      guruId: String(guru2.id),
      jadwal: addDays(3),
      durasi: 90,
      zoomMeetingId: '81234567892',
      zoomJoinUrl: 'https://zoom.us/j/81234567892?pwd=seedjoin3',
      zoomStartUrl: 'https://zoom.us/s/81234567892?zak=seedstart3',
      zoomPassword: '123456',
    },
  ];
  await PertemuanModel.create(pertemuanSeeds);

  // ── Vocab SRS ─────────────────────────────────────────────
  logger.info('[seed] Creating vocab cards...');
  const vocabCardSeeds: SeedInput<IVocabCard>[] = [
    {
      word: 'achieve',
      translation: 'mencapai',
      definition: 'to successfully complete something or reach a goal',
      example: 'She achieved her goal of becoming a doctor.',
      v1: 'achieve',
      v2: 'achieved',
      v3: 'achieved',
      ving: 'achieving',
      vs: 'achieves',
      kelasId: String(kelasVII.id),
      guruId: String(guru1.id),
    },
    {
      word: 'benevolent',
      translation: 'baik hati',
      definition: 'kind and helpful',
      example: 'The benevolent teacher helped every struggling student.',
      kelasId: String(kelasVII.id),
      guruId: String(guru1.id),
    },
    {
      word: 'candid',
      translation: 'jujur/terus terang',
      definition: 'truthful and straightforward',
      example: 'He gave a candid answer about his mistake.',
      kelasId: String(kelasVIII.id),
      guruId: String(guru2.id),
    },
    {
      word: 'diligent',
      translation: 'rajin/tekun',
      definition: 'showing care and effort in work or duties',
      example: 'She is a diligent student who never misses homework.',
      kelasId: String(kelasVIII.id),
      guruId: String(guru2.id),
    },
  ];
  const [cardAchieve, cardBenevolent, cardCandid]: VocabCardDocument[] =
    await VocabCardModel.create(vocabCardSeeds);

  logger.info('[seed] Creating SRS progress...');
  const srsProgressSeeds: SeedInput<ISRSProgress>[] = [
    // siswaVII1: kartu due hari ini (sudah pernah review, interval habis)
    {
      cardId: String(cardAchieve.id),
      siswaId: String(siswaVII1.id),
      interval: 6,
      easeFactor: 2.5,
      repetitions: 2,
      nextReviewAt: addDays(-1),
      lastReviewAt: addDays(-7),
      lastQuality: 4,
    },
    // siswaVII1: kartu belum due (masih dalam interval)
    {
      cardId: String(cardBenevolent.id),
      siswaId: String(siswaVII1.id),
      interval: 6,
      easeFactor: 2.6,
      repetitions: 2,
      nextReviewAt: addDays(5),
      lastReviewAt: addDays(-1),
      lastQuality: 5,
    },
    // siswaVIII1: kartu due karena kualitas jawaban rendah sebelumnya (reset)
    {
      cardId: String(cardCandid.id),
      siswaId: String(siswaVIII1.id),
      interval: 1,
      easeFactor: 2.2,
      repetitions: 0,
      nextReviewAt: addDays(-1),
      lastReviewAt: addDays(-1),
      lastQuality: 2,
    },
    // cardDiligent untuk siswaVIII1: belum pernah direview → dianggap "new" (tidak dibuatkan progress)
  ];
  await SRSProgressModel.create(srsProgressSeeds);

  // ── Obrolan (chat) ────────────────────────────────────────
  logger.info('[seed] Creating obrolan...');
  const obrolanSeeds: SeedInput<IObrolan>[] = [
    {
      materiId: String(materiPresentTense.id),
      userId: String(siswaVII1.id),
      userNama: siswaVII1.name,
      userRole: 'SISWA',
      teks: 'Pak, kalau subjek "she/he/it" apa selalu tambah -s di kata kerjanya?',
    },
    {
      materiId: String(materiPresentTense.id),
      userId: String(guru1.id),
      userNama: guru1.name,
      userRole: 'GURU',
      teks: 'Betul, untuk subjek tunggal orang ketiga tambahkan -s atau -es, contoh: she goes, he watches.',
    },
    {
      materiId: String(materiNarrative.id),
      userId: String(siswaVIII1.id),
      userNama: siswaVIII1.name,
      userRole: 'SISWA',
      teks: 'Resolution itu bagian penyelesaian konflik ya, Pak?',
    },
  ];
  await ObrolanModel.create(obrolanSeeds);

  logger.info('[seed] Done.', {
    users: 9,
    kelas: 3,
    materi: materiDocs.length,
    latihan: 2,
    tugas: 2,
    pertemuan: 3,
    vocabCards: 4,
    accounts: {
      admin: admin.email,
      guru: [guru1.email, guru2.email],
      siswa: [
        siswaVII1.email,
        siswaVII2.email,
        siswaVIII1.email,
        siswaVIII2.email,
        siswaIX1.email,
        siswaIX2.email,
      ],
    },
    kelasIds: {
      kelasVII: String(kelasVII.id),
      kelasVIII: String(kelasVIII.id),
      kelasIX: String(kelasIX.id),
    },
    guruKelas: {
      [guru1.email]: kelasByGuru1.map((k) => k.nama),
      [guru2.email]: kelasByGuru2.map((k) => k.nama),
    },
    defaultPassword: DEFAULT_PASSWORD,
  });
}

seed()
  .then(() => disconnectDatabase())
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('[seed] Failed', { message: (err as Error).message });
    void disconnectDatabase().finally(() => process.exit(1));
  });
