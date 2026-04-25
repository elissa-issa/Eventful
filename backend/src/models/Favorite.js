const mongoose = require('mongoose');
const { SERVICE_TYPES } = require('../constants/serviceTypes');

const favoriteItemSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: SERVICE_TYPES,
    },
  },
  {
    _id: true,
    versionKey: false,
  },
);

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [favoriteItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('Favorite', favoriteSchema);
