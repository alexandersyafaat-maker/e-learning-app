# Data Models — E-Learning App

Dokumen ini mendefinisikan semua model data yang digunakan frontend.
Backend **wajib** mengembalikan response sesuai shape di bawah.

> **Konvensi:**
> - Semua `id` → UUID v4 string
> - Semua tanggal → ISO 8601 string (`"2026-01-10T08:00:00.000Z"`)
> - `*View` → computed frontend (JOIN nama dari relasi) — backend bisa return langsung atau frontend join sendiri
> - `*Input` → shape body request POST/PUT dari frontend ke backend

---

## Shared / Base

### BaseEntity
Semua entity extend ini.

| Field | Type | Keterangan |
|---|---|---|
| `id` | `string` | UUID v4 |
| `createdAt` | `string` | ISO 8601 |
| `updatedAt` | `string` | ISO 8601 |

### ActionResponse\<T\>
Shape response semua server action (mutation). Backend REST API sebaiknya memakai pola serupa.

```typescript
type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### Lampiran
File attachment — embedded di dalam entity (Materi, Latihan, Tugas, HasilLatihan, SubmisiTugas).

| Field | Type | Keterangan |
|---|---|---|
| `id` | `string` | UUID v4 |
| `nama` | `string` | Nama file asli |
| `ukuran` | `number` | Bytes |
| `tipe` | `string` | MIME type (`image/png`, `application/pdf`, dll) |
| `url` | `string` | URL untuk download/akses file |

> **Backend note:** simpan sebagai JSON column atau tabel `lampiran` terpisah dengan FK ke entity induk.

---

## Feature: Auth

### User
```typescript
interface User extends BaseEntity {
  name: string;
  email: string;
  role: "ADMIN" | "GURU" | "SISWA";
  avatarUrl?: string;
}
```

### Session
Disimpan di httpOnly cookie `session` (JSON stringify). Tidak perlu endpoint tersendiri — di-set saat login.

```typescript
interface Session {
  userId: string;
  role: "ADMIN" | "GURU" | "SISWA";
  name: string;
  email: string;
  avatarUrl?: string;
}
```

### LoginInput
```typescript
interface LoginInput {
  email: string;
  password: string;
}
```

**Endpoints yang dibutuhkan:**
| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/auth/login` | `LoginInput` | `{ user: User, token?: string }` |
| `POST` | `/auth/logout` | — | `204` |
| `POST` | `/auth/me/avatar` | multipart, field `foto` (image) | `Session` (updated, includes `avatarUrl`) |

---

## Feature: Akun (Admin)

### Akun
```typescript
interface Akun extends BaseEntity {
  name: string;
  email: string;
  role: "ADMIN" | "GURU" | "SISWA";
}
```

### CreateAkunInput
```typescript
interface CreateAkunInput {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "GURU" | "SISWA";
}
```

### UpdateAkunInput
```typescript
interface UpdateAkunInput {
  name: string;
  email: string;
  password?: string;   // kosong = tidak ganti password
  role: "ADMIN" | "GURU" | "SISWA";
}
```

**Endpoints:**
| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/akun` | — | `Akun[]` |
| `POST` | `/akun` | `CreateAkunInput` | `Akun` |
| `PUT` | `/akun/:id` | `UpdateAkunInput` | `Akun` |
| `DELETE` | `/akun/:id` | — | `204` |

---

## Feature: Kelas (Admin)

### Kelas
```typescript
interface Kelas extends BaseEntity {
  nama: string;
  tingkat: string;        // e.g. "X", "XI", "XII"
  tahunAjaran: string;    // e.g. "2025/2026"
  deskripsi?: string;
}
```

### CreateKelasInput / UpdateKelasInput
```typescript
interface CreateKelasInput {
  nama: string;
  tingkat: string;
  tahunAjaran: string;
  deskripsi?: string;
}
// UpdateKelasInput = CreateKelasInput (shape sama)
```

**Endpoints:**
| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/kelas` | — | `Kelas[]` |
| `GET` | `/kelas/:id` | — | `Kelas` |
| `POST` | `/kelas` | `CreateKelasInput` | `Kelas` |
| `PUT` | `/kelas/:id` | `UpdateKelasInput` | `Kelas` |
| `DELETE` | `/kelas/:id` | — | `204` |

