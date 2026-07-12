import { createPertemuanService } from '@/modules/pertemuan/pertemuan.service';
import * as kelasRepo from '@/modules/kelas/kelas.repository';
import * as akunRepo from '@/modules/akun/akun.repository';
import * as zoomClient from '@/lib/zoom.client';
import * as pertemuanRepo from '@/modules/pertemuan/pertemuan.repository';

jest.mock('@/modules/kelas/kelas.repository');
jest.mock('@/modules/akun/akun.repository');
jest.mock('@/lib/zoom.client');
jest.mock('@/modules/pertemuan/pertemuan.repository');

describe('createPertemuanService', () => {
  const guruId = 'guru-1';
  const kelasId = 'kelas-vii';

  beforeEach(() => {
    jest.resetAllMocks();
    (kelasRepo.findKelasById as jest.Mock).mockResolvedValue({ id: kelasId, nama: 'VII-1' });
    (akunRepo.findUserById as jest.Mock).mockResolvedValue({ id: guruId, name: 'Budi Santoso' });
    (zoomClient.createZoomMeeting as jest.Mock).mockResolvedValue({
      id: '123456789',
      join_url: 'https://zoom.us/j/123456789',
      start_url: 'https://zoom.us/s/123456789',
      password: 'abc123',
    });
    (pertemuanRepo.createPertemuan as jest.Mock).mockResolvedValue({
      toJSON: () => ({ id: 'pertemuan-1' }),
      jadwal: new Date('2026-08-01T08:00:00.000Z'),
      durasi: 60,
    });
  });

  test('response berisi nama guru asli, bukan string kosong', async () => {
    const result = await createPertemuanService(
      {
        judul: 'Kelas VII - Review',
        kelasId,
        guruId,
        jadwal: '2026-08-01T08:00:00.000Z',
        durasi: 60,
      },
      guruId,
    );

    expect(result.guruNama).toBe('Budi Santoso');
  });
});
