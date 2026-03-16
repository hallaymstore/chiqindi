const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    excerpt: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    featuredImage: {
      type: String,
      default: '/images/blog-placeholder.svg'
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    categories: {
      type: [String],
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    seoTitle: String,
    seoDescription: String,
    publishedAt: Date,
    views: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BlogPost', BlogPostSchema);
