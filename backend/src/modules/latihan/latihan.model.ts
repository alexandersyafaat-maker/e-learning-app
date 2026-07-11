import { Schema, model, HydratedDocument } from 'mongoose';
import { uuidId, baseSchemaOptions } from '@/utils/mongoose';
import { ILampiran } from '@/modules/materi/materi.model';

const lampiranSchema = new Schema<ILampiran>(
  {
    id: { type: String, default: () => require('crypto').randomUUID() },
    nama: { type: String, required: true },
    ukuran: { type: Number, required: true },
    tipe: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

// ── Latihan ───────────────────────────────────────────────

export interface ILatihan {
  _id: string;
  id: string;
  judul: string;
  deskripsi: string;
  kelasId: string;
  guruId: string;
  deadline?: Date;
  lampiran: ILampiran[];
  createdAt: Date;
  updatedAt: Date;
}

export type LatihanDocument = HydratedDocument<ILatihan>;

const latihanSchema = new Schema<ILatihan>(
  {
    _id: uuidId,
    judul: { type: String, required: true, trim: true },
    deskripsi: { type: String, required: true },
    kelasId: { type: String, required: true },
    guruId: { type: String, required: true },
    deadline: { type: Date },
    lampiran: { type: [lampiranSchema], default: [] },
  },
  baseSchemaOptions,
);

latihanSchema.index({ guruId: 1 });
latihanSchema.index({ kelasId: 1 });

export const LatihanModel = model<ILatihan>('Latihan', latihanSchema);

// ── HasilLatihan ──────────────────────────────────────────

export interface IHasilLatihan {
  _id: string;
  id: string;
  latihanId: string;
  siswaId: string;
  jawaban: string;
  lampiran: ILampiran[];
  nilai?: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type HasilLatihanDocument = HydratedDocument<IHasilLatihan>;

const hasilLatihanSchema = new Schema<IHasilLatihan>(
  {
    _id: uuidId,
    latihanId: { type: String, required: true },
    siswaId: { type: String, required: true },
    jawaban: { type: String, required: true },
    lampiran: { type: [lampiranSchema], default: [] },
    nilai: { type: Number, min: 0, max: 100 },
    submittedAt: { type: Date, required: true },
  },
  baseSchemaOptions,
);

hasilLatihanSchema.index({ latihanId: 1 });
hasilLatihanSchema.index({ latihanId: 1, siswaId: 1 }, { unique: true });

export const HasilLatihanModel = model<IHasilLatihan>('HasilLatihan', hasilLatihanSchema);
