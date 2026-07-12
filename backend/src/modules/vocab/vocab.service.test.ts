import { submitReviewService } from '@/modules/vocab/vocab.service';
import * as repo from '@/modules/vocab/vocab.repository';
import * as akunRepo from '@/modules/akun/akun.repository';

jest.mock('@/modules/vocab/vocab.repository');
jest.mock('@/modules/akun/akun.repository');

describe('submitReviewService kelas-membership check', () => {
  const cardId = 'card-1';
  const kelasCard = 'kelas-vii';
  const kelasLain = 'kelas-viii';
  const siswaId = 'siswa-1';

  beforeEach(() => {
    jest.resetAllMocks();
    (repo.findCardById as jest.Mock).mockResolvedValue({ id: cardId, kelasId: kelasCard });
    (repo.findProgressByCard as jest.Mock).mockResolvedValue(null);
    (repo.upsertProgress as jest.Mock).mockResolvedValue({ toJSON: () => ({ id: 'progress-1' }) });
  });

  test('siswa dari kelas lain ditolak submit review', async () => {
    (akunRepo.findKelasIdBySiswaId as jest.Mock).mockResolvedValue(kelasLain);

    await expect(
      submitReviewService({ cardId, siswaId, quality: 4 }, siswaId),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('siswa dari kelas yang sama boleh submit review', async () => {
    (akunRepo.findKelasIdBySiswaId as jest.Mock).mockResolvedValue(kelasCard);

    await expect(
      submitReviewService({ cardId, siswaId, quality: 4 }, siswaId),
    ).resolves.toEqual({ id: 'progress-1' });
  });
});
