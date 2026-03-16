const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    company: String,
    subject: String,
    message: {
      type: String,
      required: true
    },
    sourcePage: {
      type: String,
      default: 'contact'
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'closed'],
      default: 'new'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
