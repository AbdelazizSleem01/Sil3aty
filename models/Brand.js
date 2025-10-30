import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  logo: { type: String, required: true }, 
  isActive: { type: Boolean, default: true },
});

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
export default Brand;