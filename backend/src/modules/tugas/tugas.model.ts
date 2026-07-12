import { randomUUID } from 'crypto';
import { Schema, model, HydratedDocument } from 'mongoose';
import { uuidId, baseSchemaOptions } from '@/utils/mongoose';
import { ILampiran } from '@/modules/materi/materi.model';

const lampiranSchema = new Schema<ILampiran>(
  {
    id: { type: String, default: () => randomUUID() },
    nama: { type: String, required: true },
    ukuran: { type: Number, required: true },
    tipe: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

// ── Tugas ─────────────────────────────────────────────────

export interface ITugas {
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

export type TugasDocument = HydratedDocument<ITugas>;

const tugasSchema = new Schema<ITugas>(
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

tugasSchema.index({ guruId: 1 });
tugasSchema.index({ kelasId: 1 });

export const TugasModel = model<ITugas>('Tugas', tugasSchema);

// ── SubmisiTugas ──────────────────────────────────────────

export interface ISubmisiTugas {
  _id: string;
  id: string;
  tugasId: string;
  siswaId: string;
  jawaban: string;
  catatan: string;
  lampiran: ILampiran[];
  nilai?: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SubmisiTugasDocument = HydratedDocument<ISubmisiTugas>;

const submisiTugasSchema = new Schema<ISubmisiTugas>(
  {
    _id: uuidId,
    tugasId: { type: String, required: true },
    siswaId: { type: String, required: true },
    jawaban: { type: String, required: true },
    catatan: { type: String, default: '' },
    lampiran: { type: [lampiranSchema], default: [] },
    nilai: { type: Number, min: 0, max: 100 },
    submittedAt: { type: Date, required: true },
  },
  baseSchemaOptions,
);

submisiTugasSchema.index({ tugasId: 1 });
submisiTugasSchema.index({ tugasId: 1, siswaId: 1 }, { unique: true });

export const SubmisiTugasModel = model<ISubmisiTugas>('SubmisiTugas', submisiTugasSchema);
