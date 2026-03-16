const mongoose = require('mongoose');
const { PICKUP_STATUSES, DEFAULT_COORDINATES, PAYMENT_STATUSES } = require('../utils/constants');

const PickupTimelineSchema = new mongoose.Schema(
  {
    status: String,
    note: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const PickupRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteListing',
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteCategory',
      required: true
    },
    assignedCollector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    collectionPoint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionPoint'
    },
    factory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Factory'
    },
    status: {
      type: String,
      enum: PICKUP_STATUSES,
      default: 'pending'
    },
    estimatedWeight: {
      type: Number,
      required: true
    },
    actualWeight: {
      type: Number,
      default: 0
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
    preferredDate: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    proofPhotos: {
      type: [String],
      default: []
    },
    offeredRate: {
      type: Number,
      default: 0
    },
    estimatedAmount: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'pending'
    },
    timeline: {
      type: [PickupTimelineSchema],
      default: []
    }
  },
  { timestamps: true }
);

PickupRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('PickupRequest', PickupRequestSchema);
