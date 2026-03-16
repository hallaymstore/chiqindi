const mongoose = require('mongoose');
const { LISTING_STATUSES, DEFAULT_COORDINATES } = require('../utils/constants');

const WasteListingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteCategory',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    estimatedWeight: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    region: {
      type: String,
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: DEFAULT_COORDINATES
      }
    },
    preferredPickupAt: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    },
    requestedPickup: {
      type: Boolean,
      default: true
    },
    offeredRate: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: LISTING_STATUSES,
      default: 'submitted'
    }
  },
  { timestamps: true }
);

WasteListingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('WasteListing', WasteListingSchema);
