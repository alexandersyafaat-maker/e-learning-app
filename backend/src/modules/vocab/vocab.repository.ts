import {
  VocabCardModel,
  VocabCardDocument,
  IVocabCard,
  SRSProgressModel,
  SRSProgressDocument,
  ISRSProgress,
} from '@/modules/vocab/vocab.model';
import { UserModel } from '@/modules/auth/user.model';
import { KelasModel } from '@/modules/kelas/kelas.model';

// ── View types ────────────────────────────────────────────

export interface VocabCardView {
  id: string;
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
  kelasNama: string;
  guruId: string;
  guruNama: string;
  createdAt: string;
  updatedAt: string;
}

export interface VocabCardWithProgress extends VocabCardView {
  progress: Record<string, unknown> | null;
  isDue: boolean;
  isNew: boolean;
}

// ── Helpers ───────────────────────────────────────────────

async function enrichCard(doc: VocabCardDocument): Promise<VocabCardView> {
  const [kelas, guru] = await Promise.all([
    KelasModel.findById(doc.kelasId).exec(),
    UserModel.findById(doc.guruId).exec(),
  ]);
  const base = doc.toJSON() as unknown as VocabCardView;
  return { ...base, kelasNama: kelas?.nama ?? '', guruNama: guru?.name ?? '' };
}

// ── VocabCard queries ─────────────────────────────────────

export async function findCardList(filter: {
  guruId?: string;
  kelasId?: string;
}): Promise<VocabCardView[]> {
  const query: Record<string, string> = {};
  if (filter.guruId) query.guruId = filter.guruId;
  if (filter.kelasId) query.kelasId = filter.kelasId;
  const items = await VocabCardModel.find(query).sort({ createdAt: -1 }).exec();
  return Promise.all(items.map(enrichCard));
}

export async function findCardById(id: string): Promise<VocabCardDocument | null> {
  return VocabCardModel.findById(id).exec();
}

export async function createCard(
  data: Omit<IVocabCard, 'id' | '_id' | 'createdAt' | 'updatedAt'>,
): Promise<VocabCardDocument> {
  return VocabCardModel.create(data);
}

export async function deleteCardById(id: string): Promise<VocabCardDocument | null> {
  return VocabCardModel.findByIdAndDelete(id).exec();
}

// ── SRSProgress queries ───────────────────────────────────

export async function findProgressByCard(
  cardId: string,
  siswaId: string,
): Promise<SRSProgressDocument | null> {
  return SRSProgressModel.findOne({ cardId, siswaId }).exec();
}

export async function upsertProgress(
  cardId: string,
  siswaId: string,
  data: Partial<
    Omit<ISRSProgress, 'id' | '_id' | 'cardId' | 'siswaId' | 'createdAt' | 'updatedAt'>
  >,
): Promise<SRSProgressDocument> {
  const doc = await SRSProgressModel.findOneAndUpdate(
    { cardId, siswaId },
    { $set: data },
    { new: true, upsert: true, runValidators: true },
  ).exec();
  return doc;
}

export async function findCardsWithProgress(
  kelasId: string,
  siswaId: string,
): Promise<VocabCardWithProgress[]> {
  const cards = await VocabCardModel.find({ kelasId }).sort({ createdAt: 1 }).exec();
  const now = new Date();

  return Promise.all(
    cards.map(async (card) => {
      const [view, progress] = await Promise.all([
        enrichCard(card),
        SRSProgressModel.findOne({ cardId: card.id, siswaId }).exec(),
      ]);
      const isNew = !progress;
      const isDue = isNew || progress.nextReviewAt <= now;
      return {
        ...view,
        progress: progress ? progress.toJSON() : null,
        isDue,
        isNew,
      };
    }),
  );
}