---

## Feature: Materi (Guru + Siswa)

### Materi
```typescript
interface Materi extends BaseEntity {
  judul: string;
  konten: string;       // HTML atau Markdown
  kelasId: string;
  guruId: string;
  lampiran: Lampiran[];
}
```

### MateriView *(frontend computed)*
```typescript
interface MateriView extends Materi {
  kelasNama: string;    // dari join Kelas.nama
  guruNama: string;     // dari join User.name
}
```

### CreateMateriInput
```typescript
interface CreateMateriInput {
  judul: string;
  konten: string;
  kelasId: string;
  guruId: string;
  lampiran: Lampiran[];
}
```

### UpdateMateriInput
```typescript
interface UpdateMateriInput {
  judul: string;
  konten: string;
  kelasId: string;
  lampiran: Lampiran[];
}
```

**Endpoints:**
| Method | Path | Query | Response |
|---|---|---|---|
| `GET` | `/materi` | `?guruId=` atau `?kelasId=` | `MateriView[]` |
| `GET` | `/materi/:id` | — | `MateriView` |
| `POST` | `/materi` | — body: `CreateMateriInput` | `Materi` |
| `PUT` | `/materi/:id` | — body: `UpdateMateriInput` | `Materi` |
| `DELETE` | `/materi/:id` | — | `204` |

---

## Feature: Latihan (Guru + Siswa)

### Latihan
```typescript
interface Latihan extends BaseEntity {
  judul: string;
  deskripsi: string;
  kelasId: string;
  guruId: string;
  deadline?: string;    // ISO 8601, opsional
  lampiran: Lampiran[];
}
```

### LatihanView *(frontend computed)*
```typescript
interface LatihanView extends Latihan {
  kelasNama: string;
  guruNama: string;
}
```

### HasilLatihan *(jawaban siswa)*
```typescript
interface HasilLatihan extends BaseEntity {
  latihanId: string;
  siswaId: string;
  jawaban: string;
  lampiran: Lampiran[];
  nilai?: number;       // diisi guru setelah dinilai
  submittedAt: string;  // ISO 8601
}
```

### HasilLatihanView *(frontend computed)*
```typescript
interface HasilLatihanView extends HasilLatihan {
  siswaNama: string;
  siswaEmail: string;
}
```

### LatihanWithStatus *(frontend computed — untuk siswa)*
```typescript
interface LatihanWithStatus extends LatihanView {
  hasilLatihan: HasilLatihan | null;
}
```

### CreateLatihanInput / UpdateLatihanInput
```typescript
interface CreateLatihanInput {
  judul: string;
  deskripsi: string;
  kelasId: string;
  guruId: string;
  deadline?: string;
  lampiran: Lampiran[];
}

interface UpdateLatihanInput {
  judul: string;
  deskripsi: string;
  kelasId: string;
  deadline?: string;
  lampiran: Lampiran[];
}
```

### SubmitLatihanInput
```typescript
interface SubmitLatihanInput {
  latihanId: string;
  siswaId: string;
  jawaban: string;
  lampiran: Lampiran[];
}
```

**Endpoints:**
| Method | Path | Keterangan |
|---|---|---|
| `GET` | `/latihan?guruId=` | Guru: ambil latihan miliknya |
| `GET` | `/latihan?kelasId=&siswaId=` | Siswa: ambil latihan + status submit |
| `GET` | `/latihan/:id` | Detail latihan |
| `POST` | `/latihan` | Guru buat latihan |
| `PUT` | `/latihan/:id` | Guru edit latihan |
| `DELETE` | `/latihan/:id` | Guru hapus latihan |
| `GET` | `/latihan/:id/hasil` | Guru: semua jawaban siswa |
| `GET` | `/latihan/:id/hasil/:siswaId` | Cek apakah siswa sudah submit |
| `POST` | `/latihan/:id/submit` | Siswa submit jawaban |
| `PATCH` | `/latihan/:id/hasil/:hasilId/nilai` | Guru beri nilai |

