const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    imageSrc: {
      type: String,
      default: '',
      trim: true,
    },
    imageAlt: {
      type: String,
      default: '',
      trim: true,
    },
    priceValue: {
      type: Number,
      required: true,
      min: 0,
    },
    priceText: {
      type: String,
      default: '',
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    leftText: {
      type: String,
      default: '',
      trim: true,
    },
    rightText: {
      type: String,
      default: '',
      trim: true,
    },
    primaryButtonLabel: {
      type: String,
      default: 'View Plan',
      trim: true,
    },
    secondaryButtonLabel: {
      type: String,
      default: 'Add to Cart',
      trim: true,
    },
    vendorName: {
      type: String,
      default: '',
      trim: true,
    },
    vendorLocation: {
      type: String,
      default: '',
      trim: true,
    },
    ratingValue: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    showPeopleSelector: {
      type: Boolean,
      default: false,
    },
    datePlaceholder: {
      type: String,
      default: 'Select Date',
      trim: true,
    },
    timePlaceholder: {
      type: String,
      default: 'Select Time',
      trim: true,
    },
    actionButtonText: {
      type: String,
      default: 'Add to Cart',
      trim: true,
    },
    planItems: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_document, returnedObject) => {
        returnedObject.mongoId = returnedObject._id.toString();
        returnedObject.id = returnedObject.itemId;
        delete returnedObject._id;
        delete returnedObject.itemId;
        return returnedObject;
      },
    },
  },
);

module.exports = mongoose.model('Bundle', bundleSchema);
