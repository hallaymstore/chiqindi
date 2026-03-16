const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['user_sale', 'point_transfer', 'factory_purchase', 'manual_adjustment'],
      default: 'user_sale'
    },
    sourceUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sourcePoint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionPoint'
    },
    destinationFactory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Factory'
    },
    pickupRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupRequest'
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteListing'
    },
    amount: {
      type: Number,
      default: 0
    },
    weight: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    transactionId: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
