# Design: Feature Nilai (Guru + Siswa)

**Date:** 2026-06-27  
**Status:** Approved

---

## Backend Contract (verified)

No separate `Nilai` entity. Nilai lives inside:
- `HasilLatihan.nilai` — graded by guru via `PATCH /latihan/:id/hasil/:hasilId/nilai`
- `SubmisiTugas.nilai` — graded by guru via `PATCH /tugas/:id/submisi/:submisiId/nilai`

Both backend phases 6 & 7 are complete.

---

## 1. Data Model

### `HasilLatihanNilai` (frontend view type)
```typescript
interface HasilLatihanNilai extends BaseEntity {
  latihanId: string;
  latihanJudul: string;     // joined
  siswaId: string;
  siswaNama: string;        // joined
  siswaEmail: string;       // joined
  kelasId: string;
  kelasNama: string;        // joined
  jawaban: string;
  nilai?: number;           // undefined = belum dinilai
  submittedAt: string;
}
```

### `SubmisiTugasNilai` (frontend view type)
```typescript
interface SubmisiTugasNilai extends BaseEntity {
  tugasId: string;
  tugasJudul: string;
  siswaId: string;
  siswaNama: string;
  siswaEmail: string;
  kelasId: string;
  kelasNama: string;
  catatan: string;
  nilai?: number;
  submittedAt: string;
}
```

### `NilaiSiswa` (siswa view)
```typescript
interface NilaiSiswa {
  latihan: HasilLatihanNilai[];
  tugas: SubmisiTugasNilai[];
}
```

### `UpdateNilaiInput`
```typescript
interface UpdateNilaiInput {
  nilai: number; // 0–100
}
```

---

## 2. File Structure

```
src/features/nilai/
├── types/
│   └── nilai.types.ts
├── services/
│   ├── nilai.dummy.ts
│   └── nilai.service.ts
├── actions/
│   ├── update-hasil-latihan-nilai.action.ts
│   └── update-submisi-tugas-nilai.action.ts
├── components/
│   ├── NilaiTable.tsx          # guru — tabbed table (latihan + tugas)
│   ├── NilaiBeriModal.tsx      # guru — modal input nilai + lihat jawaban
│   ├── NilaiSiswaTable.tsx     # siswa — tabel nilai pribadi
│   ├── NilaiBadge.tsx          # shared — badge warna nilai
│   └── NilaiPrintView.tsx      # siswa — print-ready layout
└── stores/
    └── nilai-ui.store.ts
```

---

## 3. Guru — Kelola Nilai (`/guru/nilai`)

### Layout
Page header: "Kelola Nilai" + no CTA button (nilai berasal dari submisi).

Two tabs below header: **Nilai Latihan** | **Nilai Tugas**

### Table per tab
Columns:
```
No | Nama Siswa | Judul Latihan/Tugas | Kelas | Tgl Submit | Nilai | Aksi
```

- **Nilai cell:** Jika `nilai === undefined` → badge "Belum Dinilai" (amber). Jika sudah → angka + NilaiBadge.
- **Aksi:** Tombol "Beri Nilai" (jika belum) atau "Ubah Nilai" (jika sudah) → buka `NilaiBeriModal`.
- **Search:** Filter by nama siswa atau judul latihan/tugas (client-side).
- **Filter kelas:** Dropdown select kelas (client-side filter).

### `NilaiBeriModal`
```
┌─────────────────────────────────────────────┐
│ Beri Nilai — [Nama Siswa]           [×]    │
├─────────────────────────────────────────────┤
│ Latihan: [Judul Latihan]                    │
│ Dikumpulkan: [tanggal]                      │
│                                             │
│ Jawaban Siswa:                              │
│ ┌───────────────────────────────────────┐  │
│ │ [konten jawaban — scrollable, 4 baris]│  │
│ └───────────────────────────────────────┘  │
│                                             │
│ Nilai (0–100):                              │
│ ┌────────┐                                  │
│ │  [85]  │                                  │
│ └────────┘                                  │
│                                             │
│              [Batal]  [Simpan Nilai]        │
└─────────────────────────────────────────────┘
```

Validation: number 0–100, required integer.

---

## 4. Siswa — Nilai Saya (`/siswa/nilai`)

### Layout
Page header: "Nilai Saya" + tombol **Download PDF** (kanan atas).

Two sections stacked:
1. **Nilai Latihan** — card dengan tabel
2. **Nilai Tugas** — card dengan tabel

Tiap section menampilkan rata-rata di footer card.

### Table per section
```
No | Judul | Tgl Submit | Nilai
```
- **Nilai cell:** `NilaiBadge` (hijau ≥ 80, kuning 60–79, merah < 60, abu "—" jika belum dinilai)

### PDF Download
`window.print()` — trigger `NilaiPrintView` muncul via `@media print`, komponen lain hide dengan `print:hidden`. Menampilkan nama siswa, tanggal cetak, dua tabel nilai, dan rata-rata.

---

## 5. `NilaiBadge` Spec
```
nilai >= 80  → bg-emerald-100 text-emerald-700  "A" prefix optional
nilai 60-79  → bg-amber-100 text-amber-700
nilai < 60   → bg-red-100 text-red-700
undefined    → bg-slate-100 text-slate-500 "—"
```

---

## 6. Store (`nilai-ui.store.ts`)
```typescript
interface NilaiUIStore {
  activeTab: "latihan" | "tugas";
  setActiveTab: (tab: "latihan" | "tugas") => void;
  
  modalTarget: { type: "latihan" | "tugas"; item: HasilLatihanNilai | SubmisiTugasNilai } | null;
  openModal: (type: "latihan" | "tugas", item: HasilLatihanNilai | SubmisiTugasNilai) => void;
  closeModal: () => void;
}
```

---

## 7. Service Functions

### Dummy
```typescript
// Guru
fetchHasilLatihanByGuru(guruId: string): Promise<HasilLatihanNilai[]>
fetchSubmisiTugasByGuru(guruId: string): Promise<SubmisiTugasNilai[]>
updateHasilLatihanNilaiRequest(latihanId, hasilId, input): Promise<HasilLatihanNilai>
updateSubmisiTugasNilaiRequest(tugasId, submisiId, input): Promise<SubmisiTugasNilai>

// Siswa
fetchNilaiSiswa(siswaId: string): Promise<NilaiSiswa>
```

### Real service (swap later)
Same signatures — body calls `apiFetch` to backend endpoints.

---

## 8. Server Actions

```typescript
// update-hasil-latihan-nilai.action.ts
export async function updateHasilLatihanNilai(
  latihanId: string,
  hasilId: string,
  data: UpdateNilaiInput
): Promise<ActionResponse<HasilLatihanNilai>>

// update-submisi-tugas-nilai.action.ts
export async function updateSubmisiTugasNilai(
  tugasId: string,
  submisiId: string,
  data: UpdateNilaiInput
): Promise<ActionResponse<SubmisiTugasNilai>>
```

---

## 9. CLAUDE.md Rule to Add

> **Selalu cek backend sebelum implementasi:** Sebelum menulis types, services, atau UI untuk feature apapun, baca `C:\Alex-sistem\E-Learning-app\backend\docs\MODELS.md` dan `backend\docs\TASKS.md` untuk memastikan kontrak API sudah benar dan endpoint sudah ada.
