import { Role, type User } from "../types/auth.types";

type UserWithPassword = User & { password: string; nisn?: string; nik?: string };

export let DUMMY_USERS: UserWithPassword[] = [
  {
    id: "u-001",
    name: "Admin Utama",
    email: "admin@elearning.id",
    password: "admin123",
    role: Role.ADMIN,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "u-002",
    name: "Budi Santoso",
    email: "budi@elearning.id",
    nik: "3201010101010001",
    password: "guru123",
    role: Role.GURU,
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "u-003",
    name: "Dewi Kurnia",
    email: "dewi@elearning.id",
    nik: "3201010101010002",
    password: "guru123",
    role: Role.GURU,
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
  },
  {
    id: "u-004",
    name: "Siti Rahayu",
    email: "siti@elearning.id",
    nisn: "0012345678",
    password: "siswa123",
    role: Role.SISWA,
    createdAt: "2026-01-04T00:00:00.000Z",
    updatedAt: "2026-01-04T00:00:00.000Z",
  },
  {
    id: "u-005",
    name: "Andi Pratama",
    email: "andi@elearning.id",
    nisn: "0012345679",
    password: "siswa123",
    role: Role.SISWA,
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
  },
];

function strip(user: UserWithPassword): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, nisn, nik, ...rest } = user;
  return rest;
}

let nextUserId = 7;

export async function loginRequest(
  identifier: string,
  password: string
): Promise<User | null> {
  const id = identifier.toLowerCase();
  const user = DUMMY_USERS.find(
    (u) =>
      (u.email === id || u.nisn === identifier || u.nik === identifier) &&
      u.password === password
  );
  return user ? strip(user) : null;
}

export async function registerRequest(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  kelasId?: string;
}): Promise<(User & { kelasId?: string }) | "email_taken"> {
  if (DUMMY_USERS.find((u) => u.email === input.email)) return "email_taken";
  const now = new Date().toISOString();
  const user: UserWithPassword = {
    id: `u-${String(nextUserId++).padStart(3, "0")}`,
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    createdAt: now,
    updatedAt: now,
  };
  DUMMY_USERS.push(user);
  return { ...strip(user), kelasId: input.kelasId };
}

export async function fetchCurrentUser(userId: string): Promise<User | null> {
  const user = DUMMY_USERS.find((u) => u.id === userId);
  return user ? strip(user) : null;
}
