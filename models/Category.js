import mongoose from 'mongoose';
import Category from './Category';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => /^[a-z0-9-]+$/.test(v),
        message: 'Slug must be lowercase letters, numbers, and hyphens only'
      }
    }, image: { type: String },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    properties: [{ type: Object }],
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model('Category', categorySchema);