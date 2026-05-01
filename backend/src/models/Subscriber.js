const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userEmail: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    userName: {
      type: String,
      default: '',
      trim: true,
    },
    source: {
      type: String,
      default: 'newsletter',
      trim: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    lastSubscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'subscribers',
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        return returnedObject;
      },
    },
  },
);

module.exports = mongoose.model('Subscriber', subscriberSchema);
