const mongoose = require('mongoose');
const { SERVICE_TYPES } = require('../constants/serviceTypes');

const orderItemSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    selectedDate: {
      type: Date,
      default: null,
    },
    customOptions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
    versionKey: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(items) {
          return items.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'completed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('Order', orderSchema);
