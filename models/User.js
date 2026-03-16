const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, DEFAULT_COORDINATES } = require('../utils/constants');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER
    },
    avatar: {
      type: String,
      default: '/images/avatar-placeholder.svg'
    },
    companyName: {
      type: String,
      trim: true
    },
    region: {
      type: String,
      trim: true
    },
    address: {
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
    favoriteCollectionPoints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CollectionPoint'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    stats: {
      totalKg: {
        type: Number,
        default: 0
      },
      totalEarnings: {
        type: Number,
        default: 0
      },
      completedPickups: {
        type: Number,
        default: 0
      },
      rating: {
        type: Number,
        default: 4.8
      }
    },
    lastLoginAt: {
      type: Date
    }
  },
  { timestamps: true }
);

UserSchema.index({ location: '2dsphere' });

UserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

UserSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
