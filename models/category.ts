import { Schema, model, models } from 'mongoose';

const categorySchema = new Schema(
  {
    name: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'categories' },
);

// Check if the model exists before compiling it
export const CategoryModel =
  models.Category || model('Category', categorySchema);
export { categorySchema };
