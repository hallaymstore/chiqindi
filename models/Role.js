const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    permissions: {
      type: [String],
      default: []
    },
    accentColor: {
      type: String,
      default: '#1fd69f'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', RoleSchema);
