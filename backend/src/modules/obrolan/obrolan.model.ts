import { Schema, model, HydratedDocument } from 'mongoose';
import { uuidId, baseSchemaOptions } from '@/utils/mongoose';

export type ObrolanRole = 'GURU' | 'SISWA';

export interface IObrolan {
  _id: string;
  id: string;
  materiId: string;
  userId: string;
  userNama: string;
  userRole: ObrolanRole;
  teks: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ObrolanDocument = HydratedDocument<IObrolan>;

const obrolanSchema = new Schema<IObrolan>(
  {
    _id: uuidId,
    materiId: { type: String, required: true },
    userId: { type: String, required: true },
    userNama: { type: String, required: true },
    userRole: { type: String, enum: ['GURU', 'SISWA'], required: true },
    teks: { type: String, required: true, maxlength: 1000 },
  },
  baseSchemaOptions,
);

obrolanSchema.index({ materiId: 1, createdAt: 1 });

export const ObrolanModel = model<IObrolan>('Obrolan', obrolanSchema);
