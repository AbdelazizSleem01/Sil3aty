// models/team.js
import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String, required: true },
  facebook: { type: String },
  twitter: { type: String },
  comment: { type: String, required: true },
}, { timestamps: true });

const ourTeam = mongoose.models.ourTeam || mongoose.model('ourTeam', teamSchema);

export default ourTeam;