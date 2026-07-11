import type { Kelas, CreateKelasInput, UpdateKelasInput } from "../types/kelas.types";

let DUMMY_KELAS: Kelas[] = [
  {
    id: "k-001",
    nama: "Kelas VII",
    tingkat: "VII",
    tahunAjaran: "2025/2026",
    deskripsi: "Kelas VII SMP",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "k-002",
    nama: "Kelas VIII",
    tingkat: "VIII",
    tahunAjaran: "2025/2026",
    deskripsi: "Kelas VIII SMP",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "k-003",
    nama: "Kelas IX",
    tingkat: "IX",
    tahunAjaran: "2025/2026",
    deskripsi: "Kelas IX SMP",
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

let nextId = 4;

export async function fetchKelasList(): Promise<Kelas[]> {
  return [...DUMMY_KELAS];
}

export async function fetchKelasById(id: string): Promise<Kelas | null> {
  return DUMMY_KELAS.find((k) => k.id === id) ?? null;
}

export async function createKelasRequest(input: CreateKelasInput): Promise<Kelas> {
  const now = new Date().toISOString();
  const kelas: Kelas = {
    id: `k-${String(nextId++).padStart(3, "0")}`,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  DUMMY_KELAS.push(kelas);
  return kelas;
}

export async function updateKelasRequest(
  id: string,
  input: UpdateKelasInput
): Promise<Kelas | null> {
  const idx = DUMMY_KELAS.findIndex((k) => k.id === id);
  if (idx === -1) return null;
  DUMMY_KELAS[idx] = { ...DUMMY_KELAS[idx], ...input, updatedAt: new Date().toISOString() };
  return DUMMY_KELAS[idx];
}

export async function deleteKelasRequest(id: string): Promise<boolean> {
  const before = DUMMY_KELAS.length;
  DUMMY_KELAS = DUMMY_KELAS.filter((k) => k.id !== id);
  return DUMMY_KELAS.length < before;
}
