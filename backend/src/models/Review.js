const mongoose = require('mongoose');
const { SERVICE_TYPES } = require('../constants/serviceTypes');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: SERVICE_TYPES,
    },
    itemId: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    userNameSnapshot: {
      type: String,
      default: '',
      trim: true,
    },
    userAvatarSnapshot: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reviewSchema.index({ serviceType: 1, itemId: 1, createdAt: -1 });
reviewSchema.index({ user: 1, serviceType: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
