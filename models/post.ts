import { Schema, model, models } from 'mongoose';

const postSchema = new Schema(
  {
    title: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    image: String,
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'posts' },
);

// Check if the model exists before compiling it
export const PostModel = models.Post || model('Post', postSchema);
export { postSchema };
