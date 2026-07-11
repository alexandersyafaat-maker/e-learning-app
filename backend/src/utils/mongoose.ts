import { randomUUID } from 'crypto';
import { SchemaDefinitionProperty, SchemaOptions } from 'mongoose';

/**
 * String `_id` defaulting to UUID v4. Use as `_id` field in every schema so the
 * exposed `id` matches docs/MODELS.md convention (UUID v4 string, not ObjectId).
 */
export const uuidId: SchemaDefinitionProperty<string> = {
  type: String,
  default: () => randomUUID(),
};

/**
 * Shared schema options:
 * - `timestamps` → createdAt / updatedAt (Date)
 * - toJSON transform → expose `id`, drop `_id`/`__v`/`password`, dates → ISO 8601 string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const baseSchemaOptions: SchemaOptions<any> = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(_doc, ret: Record<string, unknown>) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.toISOString();
      if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.toISOString();
      return ret;
    },
  },
};
