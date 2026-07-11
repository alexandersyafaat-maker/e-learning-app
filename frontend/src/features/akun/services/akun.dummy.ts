import { Role } from "@/features/auth/types/auth.types";
import type { Akun, CreateAkunInput, UpdateAkunInput } from "../types/akun.types";

// Mutable â€” in-memory mutations persist per server process (OK for prototype)
let DUMMY_AKUN: Akun[] = [
  {
    id: "u-001",
    name: "Admin Utama",
    email: "admin@elearning.id",
    role: Role.ADMIN,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "u-002",
    name: "Budi Santoso",
    email: "budi@elearning.id",
    role: Role.GURU,
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "u-003",
    name: "Dewi Kurnia",
    email: "dewi@elearning.id",
    role: Role.GURU,
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
  },
  {
    id: "u-004",
    name: "Siti Rahayu",
    email: "siti@elearning.id",
    role: Role.SISWA,
    createdAt: "2026-01-04T00:00:00.000Z",
    updatedAt: "2026-01-04T00:00:00.000Z",
  },
  {
    id: "u-005",
    name: "Andi Pratama",
    email: "andi@elearning.id",
    role: Role.SISWA,
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
  },
  {
    id: "u-006",
    name: "Rini Lestari",
    email: "rini@elearning.id",
    role: Role.SISWA,
    createdAt: "2026-01-06T00:00:00.000Z",
    updatedAt: "2026-01-06T00:00:00.000Z",
  },
];

let nextId = 7;

export async function fetchAkunList(): Promise<Akun[]> {
  return [...DUMMY_AKUN];
}

export async function fetchAkunById(id: string): Promise<Akun | null> {
  return DUMMY_AKUN.find((a) => a.id === id) ?? null;
}

export async function createAkunRequest(input: CreateAkunInput): Promise<Akun> {
  const now = new Date().toISOString();
  const newAkun: Akun = {
    id: `u-${String(nextId++).padStart(3, "0")}`,
    name: input.name,
    email: input.email,
    role: input.role,
    createdAt: now,
    updatedAt: now,
  };
  DUMMY_AKUN.push(newAkun);
  return newAkun;
}

export async function updateAkunRequest(
  id: string,
  input: UpdateAkunInput
): Promise<Akun | null> {
  const idx = DUMMY_AKUN.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  DUMMY_AKUN[idx] = {
    ...DUMMY_AKUN[idx],
    name: input.name,
    email: input.email,
    role: input.role,
    updatedAt: new Date().toISOString(),
  };
  return DUMMY_AKUN[idx];
}

export async function deleteAkunRequest(id: string): Promise<boolean> {
  const before = DUMMY_AKUN.length;
  DUMMY_AKUN = DUMMY_AKUN.filter((a) => a.id !== id);
  return DUMMY_AKUN.length < before;
}
