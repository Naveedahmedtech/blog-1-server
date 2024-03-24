import { Schema, model, models } from 'mongoose';

const tagSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'tags' },
);

// Check if the model exists before compiling it
export const TagModel = models.Tag || model('Tag', tagSchema);
export { tagSchema };
