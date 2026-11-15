import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    device: { type: String, default: 'Unknown' },
    browser: { type: String, default: 'Unknown' },
    os: { type: String, default: 'Unknown' },
    referrer: { type: String, default: 'Direct' }
  },
  { _id: false }
);

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true, trim: true },
  shortCode: { type: String, required: true, unique: true, index: true },
  isCustom: { type: Boolean, default: false },
  expiresAt: { type: Date, default: null },
  totalClicks: { type: Number, default: 0 },
  analytics: { type: [clickSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $type: 'date' } } });

export default mongoose.model('Url', urlSchema);