---

## Feature: Tugas (Guru + Siswa)

### Tugas
```typescript
interface Tugas extends BaseEntity {
  judul: string;
  deskripsi: string;
  kelasId: string;
  guruId: string;
  deadline?: string;
  lampiran: Lampiran[];
}
```

### TugasView *(frontend computed)*
```typescript
interface TugasView extends Tugas {
  kelasNama: string;
  guruNama: string;
}
```

### SubmisiTugas *(pengumpulan siswa)*
```typescript
interface SubmisiTugas extends BaseEntity {
  tugasId: string;
  siswaId: string;
  catatan: string;      // catatan opsional dari siswa
  lampiran: Lampiran[]; // file yang dikumpulkan
  nilai?: number;
  submittedAt: string;
}
```

### SubmisiTugasView *(frontend computed)*
```typescript
interface SubmisiTugasView extends SubmisiTugas {
  siswaNama: string;
  siswaEmail: string;
}
```

### TugasWithStatus *(frontend computed — untuk siswa)*
```typescript
interface TugasWithStatus extends TugasView {
  submisi: SubmisiTugas | null;
}
```

### Input Types
```typescript
interface CreateTugasInput {
  judul: string;
  deskripsi: string;
  kelasId: string;
  guruId: string;
  deadline?: string;
  lampiran: Lampiran[];
}

interface UpdateTugasInput {
  judul: string;
  deskripsi: string;
  kelasId: string;
  deadline?: string;
  lampiran: Lampiran[];
}

interface SubmitTugasInput {
  tugasId: string;
  siswaId: string;
  catatan: string;
  lampiran: Lampiran[];
}
```

**Endpoints:** (pola sama dengan Latihan, ganti `/latihan` → `/tugas`, `hasil` → `submisi`)

---

## Feature: Pertemuan Virtual (Zoom)

### Pertemuan
```typescript
interface Pertemuan extends BaseEntity {
  judul: string;
  kelasId: string;
  guruId: string;
  jadwal: string;           // ISO 8601 — waktu mulai meeting
  durasi: number;           // menit
  zoomMeetingId: string;    // ID meeting dari Zoom API
  zoomJoinUrl: string;      // link untuk siswa
  zoomStartUrl: string;     // link untuk guru (host) — JANGAN expose ke siswa
  zoomPassword: string;     // passcode meeting
}
```

> **Backend note:** `status` (TERJADWAL / BERLANGSUNG / SELESAI) **tidak disimpan** di DB — dihitung dinamis dari `jadwal + durasi` vs waktu saat ini.

### PertemuanView *(frontend computed)*
```typescript
interface PertemuanView extends Pertemuan {
  kelasNama: string;
  guruNama: string;
  status: "TERJADWAL" | "BERLANGSUNG" | "SELESAI";  // computed
}
```

### CreatePertemuanInput
```typescript
interface CreatePertemuanInput {
  judul: string;
  kelasId: string;
  guruId: string;
  jadwal: string;   // ISO 8601
  durasi: number;   // menit
}
```

**Endpoints:**
| Method | Path | Keterangan |
|---|---|---|
| `GET` | `/pertemuan?guruId=` | Guru: semua meeting-nya |
| `GET` | `/pertemuan?kelasId=` | Siswa: meeting kelasnya |
| `POST` | `/pertemuan` | Guru buat meeting (backend call Zoom API) |
| `DELETE` | `/pertemuan/:id` | Guru hapus meeting (backend call Zoom API delete) |

---

## Feature: Kosakata SRS (Vocab)

### VocabCard
```typescript
interface VocabCard extends BaseEntity {
  word: string;
  translation: string;    // terjemahan Indonesia
  definition: string;     // definisi bahasa Inggris
  example: string;        // contoh kalimat
  v1?: string;            // infinitive / base form
  v2?: string;            // past simple
  v3?: string;            // past participle
  ving?: string;          // present participle (-ing)
  vs?: string;            // 3rd person singular (-s/es)
  kelasId: string;
  guruId: string;
}
```

