import { Schema, model, HydratedDocument } from 'mongoose';
import { uuidId, baseSchemaOptions } from '@/utils/mongoose';

export interface IPertemuan {
  _id: string;
  id: string;
  judul: string;
  kelasId: string;
  guruId: string;
  jadwal: Date;
  durasi: number;
  zoomMeetingId: string;
  zoomJoinUrl: string;
  zoomStartUrl: string;
  zoomPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PertemuanDocument = HydratedDocument<IPertemuan>;

const pertemuanSchema = new Schema<IPertemuan>(
  {
    _id: uuidId,
    judul: { type: String, required: true, trim: true },
    kelasId: { type: String, required: true },
    guruId: { type: String, required: true },
    jadwal: { type: Date, required: true },
    durasi: { type: Number, required: true, min: 1 },
    zoomMeetingId: { type: String, required: true },
    zoomJoinUrl: { type: String, required: true },
    zoomStartUrl: { type: String, required: true },
    zoomPassword: { type: String, required: true },
  },
  baseSchemaOptions,
);

pertemuanSchema.index({ guruId: 1 });
pertemuanSchema.index({ kelasId: 1 });

export const PertemuanModel = model<IPertemuan>('Pertemuan', pertemuanSchema);
