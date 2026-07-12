import '@/config/env'; // validate env first
import { connectDatabase, disconnectDatabase } from '@/config/database';
import { logger } from '@/config/logger';
import { hashPassword } from '@/utils/password';
import { UserModel, UserDocument } from '@/modules/auth/user.model';
import { KelasModel, KelasDocument } from '@/modules/kelas/kelas.model';

// Default password untuk semua akun seed (dev only).
const DEFAULT_PASSWORD = 'password123';

async function seed(): Promise<void> {
  await connectDatabase();

  logger.info('[seed] Clearing existing collections...');
  await Promise.all([UserModel.deleteMany({}), KelasModel.deleteMany({})]);

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  // ── Users ─────────────────────────────────────────────────
  logger.info('[seed] Creating users...');
  const [admin, guru1, guru2, siswa1, siswa2, siswa3]: UserDocument[] = await UserModel.create([
    { name: 'Admin Sekolah', email: 'admin@elearning.id', password: passwordHash, role: 'ADMIN' },
    { name: 'Budi Santoso', email: 'budi.guru@elearning.id', password: passwordHash, role: 'GURU' },
    { name: 'Siti Aminah', email: 'siti.guru@elearning.id', password: passwordHash, role: 'GURU' },
    {
      name: 'Andi Pratama',
      email: 'andi.siswa@elearning.id',
      password: passwordHash,
      role: 'SISWA',
    },
    {
      name: 'Dewi Lestari',
      email: 'dewi.siswa@elearning.id',
      password: passwordHash,
      role: 'SISWA',
    },
    {
      name: 'Rizki Hidayat',
      email: 'rizki.siswa@elearning.id',
      password: passwordHash,
      role: 'SISWA',
    },
  ]);

  // ── Kelas ─────────────────────────────────────────────────
  logger.info('[seed] Creating kelas...');
  const [kelasVII, kelasVIII, kelasIX]: KelasDocument[] = await KelasModel.create([
    {
      nama: 'Kelas VII',
      tingkat: 'VII',
      tahunAjaran: '2025/2026',
      deskripsi: 'Kelas VII SMP',
    },
    {
      nama: 'Kelas VIII',
      tingkat: 'VIII',
      tahunAjaran: '2025/2026',
      deskripsi: 'Kelas VIII SMP',
    },
    {
      nama: 'Kelas IX',
      tingkat: 'IX',
      tahunAjaran: '2025/2026',
      deskripsi: 'Kelas IX SMP',
    },
  ]);

  // Assign siswa ke kelas
  await Promise.all([
    siswa1.updateOne({ kelasId: kelasVII.id }),
    siswa2.updateOne({ kelasId: kelasVIII.id }),
    siswa3.updateOne({ kelasId: kelasIX.id }),
  ]);

  logger.info('[seed] Done.', {
    users: 6,
    kelas: 3,
    accounts: {
      admin: admin.email,
      guru: [guru1.email, guru2.email],
      siswa: [siswa1.email, siswa2.email, siswa3.email],
    },
    kelasIds: {
      kelasVII: String(kelasVII.id),
      kelasVIII: String(kelasVIII.id),
      kelasIX: String(kelasIX.id),
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
