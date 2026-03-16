const mongoose = require('mongoose');
const { PAYMENT_STATUSES } = require('../utils/constants');

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pickupRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupRequest'
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
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
    paymentMethod: {
      type: String,
      default: 'manual_transfer'
    },
    transactionId: {
      type: String
    },
    payoutDate: {
      type: Date
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
