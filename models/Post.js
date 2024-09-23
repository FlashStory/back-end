const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: [{ type: String, required: true }],
  collectionName: { type: String, required: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', required: true },
  reactions: {
    like: { type: Number, default: 0 },
    mindBlowing: { type: Number, default: 0 },
    alreadyKnew: { type: Number, default: 0 },
    hardToBelieve: { type: Number, default: 0 },
    interesting: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);