require('dotenv').config();

const connectDatabase = require('../config/database');
const Role = require('../models/Role');
const User = require('../models/User');
const WasteCategory = require('../models/WasteCategory');
const WasteListing = require('../models/WasteListing');
const PickupRequest = require('../models/PickupRequest');
const CollectionPoint = require('../models/CollectionPoint');
const Factory = require('../models/Factory');
const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const BlogPost = require('../models/BlogPost');
const ContactMessage = require('../models/ContactMessage');
const SiteSetting = require('../models/SiteSetting');
const AuditLog = require('../models/AuditLog');
const { ROLES } = require('../utils/constants');

const PASSWORD = 'Demo123!';

const clearCollections = async () => {
  await Promise.all([
    Role.deleteMany({}),
    User.deleteMany({}),
    WasteCategory.deleteMany({}),
    WasteListing.deleteMany({}),
    PickupRequest.deleteMany({}),
    CollectionPoint.deleteMany({}),
    Factory.deleteMany({}),
    Transaction.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
    BlogPost.deleteMany({}),
    ContactMessage.deleteMany({}),
    SiteSetting.deleteMany({}),
    AuditLog.deleteMany({})
  ]);
};

const seed = async () => {
  await connectDatabase();
  await clearCollections();

  const roles = await Role.insertMany([
    { key: ROLES.SUPER_ADMIN, label: "Super admin", description: "Tizim bo'yicha to'liq nazorat", permissions: ['all'] },
    { key: ROLES.ADMIN, label: 'Admin', description: 'Operatsion boshqaruv', permissions: ['manage_users', 'manage_pickups', 'manage_content'] },
    { key: ROLES.USER, label: 'Sotuvchi', description: 'Chiqindi topshiruvchi foydalanuvchi', permissions: ['create_listing', 'track_pickups'] },
    { key: ROLES.COLLECTOR, label: 'Haydovchi', description: 'Pickup bajaruvchi xodim', permissions: ['update_pickup_status'] },
    { key: ROLES.POINT_MANAGER, label: 'Punkt menejeri', description: 'Qabul punktini boshqaradi', permissions: ['manage_inventory', 'transfer_stock'] },
    { key: ROLES.FACTORY_MANAGER, label: 'Zavod menejeri', description: 'Xarid va qayta ishlash nazorati', permissions: ['manage_purchase_prices', 'accept_supply'] }
  ]);

  const [superAdmin, admin, seller, collector, pointManager, factoryManager] = await User.create([
    { name: 'Ahror Superadmin', email: 'superadmin@chiqindibor.uz', password: PASSWORD, role: ROLES.SUPER_ADMIN, phone: '+998900000001', region: 'Toshkent', address: 'Yunusobod' },
    { name: "Malika Admin", email: "admin@chiqindibor.uz", password: PASSWORD, role: ROLES.ADMIN, phone: "+998900000002", region: "Toshkent", address: "Mirzo Ulug'bek" },
    { name: 'Jasur Sotuvchi', email: 'seller@chiqindibor.uz', password: PASSWORD, role: ROLES.USER, phone: '+998900000003', region: 'Toshkent', address: 'Chilonzor', companyName: 'Jasur Plast' },
    { name: 'Sardor Haydovchi', email: 'collector@chiqindibor.uz', password: PASSWORD, role: ROLES.COLLECTOR, phone: '+998900000004', region: 'Toshkent', address: 'Sergeli' },
    { name: 'Nigora Punkt', email: 'point@chiqindibor.uz', password: PASSWORD, role: ROLES.POINT_MANAGER, phone: '+998900000005', region: 'Toshkent', address: 'Olmazor' },
    { name: 'Kamol Zavod', email: 'factory@chiqindibor.uz', password: PASSWORD, role: ROLES.FACTORY_MANAGER, phone: '+998900000006', region: 'Toshkent', address: 'Bektemir' }
  ]);

  const categories = await WasteCategory.insertMany([
    { name: "PET butilkalar", slug: "pet-bottles", pricePerKg: 4200, description: "Ichimlik butilkalari va shunga o'xshash PET mahsulotlari", icon: "ri-flask-line", sortOrder: 1 },
    { name: 'Plastik konteynerlar', slug: 'plastic-containers', pricePerKg: 3800, description: 'Oziq-ovqat va maishiy konteynerlar', icon: 'ri-inbox-2-line', sortOrder: 2 },
    { name: 'Polietilen', slug: 'polyethylene', pricePerKg: 3400, description: 'Qattiq va yumshoq polietilen mahsulotlari', icon: 'ri-drop-line', sortOrder: 3 },
    { name: 'Polipropilen', slug: 'polypropylene', pricePerKg: 3600, description: 'Sanoat va maishiy PP plastmassa', icon: 'ri-box-3-line', sortOrder: 4 },
    { name: 'Plastik paketlar', slug: 'plastic-bags', pricePerKg: 2200, description: 'Yumshoq paketlar va streych plyonka', icon: 'ri-shopping-bag-3-line', sortOrder: 5 },
    { name: 'Aralash plastik', slug: 'mixed-plastic', pricePerKg: 1800, description: 'Saralanmagan yoki aralash plastmassa', icon: 'ri-stack-line', sortOrder: 6 }
  ]);

  const collectionPoint = await CollectionPoint.create({
    name: 'Chilonzor Ekopunkt',
    slug: 'chilonzor-ekopunkt',
    manager: pointManager._id,
    address: 'Toshkent sh., Chilonzor 12-kvartal',
    region: 'Toshkent',
    phone: '+998 90 111 11 11',
    email: 'punkt@chiqindibor.uz',
    capacityKg: 15000,
    storedKg: 4200,
    acceptedCategories: categories.map((item) => item._id),
    description: 'Aholidan chiqindi qabul qiluvchi pilot punkt.',
    features: ['Avtomatik tarozi', 'QR qabul', 'Express topshiruv'],
    location: { type: 'Point', coordinates: [69.2039, 41.2754] }
  });

  const factory = await Factory.create({
    name: 'Eco Polymer Recycling',
    slug: 'eco-polymer-recycling',
    manager: factoryManager._id,
    address: 'Toshkent vil., Bektemir sanoat zonasi',
    region: 'Toshkent',
    phone: '+998 90 222 22 22',
    email: 'factory@chiqindibor.uz',
    website: 'https://chiqindibor.uz',
    acceptedCategories: categories.map((item) => item._id),
    purchasePrices: categories.map((item) => ({ category: item._id, pricePerKg: item.pricePerKg + 400 })),
    dailyCapacityKg: 32000,
    processedKg: 11750,
    description: "Plastik chiqindini granula va qayta ishlangan xomashyo ko'rinishiga keltiradi.",
    location: { type: 'Point', coordinates: [69.3406, 41.2466] }
  });

  const listings = await WasteListing.insertMany([
    {
      user: seller._id,
      category: categories[0]._id,
      title: 'Tozalangan PET butilkalar',
      description: 'Saralangan, quruq va presslangan butilkalar',
      images: ['/images/category-placeholder.svg'],
      estimatedWeight: 185,
      address: 'Chilonzor, 20-kvartal',
      region: 'Toshkent',
      requestedPickup: true,
      offeredRate: categories[0].pricePerKg,
      location: { type: 'Point', coordinates: [69.201, 41.274] }
    },
    {
      user: seller._id,
      category: categories[4]._id,
      title: 'Plastik paketlar aralashmasi',
      description: "Mahalla yig'imidan kelgan yumshoq paketlar",
      images: ['/images/category-placeholder.svg'],
      estimatedWeight: 92,
      address: 'Chilonzor, 16-kvartal',
      region: 'Toshkent',
      requestedPickup: true,
      offeredRate: categories[4].pricePerKg,
      location: { type: 'Point', coordinates: [69.214, 41.269] }
    },
    {
      user: seller._id,
      category: categories[1]._id,
      title: 'Plastik konteynerlar partiyasi',
      description: 'Tozalangan va yuvilgan konteynerlar',
      images: ['/images/category-placeholder.svg'],
      estimatedWeight: 140,
      address: 'Olmazor, Qoraqamish',
      region: 'Toshkent',
      requestedPickup: false,
      offeredRate: categories[1].pricePerKg,
      status: 'approved',
      location: { type: 'Point', coordinates: [69.173, 41.335] }
    }
  ]);

  const pickups = await PickupRequest.insertMany([
    {
      user: seller._id,
      listing: listings[0]._id,
      category: categories[0]._id,
      assignedCollector: collector._id,
      collectionPoint: collectionPoint._id,
      factory: factory._id,
      status: 'completed',
      estimatedWeight: 185,
      actualWeight: 179,
      address: listings[0].address,
      region: 'Toshkent',
      offeredRate: categories[0].pricePerKg,
      estimatedAmount: 777000,
      finalAmount: 751800,
      paymentStatus: 'paid',
      images: listings[0].images,
      location: listings[0].location,
      timeline: [
        { status: 'pending', note: 'Foydalanuvchi yaratdi', changedBy: seller._id },
        { status: 'approved', note: 'Admin tasdiqladi', changedBy: admin._id },
        { status: 'assigned', note: 'Haydovchi biriktirildi', changedBy: admin._id },
        { status: 'completed', note: 'Zavodga topshirilib yopildi', changedBy: factoryManager._id }
      ]
    },
    {
      user: seller._id,
      listing: listings[1]._id,
      category: categories[4]._id,
      assignedCollector: collector._id,
      collectionPoint: collectionPoint._id,
      status: 'on_the_way',
      estimatedWeight: 92,
      actualWeight: 0,
      address: listings[1].address,
      region: 'Toshkent',
      preferredDate: new Date(),
      offeredRate: categories[4].pricePerKg,
      estimatedAmount: 202400,
      finalAmount: 0,
      paymentStatus: 'pending',
      images: listings[1].images,
      location: listings[1].location,
      timeline: [
        { status: 'pending', note: 'Foydalanuvchi yaratdi', changedBy: seller._id },
        { status: 'approved', note: 'Admin tasdiqladi', changedBy: admin._id },
        { status: 'assigned', note: 'Haydovchi biriktirildi', changedBy: admin._id },
        { status: "on_the_way", note: "Haydovchi yo'lga chiqdi", changedBy: collector._id }
      ]
    },
    {
      user: seller._id,
      listing: listings[2]._id,
      category: categories[1]._id,
      collectionPoint: collectionPoint._id,
      status: 'delivered_to_point',
      estimatedWeight: 140,
      actualWeight: 136,
      address: listings[2].address,
      region: 'Toshkent',
      offeredRate: categories[1].pricePerKg,
      estimatedAmount: 532000,
      finalAmount: 516800,
      paymentStatus: 'approved',
      images: listings[2].images,
      location: listings[2].location,
      timeline: [
        { status: 'pending', note: 'Foydalanuvchi yaratdi', changedBy: seller._id },
        { status: 'delivered_to_point', note: 'Punktga qabul qilindi', changedBy: pointManager._id }
      ]
    }
  ]);

  const transaction = await Transaction.create({
    type: 'user_sale',
    sourceUser: seller._id,
    sourcePoint: collectionPoint._id,
    destinationFactory: factory._id,
    pickupRequest: pickups[0]._id,
    listing: listings[0]._id,
    amount: pickups[0].finalAmount,
    weight: pickups[0].actualWeight,
    status: 'completed',
    transactionId: 'TRX-DEMO-001',
    notes: 'Demo seed tranzaksiyasi',
    createdBy: admin._id
  });

  await Payment.create({
    user: seller._id,
    pickupRequest: pickups[0]._id,
    transaction: transaction._id,
    estimatedAmount: pickups[0].estimatedAmount,
    finalAmount: pickups[0].finalAmount,
    paymentStatus: 'paid',
    paymentMethod: 'manual_transfer',
    transactionId: transaction.transactionId,
    payoutDate: new Date()
  });

  await Notification.insertMany([
    { user: seller._id, title: 'Pickup yakunlandi', message: 'PET butilkalar partiyasi muvaffaqiyatli yakunlandi.', type: 'success', link: '/user/pickups' },
    { user: seller._id, title: "To'lov tasdiqlandi", message: "Yakuniy payout tasdiqlandi va hisob-kitob tayyor.", type: "info", link: "/user/payments" },
    { role: ROLES.ADMIN, title: 'Yangi topshiruvlar mavjud', message: 'Yangi plastik chiqindi topshiruvlari tekshiruv kutmoqda.', type: 'announcement', link: '/admin/pickups' },
    { role: ROLES.COLLECTOR, title: "Bugungi marshrut yangilandi", message: "Navbatga yangi pickup manzillari qo'shildi.", type: "announcement", link: "/collector/queue" }
  ]);

  await BlogPost.insertMany([
    {
      title: 'Plastik chiqindini pulga aylantirishning 5 usuli',
      slug: 'plastik-chiqindini-pulga-aylantirishning-5-usuli',
      excerpt: "Aholi va kichik biznes uchun daromadga aylantirishning eng samarali yo'llari.",
      content: `<p>Plastik chiqindilarni saralash, yuvish va vaqtida topshirish orqali sezilarli daromad olish mumkin.</p><p>ChiqindiBor esa bu jarayonni pickup, xarita, narx va payout ko'rinishida birlashtiradi.</p>`,
      author: admin._id,
      categories: ['Ekologiya', 'Daromad'],
      tags: ['plastik', 'daromad', 'pickup'],
      seoTitle: 'Plastik chiqindini pulga aylantirish',
      seoDescription: 'Plastik chiqindi orqali daromad olishning amaliy usullari.',
      publishedAt: new Date(),
      featured: true
    },
    {
      title: "Qabul punktlari bilan ishlashda nimalarga e'tibor berish kerak?",
      slug: "qabul-punktlari-bilan-ishlashda-nimalarga-etibor-berish-kerak",
      excerpt: "Punktlar sig'imi, qabul vaqti va toifalar bo'yicha checklist.",
      content: `<p>Punkt tanlashda ish vaqti, qabul qilinadigan kategoriya va sig'im ko'rsatkichlarini tekshirish muhim.</p>`,
      author: admin._id,
      categories: ['Punktlar'],
      tags: ['punkt', 'xarita'],
      publishedAt: new Date()
    }
  ]);

  await ContactMessage.create({
    name: 'Eco Trade Group',
    email: 'partnership@example.com',
    phone: '+998 90 333 33 33',
    company: 'Eco Trade Group',
    subject: 'Hamkorlik taklifi',
    message: "Qabul punktlari tarmog'ini kengaytirish bo'yicha hamkorlikni muhokama qilmoqchimiz.",
    status: 'new'
  });

  await SiteSetting.create({
    siteName: 'ChiqindiBor',
    tagline: 'Plastik chiqindini iqtisodiy resursga aylantiring',
    description: "ChiqindiBor plastik chiqindini yig'ish, pickup qilish, punktlar orqali agregatsiya qilish va zavodga yetkazish uchun premium ekologik xizmat.",
    supportEmail: 'support@chiqindibor.uz',
    supportPhone: '+998 90 000 00 00',
    address: 'Toshkent shahri, Chilonzor tumani',
    heroTitle: 'Plastik chiqindini daromadga aylantiring',
    heroSubtitle: 'Fuqarolar, haydovchilar, punktlar va zavodlarni bitta shaffof ekotizimga ulaymiz.',
    commissionRate: 8,
    wastePricingMode: 'dynamic',
    socialLinks: {
      telegram: 'https://t.me/chiqindibor',
      instagram: 'https://instagram.com/chiqindibor',
      linkedin: 'https://linkedin.com/company/chiqindibor'
    },
    faqItems: [
      { question: "Pickup xizmati qayerlarda ishlaydi?", answer: "Toshkent va pilot hududlarda manzil bo'yicha pickup xizmati mavjud." },
      { question: "To'lov qachon amalga oshiriladi?", answer: "Haqiqiy vazn tasdiqlangach, payout yozuvi yaratiladi va admin tomonidan tasdiqlanadi." },
      { question: 'Qaysi plastik turlari qabul qilinadi?', answer: 'PET, konteynerlar, polietilen, polipropilen, paketlar va aralash plastik qabul qilinadi.' }
    ],
    seoDefaults: {
      title: 'ChiqindiBor',
      description: "Plastik chiqindilarni yig'ish va daromadga aylantirish uchun premium raqamli platforma."
    }
  });

  await AuditLog.insertMany([
    { actor: superAdmin._id, actorName: superAdmin.name, action: 'system_seeded', entityType: 'System', description: "Demo ma'lumotlar yaratildi." },
    { actor: admin._id, actorName: admin.name, action: 'pickup_approved', entityType: 'PickupRequest', entityId: String(pickups[1]._id), description: 'Demo pickup admin tomonidan tasdiqlandi.' },
    { actor: factoryManager._id, actorName: factoryManager.name, action: 'factory_purchase', entityType: 'Transaction', entityId: String(transaction._id), description: 'Zavod demo xaridni yopdi.' }
  ]);

  console.log('Seed completed successfully');
  console.log('Demo password:', PASSWORD);
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});


