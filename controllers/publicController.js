const ContactMessage = require('../models/ContactMessage');
const WasteCategory = require('../models/WasteCategory');
const CollectionPoint = require('../models/CollectionPoint');
const Factory = require('../models/Factory');
const BlogPost = require('../models/BlogPost');
const SiteSetting = require('../models/SiteSetting');
const { getHomeStats, getGlobalAnalytics } = require('../services/analyticsService');

const testimonials = [
  {
    name: 'Dilnoza Karimova',
    role: 'Mahalla faoli',
    quote: 'ChiqindiBor orqali plastik chiqindilarimizni tizimli topshirib, mahalla daromadini oshirdik.'
  },
  {
    name: 'Bekzod Xasanov',
    role: 'Haydovchi',
    quote: "Buyurtmalar aniq ko'rinadi, marshrutlar soddalashdi va kunlik samaradorligim oshdi."
  },
  {
    name: 'Eco Polymer',
    role: 'Qayta ishlash zavodi',
    quote: 'Platforma punktlar va aholidan keladigan plastik hajmini aniq prognoz qilishga yordam berdi.'
  }
];

const steps = [
  { icon: 'ri-camera-lens-line', title: "Surat va ma'lumot qo'shing", text: "Plastik chiqindi rasmi, turi va taxminiy vaznini kiriting." },
  { icon: 'ri-map-pin-2-line', title: 'Manzilni belgilang', text: "Olib ketish manzilini yoki yaqin qabul punktini tanlang." },
  { icon: 'ri-truck-line', title: 'Topshiring yoki chaqiring', text: "Haydovchi olib ketadi yoki siz chiqindini punktga topshirasiz." },
  { icon: 'ri-wallet-3-line', title: 'Daromadni oling', text: "Tasdiqlangan vazn bo'yicha to'lov va hisob-kitobni kuzating." }
];

const benefits = [
  'Har bir kilogramm plastik uchun shaffof narxlar',
  'Qabul punktlari va zavodlar bilan yagona ekotizim',
  "Olib ketish holatlarini aniq va qulay kuzatish",
  "Ekologik ta'sir va daromad natijalarini bir joyda ko'rish"
];

const renderPage = (res, view, payload = {}) =>
  res.render(view, {
    layout: 'layouts/main',
    ...payload
  });

const home = async (req, res, next) => {
  try {
    const [stats, categories, points, factories, posts] = await Promise.all([
      getHomeStats(),
      WasteCategory.find({ isActive: true }).sort({ sortOrder: 1 }).limit(6).lean(),
      CollectionPoint.find({ status: 'active' }).limit(6).lean(),
      Factory.find({ status: 'active' }).limit(6).lean(),
      BlogPost.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(3).lean()
    ]);

    renderPage(res, 'public/home', {
      pageTitle: 'Bosh sahifa',
      pageDescription: "Plastik chiqindini yig'ish, topshirish va daromadga aylantirish uchun zamonaviy raqamli platforma.",
      stats,
      categories,
      points,
      factories,
      posts,
      testimonials,
      steps,
      benefits
    });
  } catch (error) {
    next(error);
  }
};

const about = async (req, res, next) => {
  try {
    const analytics = await getGlobalAnalytics();
    renderPage(res, 'public/about', {
      pageTitle: 'Loyiha haqida',
      pageDescription: 'ChiqindiBor ekologiya va daromadni birlashtiruvchi platforma haqida.',
      analytics: analytics.totals
    });
  } catch (error) {
    next(error);
  }
};

const howItWorks = async (req, res, next) => {
  try {
    renderPage(res, 'public/how-it-works', {
      pageTitle: 'Qanday ishlaydi',
      pageDescription: "Platforma qanday ishlashi va xizmatlar oqimi bilan tanishing.",
      steps,
      benefits
    });
  } catch (error) {
    next(error);
  }
};

const collectionPoints = async (req, res, next) => {
  try {
    const points = await CollectionPoint.find({ status: 'active' }).populate('acceptedCategories manager').lean();
    renderPage(res, 'public/collection-points', {
      pageTitle: 'Punktlar xaritasi',
      pageDescription: "Yaqin qabul punktlarini xaritada toping va qabul shartlarini ko'ring.",
      points
    });
  } catch (error) {
    next(error);
  }
};

const partners = async (req, res, next) => {
  try {
    const factories = await Factory.find({ status: 'active' }).populate('acceptedCategories').lean();
    renderPage(res, 'public/partners', {
      pageTitle: 'Hamkor zavodlar',
      pageDescription: 'Plastik chiqindini qayta ishlaydigan hamkor zavodlar va fabrikalar.',
      factories
    });
  } catch (error) {
    next(error);
  }
};

const pricing = async (req, res, next) => {
  try {
    const categories = await WasteCategory.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    renderPage(res, 'public/pricing', {
      pageTitle: 'Narxlar va stavkalar',
      pageDescription: "Plastik chiqindi turlari bo'yicha joriy narxlarni ko'ring.",
      categories
    });
  } catch (error) {
    next(error);
  }
};

const blog = async (req, res, next) => {
  try {
    const search = req.query.q?.trim();
    const filter = { status: 'published' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await BlogPost.find(filter).populate('author').sort({ publishedAt: -1, createdAt: -1 }).lean();
    renderPage(res, 'public/blog-index', {
      pageTitle: 'Blog va yangiliklar',
      pageDescription: "Ekologiya, qayta ishlash va chiqindi iqtisodiyoti bo'yicha maqolalar.",
      posts,
      search
    });
  } catch (error) {
    next(error);
  }
};

const blogDetail = async (req, res, next) => {
  try {
    const post = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author')
      .lean();

    if (!post) {
      return res.status(404).render('public/errors/404', {
        layout: 'layouts/main',
        pageTitle: 'Maqola topilmadi',
        pageDescription: "So'ralgan maqola mavjud emas."
      });
    }

    const recentPosts = await BlogPost.find({ status: 'published', _id: { $ne: post._id } })
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean();

    return renderPage(res, 'public/blog-detail', {
      pageTitle: post.seoTitle || post.title,
      pageDescription: post.seoDescription || post.excerpt,
      post,
      recentPosts
    });
  } catch (error) {
    return next(error);
  }
};

const faq = async (req, res, next) => {
  try {
    const settings = await SiteSetting.findOne().lean();
    renderPage(res, 'public/faq', {
      pageTitle: "Ko'p beriladigan savollar",
      pageDescription: "Olib ketish xizmati, punktlar, to'lov va zavodlar bo'yicha savollar.",
      faqs: settings?.faqItems || []
    });
  } catch (error) {
    next(error);
  }
};

const contact = async (req, res, next) => {
  try {
    renderPage(res, 'public/contact', {
      pageTitle: 'Aloqa',
      pageDescription: "Jamoamizga xabar yuboring yoki hamkorlik bo'yicha murojaat qiling."
    });
  } catch (error) {
    next(error);
  }
};

const submitContact = async (req, res, next) => {
  try {
    await ContactMessage.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company: req.body.company,
      subject: req.body.subject,
      message: req.body.message,
      sourcePage: 'contact'
    });

    req.flash('success', "Murojaatingiz qabul qilindi. Tez orada siz bilan bog'lanamiz.");
    res.redirect('/aloqa');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  home,
  about,
  howItWorks,
  collectionPoints,
  partners,
  pricing,
  blog,
  blogDetail,
  faq,
  contact,
  submitContact
};