import { cekHasilSiswa, submitLatihanService } from '@/modules/latihan/latihan.service';
import * as repo from '@/modules/latihan/latihan.repository';
import * as akunRepo from '@/modules/akun/akun.repository';

jest.mock('@/modules/latihan/latihan.repository');
jest.mock('@/modules/akun/akun.repository');

describe('cekHasilSiswa authorization', () => {
  const latihanId = 'latihan-1';
  const ownerSiswaId = 'siswa-1';
  const otherSiswaId = 'siswa-2';
  const ownerGuruId = 'guru-1';
  const otherGuruId = 'guru-2';

  beforeEach(() => {
    jest.resetAllMocks();
    (repo.findLatihanById as jest.Mock).mockResolvedValue({ id: latihanId, guruId: ownerGuruId });
    (repo.findHasilBySiswa as jest.Mock).mockResolvedValue(null);
  });

  test('siswa lain ditolak akses hasil milik siswa lain', async () => {
    await expect(
      cekHasilSiswa(latihanId, ownerSiswaId, { userId: otherSiswaId, role: 'SISWA' }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('siswa pemilik boleh akses hasil miliknya sendiri', async () => {
    await expect(
      cekHasilSiswa(latihanId, ownerSiswaId, { userId: ownerSiswaId, role: 'SISWA' }),
    ).resolves.toBeNull();
  });

  test('guru bukan pemilik latihan ditolak', async () => {
    await expect(
      cekHasilSiswa(latihanId, ownerSiswaId, { userId: otherGuruId, role: 'GURU' }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('guru pemilik latihan boleh akses', async () => {
    await expect(
      cekHasilSiswa(latihanId, ownerSiswaId, { userId: ownerGuruId, role: 'GURU' }),
    ).resolves.toBeNull();
  });

  test('admin selalu boleh akses', async () => {
    await expect(
      cekHasilSiswa(latihanId, ownerSiswaId, { userId: 'admin-1', role: 'ADMIN' }),
    ).resolves.toBeNull();
  });
});

describe('submitLatihanService kelas-membership check', () => {
  const latihanId = 'latihan-1';
  const kelasLatihan = 'kelas-vii';
  const kelasLain = 'kelas-viii';
  const siswaId = 'siswa-1';

  beforeEach(() => {
    jest.resetAllMocks();
    (repo.findLatihanById as jest.Mock).mockResolvedValue({
      id: latihanId,
      kelasId: kelasLatihan,
      guruId: 'guru-1',
      deadline: undefined,
    });
    (repo.findHasilBySiswa as jest.Mock).mockResolvedValue(null);
    (repo.createHasilLatihan as jest.Mock).mockResolvedValue({
      toJSON: () => ({ id: 'hasil-1' }),
    });
  });

  test('siswa dari kelas lain ditolak submit', async () => {
    (akunRepo.findKelasIdBySiswaId as jest.Mock).mockResolvedValue(kelasLain);

    await expect(
      submitLatihanService(
        latihanId,
        { siswaId, jawaban: 'jawaban', lampiran: [] },
        siswaId,
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('siswa dari kelas yang sama boleh submit', async () => {
    (akunRepo.findKelasIdBySiswaId as jest.Mock).mockResolvedValue(kelasLatihan);

    await expect(
      submitLatihanService(
        latihanId,
        { siswaId, jawaban: 'jawaban', lampiran: [] },
        siswaId,
      ),
    ).resolves.toEqual({ id: 'hasil-1' });
  });
});
