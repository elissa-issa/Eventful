const mongoose = require('mongoose');
const { SERVICE_TYPES } = require('../constants/serviceTypes');

const collectionItemSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: SERVICE_TYPES,
    },
    itemId: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1,
    },
    selectedOptions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    pricingSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    titleSnapshot: {
      type: String,
      default: '',
      trim: true,
    },
    imageSnapshot: {
      type: String,
      default: '',
      trim: true,
    },
    vendorSnapshot: {
      type: String,
      default: '',
      trim: true,
    },
    priceTextSnapshot: {
      type: String,
      default: '',
      trim: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
    versionKey: false,
  },
);

const collectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    items: {
      type: [collectionItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

collectionSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('Collection', collectionSchema);
