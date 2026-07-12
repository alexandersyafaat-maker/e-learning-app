import { cekSubmisiSiswa, submitTugasService } from '@/modules/tugas/tugas.service';
import * as repo from '@/modules/tugas/tugas.repository';
import * as akunRepo from '@/modules/akun/akun.repository';

jest.mock('@/modules/tugas/tugas.repository');
jest.mock('@/modules/akun/akun.repository');

describe('cekSubmisiSiswa authorization', () => {
  const tugasId = 'tugas-1';
  const ownerSiswaId = 'siswa-1';
  const otherSiswaId = 'siswa-2';
  const ownerGuruId = 'guru-1';
  const otherGuruId = 'guru-2';

  beforeEach(() => {
    jest.resetAllMocks();
    (repo.findTugasById as jest.Mock).mockResolvedValue({ id: tugasId, guruId: ownerGuruId });
    (repo.findSubmisiBySiswa as jest.Mock).mockResolvedValue(null);
  });

  test('siswa lain ditolak akses submisi milik siswa lain', async () => {
    await expect(
      cekSubmisiSiswa(tugasId, ownerSiswaId, { userId: otherSiswaId, role: 'SISWA' }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('siswa pemilik boleh akses submisi miliknya sendiri', async () => {
    await expect(
      cekSubmisiSiswa(tugasId, ownerSiswaId, { userId: ownerSiswaId, role: 'SISWA' }),
    ).resolves.toBeNull();
  });

  test('guru bukan pemilik tugas ditolak', async () => {
    await expect(
      cekSubmisiSiswa(tugasId, ownerSiswaId, { userId: otherGuruId, role: 'GURU' }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('guru pemilik tugas boleh akses', async () => {
    await expect(
      cekSubmisiSiswa(tugasId, ownerSiswaId, { userId: ownerGuruId, role: 'GURU' }),
    ).resolves.toBeNull();
  });

  test('admin selalu boleh akses', async () => {
    await expect(
      cekSubmisiSiswa(tugasId, ownerSiswaId, { userId: 'admin-1', role: 'ADMIN' }),
    ).resolves.toBeNull();
  });
});

describe('submitTugasService kelas-membership check', () => {
  const tugasId = 'tugas-1';
  const kelasTugas = 'kelas-vii';
  const kelasLain = 'kelas-viii';
  const siswaId = 'siswa-1';

  beforeEach(() => {
    jest.resetAllMocks();
    (repo.findTugasById as jest.Mock).mockResolvedValue({
      id: tugasId,
      kelasId: kelasTugas,
      guruId: 'guru-1',
      deadline: undefined,
    });
    (repo.findSubmisiBySiswa as jest.Mock).mockResolvedValue(null);
    (repo.createSubmisi as jest.Mock).mockResolvedValue({ toJSON: () => ({ id: 'submisi-1' }) });
  });

  test('siswa dari kelas lain ditolak submit', async () => {
    (akunRepo.findKelasIdBySiswaId as jest.Mock).mockResolvedValue(kelasLain);

    await expect(
      submitTugasService(
        tugasId,
        { siswaId, jawaban: 'jawaban', catatan: '', lampiran: [] },
        siswaId,
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('siswa dari kelas yang sama boleh submit', async () => {
    (akunRepo.findKelasIdBySiswaId as jest.Mock).mockResolvedValue(kelasTugas);

    await expect(
      submitTugasService(
        tugasId,
        { siswaId, jawaban: 'jawaban', catatan: '', lampiran: [] },
        siswaId,
      ),
    ).resolves.toEqual({ id: 'submisi-1' });
  });
});
