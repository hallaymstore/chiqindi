const mongoose = require('mongoose');

const WasteCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    pricePerKg: {
      type: Number,
      required: true,
      default: 0
    },
    description: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      default: '/images/category-placeholder.svg'
    },
    icon: {
      type: String,
      default: 'ri-recycle-line'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    palette: {
      type: String,
      default: 'from-emerald'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WasteCategory', WasteCategorySchema);
