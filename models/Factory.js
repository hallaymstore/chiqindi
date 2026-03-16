const mongoose = require('mongoose');
const { DEFAULT_COORDINATES } = require('../utils/constants');

const PurchasePriceSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteCategory'
    },
    pricePerKg: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const FactorySchema = new mongoose.Schema(
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
    region: String,
    phone: String,
    email: String,
    website: String,
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
    purchasePrices: {
      type: [PurchasePriceSchema],
      default: []
    },
    acceptedCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WasteCategory'
      }
    ],
    dailyCapacityKg: {
      type: Number,
      default: 0
    },
    processedKg: {
      type: Number,
      default: 0
    },
    description: String,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
);

FactorySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Factory', FactorySchema);
