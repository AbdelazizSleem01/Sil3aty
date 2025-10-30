// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    link: { type: String },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, enum: ['order', 'product', 'system','contacts', 'review'], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    relatedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Notification || 
       mongoose.model('Notification', notificationSchema);
