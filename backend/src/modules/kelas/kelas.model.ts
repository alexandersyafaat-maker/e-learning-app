import { Schema, model, HydratedDocument } from 'mongoose';
import { uuidId, baseSchemaOptions } from '@/utils/mongoose';

export interface IKelas {
  _id: string;
  id: string;
  nama: string;
  tingkat: string;
  tahunAjaran: string;
  deskripsi?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type KelasDocument = HydratedDocument<IKelas>;

const kelasSchema = new Schema<IKelas>(
  {
    _id: uuidId,
    nama: { type: String, required: true, trim: true },
    tingkat: { type: String, required: true, trim: true },
    tahunAjaran: { type: String, required: true, trim: true },
    deskripsi: { type: String },
  },
  baseSchemaOptions,
);

export const KelasModel = model<IKelas>('Kelas', kelasSchema);