### SRSProgress
Progress review per siswa per kartu — implementasi algoritma SM-2.

```typescript
interface SRSProgress extends BaseEntity {
  cardId: string;
  siswaId: string;
  interval: number;       // hari sampai review berikutnya
  easeFactor: number;     // faktor kemudahan (default 2.5, min 1.3)
  repetitions: number;    // jumlah review berhasil berturut-turut
  nextReviewAt: string;   // ISO 8601 — kapan review berikutnya
  lastReviewAt?: string;  // ISO 8601 — review terakhir
  lastQuality?: number;   // 0–5: 0=tidak ingat, 3=ragu, 5=ingat
}
```

> **SM-2 Algorithm** — dijalankan di backend saat siswa submit rating:
> - `quality >= 3` → correct: increment repetitions, grow interval
> - `quality < 3` → incorrect: reset repetitions=0, interval=1
> - `easeFactor` diupdate: `EF = max(1.3, EF + 0.1 - (5-q)*(0.08 + (5-q)*0.02))`

### VocabCardView *(frontend computed)*
```typescript
interface VocabCardView extends VocabCard {
  kelasNama: string;
  guruNama: string;
}
```

### VocabCardWithProgress *(untuk review session siswa)*
```typescript
interface VocabCardWithProgress extends VocabCardView {
  progress: SRSProgress | null;
  isDue: boolean;   // nextReviewAt <= now ATAU belum pernah review
  isNew: boolean;   // belum pernah review sama sekali
}
```

### CreateVocabInput
```typescript
interface CreateVocabInput {
  word: string;
  translation: string;
  definition: string;
  example: string;
  v1?: string;
  v2?: string;
  v3?: string;
  ving?: string;
  vs?: string;
  kelasId: string;
  guruId: string;
}
```

**Endpoints:**
| Method | Path | Keterangan |
|---|---|---|
| `GET` | `/vocab?guruId=` | Guru: semua kartu miliknya |
| `GET` | `/vocab/review?siswaId=` | Siswa: kartu yang due hari ini (due + new) |
| `POST` | `/vocab` | Guru buat kartu |
| `DELETE` | `/vocab/:id` | Guru hapus kartu |
| `POST` | `/vocab/review` | Siswa submit rating → backend jalankan SM-2 |

**Body `POST /vocab/review`:**
```json
{ "cardId": "vc-001", "siswaId": "u-004", "quality": 5 }
```

---

## Feature: Nilai (Guru + Siswa)

> Nilai diambil dari field `nilai` di dalam `HasilLatihan` dan `SubmisiTugas`.
> Tidak ada entity `Nilai` tersendiri — guru update nilai lewat endpoint:
> - `PATCH /latihan/:id/hasil/:hasilId/nilai` → `{ nilai: number }`
> - `PATCH /tugas/:id/submisi/:submisiId/nilai` → `{ nilai: number }`

---

## Ringkasan Tabel Database

| Tabel | PK | FK Penting |
|---|---|---|
| `users` | `id` | — |
| `kelas` | `id` | — |
| `materi` | `id` | `kelasId`, `guruId` |
| `materi_lampiran` | `id` | `materiId` |
| `latihan` | `id` | `kelasId`, `guruId` |
| `latihan_lampiran` | `id` | `latihanId` |
| `hasil_latihan` | `id` | `latihanId`, `siswaId` |
| `hasil_latihan_lampiran` | `id` | `hasilLatihanId` |
| `tugas` | `id` | `kelasId`, `guruId` |
| `tugas_lampiran` | `id` | `tugasId` |
| `submisi_tugas` | `id` | `tugasId`, `siswaId` |
| `submisi_tugas_lampiran` | `id` | `submisiTugasId` |
| `pertemuan` | `id` | `kelasId`, `guruId` |
| `vocab_cards` | `id` | `kelasId`, `guruId` |
| `srs_progress` | `id` | `cardId`, `siswaId` |

> Lampiran bisa disederhanakan: simpan sebagai `JSONB` column di entity induk (`materi.lampiran`, `latihan.lampiran`, dst) jika tidak butuh query per-lampiran.
