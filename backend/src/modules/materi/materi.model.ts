import { randomUUID } from 'crypto';
import { Schema, model, HydratedDocument } from 'mongoose';
import { uuidId, baseSchemaOptions } from '@/utils/mongoose';

export interface ILampiran {
  id: string;
  nama: string;
  ukuran: number;
  tipe: string;
  url: string;
}

export interface IMateri {
  _id: string;
  id: string;
  judul: string;
  konten: string;
  kelasId: string;
  guruId: string;
  lampiran: ILampiran[];
  createdAt: Date;
  updatedAt: Date;
}

export type MateriDocument = HydratedDocument<IMateri>;

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

const materiSchema = new Schema<IMateri>(
  {
    _id: uuidId,
    judul: { type: String, required: true, trim: true },
    konten: { type: String, required: true },
    kelasId: { type: String, required: true },
    guruId: { type: String, required: true },
    lampiran: { type: [lampiranSchema], default: [] },
  },
  baseSchemaOptions,
);

materiSchema.index({ guruId: 1 });
materiSchema.index({ kelasId: 1 });

export const MateriModel = model<IMateri>('Materi', materiSchema);
