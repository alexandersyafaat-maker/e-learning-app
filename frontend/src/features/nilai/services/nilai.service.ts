import { apiFetch } from "@/lib/api";
import type { Lampiran } from "@/lib/types";
import type {
  HasilLatihanNilai,
  SubmisiTugasNilai,
  NilaiSiswa,
  UpdateNilaiInput,
} from "../types/nilai.types";

// ── Internal backend shapes ───────────────────────────────────────────────────
// These match exactly what the backend returns (before FE enrichment).

interface BackendLatihanView {
  id: string;
  judul: string;
  kelasId: string;
  kelasNama: string;
  guruId: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendHasilLatihan {
  id: string;
  latihanId: string;
  siswaId: string;
  siswaNama: string;
  siswaEmail: string;
  jawaban: string;
  lampiran: Lampiran[];
  nilai?: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendLatihanWithStatus extends BackendLatihanView {
  hasilLatihan: Record<string, unknown> | null;
}

interface BackendTugasView {
  id: string;
  judul: string;
  kelasId: string;
  kelasNama: string;
  guruId: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendSubmisiTugas {
  id: string;
  tugasId: string;
  siswaId: string;
  siswaNama: string;
  siswaEmail: string;
  jawaban: string;
  catatan: string;
  lampiran: Lampiran[];
  nilai?: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendTugasWithStatus extends BackendTugasView {
  submisi: Record<string, unknown> | null;
}

// ── Guru ─────────────────────────────────────────────────────────────────────
// No bulk endpoint exists. Strategy:
//   1. GET /latihan?guruId → list of latihan (has judul + kelasNama)
//   2. For each latihan, GET /latihan/:id/hasil → hasil list (has siswaNama)
//   3. Combine fields FE-side.

export async function fetchHasilLatihanByGuru(guruId: string): Promise<HasilLatihanNilai[]> {
  const latihanList = await apiFetch<BackendLatihanView[]>(`/latihan?guruId=${guruId}`);

  const groups = await Promise.all(
    latihanList.map(async (latihan) => {
      const hasilList = await apiFetch<BackendHasilLatihan[]>(`/latihan/${latihan.id}/hasil`);
      return hasilList.map((h): HasilLatihanNilai => ({
        id: h.id,
        latihanId: latihan.id,
        latihanJudul: latihan.judul,
        siswaId: h.siswaId,
        siswaNama: h.siswaNama,
        siswaEmail: h.siswaEmail,
        kelasId: latihan.kelasId,
        kelasNama: latihan.kelasNama,
        jawaban: h.jawaban,
        lampiran: h.lampiran ?? [],
        nilai: h.nilai,
        submittedAt: h.submittedAt,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      }));
    })
  );

  return groups.flat();
}

export async function fetchSubmisiTugasByGuru(guruId: string): Promise<SubmisiTugasNilai[]> {
  const tugasList = await apiFetch<BackendTugasView[]>(`/tugas?guruId=${guruId}`);

  const groups = await Promise.all(
    tugasList.map(async (tugas) => {
      const submisiList = await apiFetch<BackendSubmisiTugas[]>(`/tugas/${tugas.id}/submisi`);
      return submisiList.map((s): SubmisiTugasNilai => ({
        id: s.id,
        tugasId: tugas.id,
        tugasJudul: tugas.judul,
        siswaId: s.siswaId,
        siswaNama: s.siswaNama,
        siswaEmail: s.siswaEmail,
        kelasId: tugas.kelasId,
        kelasNama: tugas.kelasNama,
        jawaban: s.jawaban ?? '',
        catatan: s.catatan,
        lampiran: s.lampiran ?? [],
        nilai: s.nilai,
        submittedAt: s.submittedAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));
    })
  );

  return groups.flat();
}

// PATCH returns raw document (no enrichment) — caller only needs success/fail.
export async function updateHasilLatihanNilaiRequest(
  latihanId: string,
  hasilId: string,
  input: UpdateNilaiInput
): Promise<void> {
  await apiFetch<unknown>(
    `/latihan/${latihanId}/hasil/${hasilId}/nilai`,
    { method: "PATCH", body: JSON.stringify(input) }
  );
}

export async function updateSubmisiTugasNilaiRequest(
  tugasId: string,
  submisiId: string,
  input: UpdateNilaiInput
): Promise<void> {
  await apiFetch<unknown>(
    `/tugas/${tugasId}/submisi/${submisiId}/nilai`,
    { method: "PATCH", body: JSON.stringify(input) }
  );
}

// ── Siswa ─────────────────────────────────────────────────────────────────────
// No /nilai endpoint. Nilai embedded inside LatihanWithStatus.hasilLatihan
// and TugasWithStatus.submisi.

export async function fetchNilaiSiswa(siswaId: string): Promise<NilaiSiswa> {
  const [latihanList, tugasList] = await Promise.all([
    apiFetch<BackendLatihanWithStatus[]>(`/latihan?siswaId=${siswaId}`),
    apiFetch<BackendTugasWithStatus[]>(`/tugas?siswaId=${siswaId}`),
  ]);

  const latihan: HasilLatihanNilai[] = latihanList
    .filter((l) => l.hasilLatihan !== null)
    .map((l) => {
      const h = l.hasilLatihan as unknown as BackendHasilLatihan;
      return {
        id: h.id,
        latihanId: l.id,
        latihanJudul: l.judul,
        siswaId: h.siswaId,
        siswaNama: "",
        siswaEmail: "",
        kelasId: l.kelasId,
        kelasNama: l.kelasNama,
        jawaban: h.jawaban,
        lampiran: h.lampiran ?? [],
        nilai: h.nilai,
        submittedAt: h.submittedAt,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      };
    });

  const tugas: SubmisiTugasNilai[] = tugasList
    .filter((t) => t.submisi !== null)
    .map((t) => {
      const s = t.submisi as unknown as BackendSubmisiTugas;
      return {
        id: s.id,
        tugasId: t.id,
        tugasJudul: t.judul,
        siswaId: s.siswaId,
        siswaNama: "",
        siswaEmail: "",
        kelasId: t.kelasId,
        kelasNama: t.kelasNama,
        jawaban: s.jawaban ?? '',
        catatan: s.catatan,
        lampiran: s.lampiran ?? [],
        nilai: s.nilai,
        submittedAt: s.submittedAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });

  return { latihan, tugas };
}
