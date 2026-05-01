const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    imageSrc: {
      type: String,
      required: true,
      trim: true,
    },
    imageAlt: {
      type: String,
      required: true,
      trim: true,
    },
    galleryImages: {
      type: [
        {
          src: {
            type: String,
            required: true,
            trim: true,
          },
          alt: {
            type: String,
            default: '',
            trim: true,
          },
        },
      ],
      default: [],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    detailsDescription: {
      type: String,
      required: true,
      trim: true,
    },
    guestText: {
      type: String,
      required: true,
      trim: true,
    },
    priceText: {
      type: String,
      required: true,
      trim: true,
    },
    discountLabel: {
      type: String,
      default: '',
      trim: true,
    },
    vendorName: {
      type: String,
      required: true,
      trim: true,
    },
    vendorLocation: {
      type: String,
      required: true,
      trim: true,
    },
    ratingValue: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      required: true,
      min: 0,
    },
    detailBadgeText: {
      type: String,
      required: true,
      trim: true,
    },
    supportingInfoText: {
      type: String,
      required: true,
      trim: true,
    },
    peopleLabel: {
      type: String,
      required: true,
      trim: true,
    },
    datePlaceholder: {
      type: String,
      required: true,
      trim: true,
    },
    timePlaceholder: {
      type: String,
      required: true,
      trim: true,
    },
    actionButtonText: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    placement: {
      type: String,
      required: true,
      enum: ['indoor', 'outdoor'],
    },
    time: {
      type: String,
      required: true,
      enum: ['day', 'night'],
    },
    minGuests: {
      type: Number,
      required: true,
      min: 0,
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 0,
    },
    priceValue: {
      type: Number,
      required: true,
      min: 0,
    },
    vendorLogoSrc: {
      type: String,
      default: '',
      trim: true,
    },
    vendorLogoAlt: {
      type: String,
      default: '',
      trim: true,
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

module.exports = mongoose.model('Venue', venueSchema);
