const mongoose = require('mongoose');

const FaqItemSchema = new mongoose.Schema(
  {
    question: String,
    answer: String
  },
  { _id: false }
);

const SiteSettingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'ChiqindiBor'
    },
    tagline: {
      type: String,
      default: 'Plastik chiqindini iqtisodiy resursga aylantiring'
    },
    description: {
      type: String,
      default: 'Plastik chiqindilarni yig‘ish, sotish va qayta ishlash uchun yagona raqamli platforma.'
    },
    supportEmail: {
      type: String,
      default: 'support@chiqindibor.uz'
    },
    supportPhone: {
      type: String,
      default: '+998 90 000 00 00'
    },
    address: {
      type: String,
      default: 'Toshkent shahri'
    },
    heroTitle: {
      type: String,
      default: 'Plastik chiqindini daromadga aylantiring'
    },
    heroSubtitle: {
      type: String,
      default: 'Fuqarolar, punktlar va zavodlarni bitta ekotizimga ulaymiz.'
    },
    commissionRate: {
      type: Number,
      default: 8
    },
    wastePricingMode: {
      type: String,
      default: 'dynamic'
    },
    faqItems: {
      type: [FaqItemSchema],
      default: []
    },
    seoDefaults: {
      title: {
        type: String,
        default: 'ChiqindiBor'
      },
      description: {
        type: String,
        default: 'ChiqindiBor bilan plastik chiqindilarni tez topshiring, pickup buyurtma qiling va daromad oling.'
      }
    },
    socialLinks: {
      telegram: String,
      instagram: String,
      linkedin: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSetting', SiteSettingSchema);
