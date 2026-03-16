const mongoose = require('mongoose');
const { DEFAULT_COORDINATES } = require('../utils/constants');

const CollectionPointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    address: {
      type: String,
      required: true
    },
    region: {
      type: String,
      trim: true
    },
    phone: {
      type: String
    },
    email: {
      type: String
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
    capacityKg: {
      type: Number,
      default: 0
    },
    storedKg: {
      type: Number,
      default: 0
    },
    acceptedCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WasteCategory'
      }
    ],
    hours: {
      type: String,
      default: '08:00 - 20:00'
    },
    description: {
      type: String,
      trim: true
    },
    features: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
);

CollectionPointSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('CollectionPoint', CollectionPointSchema);
