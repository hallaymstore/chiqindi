const bcrypt = require('bcryptjs');

const DEFAULT_PASSWORD = 'Demo123!';

const createTimestamp = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const ids = {
  roles: {
    superAdmin: '000000000000000000000001',
    admin: '000000000000000000000002',
    user: '000000000000000000000003',
    collector: '000000000000000000000004',
    pointManager: '000000000000000000000005',
    factoryManager: '000000000000000000000006'
  },
  users: {
    superAdmin: '000000000000000000000101',
    admin: '000000000000000000000102',
    seller: '000000000000000000000103',
    collector: '000000000000000000000104',
    pointManager: '000000000000000000000105',
    factoryManager: '000000000000000000000106'
  },
  categories: {
    pet: '000000000000000000000201',
    containers: '000000000000000000000202',
    polyethylene: '000000000000000000000203',
    polypropylene: '000000000000000000000204',
    bags: '000000000000000000000205',
    mixed: '000000000000000000000206'
  },
  collectionPoint: '000000000000000000000301',
  factory: '000000000000000000000401',
  listings: {
    first: '000000000000000000000501',
    second: '000000000000000000000502',
    third: '000000000000000000000503'
  },
  pickups: {
    first: '000000000000000000000601',
    second: '000000000000000000000602',
    third: '000000000000000000000603'
  },
  transaction: '000000000000000000000701',
  payment: '000000000000000000000801',
  notifications: {
    first: '000000000000000000000901',
    second: '000000000000000000000902',
    third: '000000000000000000000903',
    fourth: '000000000000000000000904'
  },
  blogPosts: {
    first: '000000000000000000000a01',
    second: '000000000000000000000a02'
  },
  contact: '000000000000000000000b01',
  siteSetting: '000000000000000000000c01',
  auditLogs: {
    first: '000000000000000000000d01',
    second: '000000000000000000000d02',
    third: '000000000000000000000d03'
  }
};

const createDefaultData = () => {
  const hashedPassword = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

  const roles = [
    {
      _id: ids.roles.superAdmin,
      key: 'super_admin',
      label: 'Super admin',
      description: 'Tizim bo‘yicha to‘liq boshqaruv',
      permissions: ['all'],
      accentColor: '#20d39b',
      createdAt: createTimestamp(40),
      updatedAt: createTimestamp(40)
    },
    {
      _id: ids.roles.admin,
      key: 'admin',
      label: 'Admin',
      description: 'Operatsion boshqaruv va kontent nazorati',
      permissions: ['manage_users', 'manage_pickups', 'manage_content'],
      accentColor: '#13b9d2',
      createdAt: createTimestamp(40),
      updatedAt: createTimestamp(40)
    },
    {
      _id: ids.roles.user,
      key: 'user',
      label: 'Sotuvchi',
      description: 'Chiqindi topshiruvchi foydalanuvchi',
      permissions: ['create_listing', 'track_pickups'],
      accentColor: '#7bd88c',
      createdAt: createTimestamp(40),
      updatedAt: createTimestamp(40)
    },
    {
      _id: ids.roles.collector,
      key: 'collector',
      label: 'Haydovchi',
      description: 'Pickup va yetkazib berish oqimi',
      permissions: ['update_pickup_status'],
      accentColor: '#ffd166',
      createdAt: createTimestamp(40),
      updatedAt: createTimestamp(40)
    },
    {
      _id: ids.roles.pointManager,
      key: 'point_manager',
      label: 'Punkt menejeri',
      description: 'Punkt inventari va transfer boshqaruvi',
      permissions: ['manage_inventory', 'transfer_stock'],
      accentColor: '#59f3c8',
      createdAt: createTimestamp(40),
      updatedAt: createTimestamp(40)
    },
    {
      _id: ids.roles.factoryManager,
      key: 'factory_manager',
      label: 'Zavod menejeri',
      description: 'Xarid va qayta ishlash nazorati',
      permissions: ['manage_purchase_prices', 'accept_supply'],
      accentColor: '#6ea8fe',
      createdAt: createTimestamp(40),
      updatedAt: createTimestamp(40)
    }
  ];

  const users = [
    {
      _id: ids.users.superAdmin,
      name: 'Ahror Superadmin',
      email: 'superadmin@chiqindibor.uz',
      phone: '+998900000001',
      password: hashedPassword,
      role: 'super_admin',
      avatar: '/images/avatar-placeholder.svg',
      region: 'Toshkent',
      address: 'Yunusobod tumani',
      location: { type: 'Point', coordinates: [69.2886, 41.3385] },
      favoriteCollectionPoints: [],
      isActive: true,
      stats: { totalKg: 0, totalEarnings: 0, completedPickups: 0, rating: 5 },
      createdAt: createTimestamp(30),
      updatedAt: createTimestamp(2)
    },
    {
      _id: ids.users.admin,
      name: 'Malika Admin',
      email: 'admin@chiqindibor.uz',
      phone: '+998900000002',
      password: hashedPassword,
      role: 'admin',
      avatar: '/images/avatar-placeholder.svg',
      region: 'Toshkent',
      address: 'Mirzo Ulug‘bek tumani',
      location: { type: 'Point', coordinates: [69.3163, 41.3206] },
      favoriteCollectionPoints: [],
      isActive: true,
      stats: { totalKg: 0, totalEarnings: 0, completedPickups: 0, rating: 5 },
      createdAt: createTimestamp(30),
      updatedAt: createTimestamp(2)
    },
    {
      _id: ids.users.seller,
      name: 'Jasur Sotuvchi',
      email: 'seller@chiqindibor.uz',
      phone: '+998900000003',
      password: hashedPassword,
      role: 'user',
      avatar: '/images/avatar-placeholder.svg',
      companyName: 'Jasur Plast',
      region: 'Toshkent',
      address: 'Chilonzor 20-kvartal',
      location: { type: 'Point', coordinates: [69.201, 41.274] },
      favoriteCollectionPoints: [ids.collectionPoint],
      isActive: true,
      stats: { totalKg: 179, totalEarnings: 751800, completedPickups: 1, rating: 4.8 },
      createdAt: createTimestamp(25),
      updatedAt: createTimestamp(1)
    },
    {
      _id: ids.users.collector,
      name: 'Sardor Haydovchi',
      email: 'collector@chiqindibor.uz',
      phone: '+998900000004',
      password: hashedPassword,
      role: 'collector',
      avatar: '/images/avatar-placeholder.svg',
      region: 'Toshkent',
      address: 'Sergeli tumani',
      location: { type: 'Point', coordinates: [69.2302, 41.2292] },
      favoriteCollectionPoints: [],
      isActive: true,
      stats: { totalKg: 271, totalEarnings: 0, completedPickups: 3, rating: 4.9 },
      createdAt: createTimestamp(24),
      updatedAt: createTimestamp(1)
    },
    {
      _id: ids.users.pointManager,
      name: 'Nigora Punkt',
      email: 'point@chiqindibor.uz',
      phone: '+998900000005',
      password: hashedPassword,
      role: 'point_manager',
      avatar: '/images/avatar-placeholder.svg',
      region: 'Toshkent',
      address: 'Olmazor tumani',
      location: { type: 'Point', coordinates: [69.173, 41.335] },
      favoriteCollectionPoints: [],
      isActive: true,
      stats: { totalKg: 0, totalEarnings: 0, completedPickups: 0, rating: 4.7 },
      createdAt: createTimestamp(24),
      updatedAt: createTimestamp(1)
    },
    {
      _id: ids.users.factoryManager,
      name: 'Kamol Zavod',
      email: 'factory@chiqindibor.uz',
      phone: '+998900000006',
      password: hashedPassword,
      role: 'factory_manager',
      avatar: '/images/avatar-placeholder.svg',
      region: 'Toshkent',
      address: 'Bektemir sanoat zonasi',
      location: { type: 'Point', coordinates: [69.3406, 41.2466] },
      favoriteCollectionPoints: [],
      isActive: true,
      stats: { totalKg: 0, totalEarnings: 0, completedPickups: 0, rating: 4.8 },
      createdAt: createTimestamp(24),
      updatedAt: createTimestamp(1)
    }
  ];

  const wasteCategories = [
    {
      _id: ids.categories.pet,
      name: 'PET butilkalar',
      slug: 'pet-bottles',
      pricePerKg: 4200,
      description: 'Ichimlik butilkalari va shunga o‘xshash PET mahsulotlari',
      image: '/images/category-placeholder.svg',
      icon: 'ri-flask-line',
      isActive: true,
      sortOrder: 1,
      palette: 'from-emerald',
      createdAt: createTimestamp(30),
      updatedAt: createTimestamp(3)
    },
    {
      _id: ids.categories.containers,
      name: 'Plastik konteynerlar',
      slug: 'plastic-containers',
      pricePerKg: 3800,
      description: 'Oziq-ovqat va maishiy konteynerlar',
      image: '/images/category-placeholder.svg',
      icon: 'ri-inbox-2-line',
      isActive: true,
      sortOrder: 2,
      palette: 'from-cyan',
      createdAt: createTimestamp(30),
      updatedAt: createTimestamp(3)
    },
    {
      _id: ids.categories.polyethylene,
      name: 'Polietilen',
      slug: 'polyethylene',
      pricePerKg: 3400,
      description: 'Qattiq va yumshoq polietilen mahsulotlari',
      image: '/images/category-placeholder.svg',
      icon: 'ri-drop-line',
      isActive: true,
      sortOrder: 3,
      palette: 'from-emerald',
      createdAt: createTimestamp(30),
      updatedAt: createTimestamp(3)
    },
    {
      _id: ids.categories.polypropylene,
      name: 'Polipropilen',
      slug: 'polypropylene',
      pricePerKg: 3600,
      description: 'Sanoat va maishiy PP plastmassa',
      image: '/images/category-placeholder.svg',
      icon: 'ri-box-3-line',
      isActive: true,
      sortOrder: 4,
      palette: 'from-cyan',
      createdAt: createTimestamp(30),
      updatedAt: createTimestamp(3)
    },
    {
      _id: ids.categories.bags,
      name: 'Plastik paketlar',
      slug: 'plastic-bags',
      pricePerKg: 2200,
      description: 'Yumshoq paketlar va streych plyonka',
      image: '/images/category-placeholder.svg',
      icon: 'ri-shopping-bag-3-line',
      isActive: true,
      sortOrder: 5,
      palette: 'from-emerald',
      createdAt: createTimestamp(30),
      updatedAt: createTimestamp(3)
    },
    {
      _id: ids.categories.mixed,
      name: 'Aralash plastik',
      slug: 'mixed-plastic',
      pricePerKg: 1800,
      description: 'Saralanmagan yoki aralash plastmassa',
      image: '/images/category-placeholder.svg',
      icon: 'ri-stack-line',
      isActive: true,
      sortOrder: 6,
      palette: 'from-cyan',
      createdAt: createTimestamp(30),
      updatedAt: createTimestamp(3)
    }
  ];

  const collectionPoints = [
    {
      _id: ids.collectionPoint,
      name: 'Chilonzor Ekopunkt',
      slug: 'chilonzor-ekopunkt',
      manager: ids.users.pointManager,
      address: 'Toshkent sh., Chilonzor 12-kvartal',
      region: 'Toshkent',
      phone: '+998 90 111 11 11',
      email: 'punkt@chiqindibor.uz',
      location: { type: 'Point', coordinates: [69.2039, 41.2754] },
      capacityKg: 15000,
      storedKg: 4200,
      acceptedCategories: Object.values(ids.categories),
      hours: '08:00 - 20:00',
      description: 'Aholidan chiqindi qabul qiluvchi pilot punkt.',
      features: ['Avtomatik tarozi', 'QR qabul', 'Express topshiruv'],
      status: 'active',
      createdAt: createTimestamp(20),
      updatedAt: createTimestamp(1)
    }
  ];

  const factories = [
    {
      _id: ids.factory,
      name: 'Eco Polymer Recycling',
      slug: 'eco-polymer-recycling',
      manager: ids.users.factoryManager,
      address: 'Toshkent vil., Bektemir sanoat zonasi',
      region: 'Toshkent',
      phone: '+998 90 222 22 22',
      email: 'factory@chiqindibor.uz',
      website: 'https://chiqindibor.uz',
      location: { type: 'Point', coordinates: [69.3406, 41.2466] },
      purchasePrices: Object.values(ids.categories).map((categoryId, index) => ({
        category: categoryId,
        pricePerKg: wasteCategories[index].pricePerKg + 400
      })),
      acceptedCategories: Object.values(ids.categories),
      dailyCapacityKg: 32000,
      processedKg: 11750,
      description: 'Plastik chiqindini granula va qayta ishlangan xomashyo ko‘rinishiga keltiradi.',
      status: 'active',
      createdAt: createTimestamp(20),
      updatedAt: createTimestamp(1)
    }
  ];

  const wasteListings = [
    {
      _id: ids.listings.first,
      user: ids.users.seller,
      category: ids.categories.pet,
      title: 'Tozalangan PET butilkalar',
      description: 'Saralangan, quruq va presslangan butilkalar',
      images: ['/images/category-placeholder.svg'],
      estimatedWeight: 185,
      address: 'Chilonzor, 20-kvartal',
      region: 'Toshkent',
      location: { type: 'Point', coordinates: [69.201, 41.274] },
      preferredPickupAt: createTimestamp(-1),
      notes: 'Kiraverishda tayyorlangan.',
      requestedPickup: true,
      offeredRate: 4200,
      status: 'completed',
      createdAt: createTimestamp(7),
      updatedAt: createTimestamp(1)
    },
    {
      _id: ids.listings.second,
      user: ids.users.seller,
      category: ids.categories.bags,
      title: 'Plastik paketlar aralashmasi',
      description: 'Mahalla yig‘imidan kelgan yumshoq paketlar',
      images: ['/images/category-placeholder.svg'],
      estimatedWeight: 92,
      address: 'Chilonzor, 16-kvartal',
      region: 'Toshkent',
      location: { type: 'Point', coordinates: [69.214, 41.269] },
      preferredPickupAt: createTimestamp(-1),
      notes: 'Paketlar ajratilgan.',
      requestedPickup: true,
      offeredRate: 2200,
      status: 'submitted',
      createdAt: createTimestamp(3),
      updatedAt: createTimestamp(1)
    },
    {
      _id: ids.listings.third,
      user: ids.users.seller,
      category: ids.categories.containers,
      title: 'Plastik konteynerlar partiyasi',
      description: 'Tozalangan va yuvilgan konteynerlar',
      images: ['/images/category-placeholder.svg'],
      estimatedWeight: 140,
      address: 'Olmazor, Qoraqamish',
      region: 'Toshkent',
      location: { type: 'Point', coordinates: [69.173, 41.335] },
      preferredPickupAt: createTimestamp(-2),
      notes: 'Punktga topshirish rejalashtirilgan.',
      requestedPickup: false,
      offeredRate: 3800,
      status: 'approved',
      createdAt: createTimestamp(5),
      updatedAt: createTimestamp(2)
    }
  ];

  const pickupRequests = [
    {
      _id: ids.pickups.first,
      user: ids.users.seller,
      listing: ids.listings.first,
      category: ids.categories.pet,
      assignedCollector: ids.users.collector,
      collectionPoint: ids.collectionPoint,
      factory: ids.factory,
      status: 'completed',
      estimatedWeight: 185,
      actualWeight: 179,
      address: 'Chilonzor, 20-kvartal',
      region: 'Toshkent',
      location: { type: 'Point', coordinates: [69.201, 41.274] },
      preferredDate: createTimestamp(-6),
      notes: 'Yakunlandi.',
      images: ['/images/category-placeholder.svg'],
      proofPhotos: [],
      offeredRate: 4200,
      estimatedAmount: 777000,
      finalAmount: 751800,
      paymentStatus: 'paid',
      timeline: [
        { status: 'pending', note: 'So‘rov foydalanuvchi tomonidan yaratildi.', changedBy: ids.users.seller, changedAt: createTimestamp(7) },
        { status: 'approved', note: 'Admin tomonidan tasdiqlandi.', changedBy: ids.users.admin, changedAt: createTimestamp(6) },
        { status: 'assigned', note: 'Haydovchi biriktirildi.', changedBy: ids.users.admin, changedAt: createTimestamp(6) },
        { status: 'completed', note: 'Zavodga topshirilib yopildi.', changedBy: ids.users.factoryManager, changedAt: createTimestamp(1) }
      ],
      createdAt: createTimestamp(7),
      updatedAt: createTimestamp(1)
    },
    {
      _id: ids.pickups.second,
      user: ids.users.seller,
      listing: ids.listings.second,
      category: ids.categories.bags,
      assignedCollector: ids.users.collector,
      collectionPoint: ids.collectionPoint,
      factory: null,
      status: 'on_the_way',
      estimatedWeight: 92,
      actualWeight: 0,
      address: 'Chilonzor, 16-kvartal',
      region: 'Toshkent',
      location: { type: 'Point', coordinates: [69.214, 41.269] },
      preferredDate: createTimestamp(-1),
      notes: 'Haydovchi yo‘lda.',
      images: ['/images/category-placeholder.svg'],
      proofPhotos: [],
      offeredRate: 2200,
      estimatedAmount: 202400,
      finalAmount: 0,
      paymentStatus: 'pending',
      timeline: [
        { status: 'pending', note: 'So‘rov foydalanuvchi tomonidan yaratildi.', changedBy: ids.users.seller, changedAt: createTimestamp(3) },
        { status: 'approved', note: 'Admin tasdiqladi.', changedBy: ids.users.admin, changedAt: createTimestamp(2) },
        { status: 'assigned', note: 'Haydovchi biriktirildi.', changedBy: ids.users.admin, changedAt: createTimestamp(2) },
        { status: 'on_the_way', note: 'Haydovchi yo‘lga chiqdi.', changedBy: ids.users.collector, changedAt: createTimestamp(1) }
      ],
      createdAt: createTimestamp(3),
      updatedAt: createTimestamp(1)
    },
    {
      _id: ids.pickups.third,
      user: ids.users.seller,
      listing: ids.listings.third,
      category: ids.categories.containers,
      assignedCollector: null,
      collectionPoint: ids.collectionPoint,
      factory: null,
      status: 'delivered_to_point',
      estimatedWeight: 140,
      actualWeight: 136,
      address: 'Olmazor, Qoraqamish',
      region: 'Toshkent',
      location: { type: 'Point', coordinates: [69.173, 41.335] },
      preferredDate: createTimestamp(-3),
      notes: 'Punktga topshirilgan.',
      images: ['/images/category-placeholder.svg'],
      proofPhotos: [],
      offeredRate: 3800,
      estimatedAmount: 532000,
      finalAmount: 516800,
      paymentStatus: 'approved',
      timeline: [
        { status: 'pending', note: 'So‘rov foydalanuvchi tomonidan yaratildi.', changedBy: ids.users.seller, changedAt: createTimestamp(5) },
        { status: 'delivered_to_point', note: 'Punkt tomonidan qabul qilindi.', changedBy: ids.users.pointManager, changedAt: createTimestamp(2) }
      ],
      createdAt: createTimestamp(5),
      updatedAt: createTimestamp(2)
    }
  ];

  const transactions = [
    {
      _id: ids.transaction,
      type: 'user_sale',
      sourceUser: ids.users.seller,
      sourcePoint: ids.collectionPoint,
      destinationFactory: ids.factory,
      pickupRequest: ids.pickups.first,
      listing: ids.listings.first,
      amount: 751800,
      weight: 179,
      status: 'completed',
      transactionId: 'TRX-DEMO-001',
      notes: 'JSON fallback demo tranzaksiyasi',
      createdBy: ids.users.admin,
      createdAt: createTimestamp(1),
      updatedAt: createTimestamp(1)
    }
  ];

  const payments = [
    {
      _id: ids.payment,
      user: ids.users.seller,
      pickupRequest: ids.pickups.first,
      transaction: ids.transaction,
      estimatedAmount: 777000,
      finalAmount: 751800,
      paymentStatus: 'paid',
      paymentMethod: 'manual_transfer',
      transactionId: 'TRX-DEMO-001',
      payoutDate: createTimestamp(1),
      notes: 'JSON fallback demo to‘lovi',
      createdAt: createTimestamp(1),
      updatedAt: createTimestamp(1)
    }
  ];

  const notifications = [
    {
      _id: ids.notifications.first,
      user: ids.users.seller,
      title: 'Pickup yakunlandi',
      message: 'PET butilkalar partiyasi muvaffaqiyatli yakunlandi.',
      type: 'success',
      link: '/user/pickups',
      isRead: false,
      metadata: {},
      createdAt: createTimestamp(1),
      updatedAt: createTimestamp(1)
    },
    {
      _id: ids.notifications.second,
      user: ids.users.seller,
      title: 'To‘lov tasdiqlandi',
      message: 'Yakuniy payout tasdiqlandi va hisob-kitob tayyor.',
      type: 'info',
      link: '/user/payments',
      isRead: false,
      metadata: {},
      createdAt: createTimestamp(1),
      updatedAt: createTimestamp(1)
    },
    {
      _id: ids.notifications.third,
      role: 'admin',
      title: 'Yangi topshiruvlar mavjud',
      message: 'Yangi plastik chiqindi topshiruvlari tekshiruv kutmoqda.',
      type: 'announcement',
      link: '/admin/pickups',
      isRead: false,
      metadata: {},
      createdAt: createTimestamp(1),
      updatedAt: createTimestamp(1)
    },
    {
      _id: ids.notifications.fourth,
      role: 'collector',
      title: 'Bugungi marshrut yangilandi',
      message: 'Navbatga yangi pickup manzillari qo‘shildi.',
      type: 'announcement',
      link: '/collector/queue',
      isRead: false,
      metadata: {},
      createdAt: createTimestamp(1),
      updatedAt: createTimestamp(1)
    }
  ];

  const blogPosts = [
    {
      _id: ids.blogPosts.first,
      title: 'Plastik chiqindini pulga aylantirishning 5 usuli',
      slug: 'plastik-chiqindini-pulga-aylantirishning-5-usuli',
      excerpt: 'Aholi va kichik biznes uchun daromadga aylantirishning amaliy yo‘llari.',
      content:
        '<p>Plastik chiqindilarni saralash, yuvish va vaqtida topshirish orqali sezilarli daromad olish mumkin.</p><p>ChiqindiBor esa bu jarayonni pickup, xarita, narx va payout oqimi bilan birlashtiradi.</p>',
      featuredImage: '/images/blog-placeholder.svg',
      status: 'published',
      author: ids.users.admin,
      categories: ['Ekologiya', 'Daromad'],
      tags: ['plastik', 'daromad', 'pickup'],
      seoTitle: 'Plastik chiqindini pulga aylantirish',
      seoDescription: 'Plastik chiqindi orqali daromad olishning amaliy usullari.',
      publishedAt: createTimestamp(4),
      views: 124,
      featured: true,
      createdAt: createTimestamp(4),
      updatedAt: createTimestamp(2)
    },
    {
      _id: ids.blogPosts.second,
      title: 'Qabul punktlari bilan ishlashda nimalarga e’tibor berish kerak?',
      slug: 'qabul-punktlari-bilan-ishlashda-nimalarga-etibor-berish-kerak',
      excerpt: 'Punktlar sig‘imi, qabul vaqti va toifalar bo‘yicha checklist.',
      content:
        '<p>Punkt tanlashda ish vaqti, qabul qilinadigan kategoriya va sig‘im ko‘rsatkichlarini tekshirish muhim.</p>',
      featuredImage: '/images/blog-placeholder.svg',
      status: 'published',
      author: ids.users.admin,
      categories: ['Punktlar'],
      tags: ['punkt', 'xarita'],
      seoTitle: 'Qabul punktlari bilan ishlash',
      seoDescription: 'Punkt tanlashda e’tibor beriladigan asosiy mezonlar.',
      publishedAt: createTimestamp(2),
      views: 87,
      featured: false,
      createdAt: createTimestamp(2),
      updatedAt: createTimestamp(1)
    }
  ];

  const contactMessages = [
    {
      _id: ids.contact,
      name: 'Eco Trade Group',
      email: 'partnership@example.com',
      phone: '+998903333333',
      company: 'Eco Trade Group',
      subject: 'Hamkorlik taklifi',
      message: 'Qabul punktlari tarmog‘ini kengaytirish bo‘yicha hamkorlikni muhokama qilmoqchimiz.',
      sourcePage: 'contact',
      status: 'new',
      createdAt: createTimestamp(1),
      updatedAt: createTimestamp(1)
    }
  ];

  const siteSettings = [
    {
      _id: ids.siteSetting,
      siteName: 'ChiqindiBor',
      tagline: 'Plastik chiqindini iqtisodiy resursga aylantiring',
      description:
        'ChiqindiBor plastik chiqindini yig‘ish, pickup qilish, punktlar orqali agregatsiya qilish va zavodga yetkazish uchun premium ekologik xizmat.',
      supportEmail: 'support@chiqindibor.uz',
      supportPhone: '+998 90 000 00 00',
      address: 'Toshkent shahri, Chilonzor tumani',
      heroTitle: 'Plastik chiqindini daromadga aylantiring',
      heroSubtitle: 'Fuqarolar, haydovchilar, punktlar va zavodlarni bitta shaffof ekotizimga ulaymiz.',
      commissionRate: 8,
      wastePricingMode: 'dynamic',
      faqItems: [
        {
          question: 'Pickup xizmati qayerlarda ishlaydi?',
          answer: 'Toshkent va pilot hududlarda manzil bo‘yicha pickup xizmati mavjud.'
        },
        {
          question: 'To‘lov qachon amalga oshiriladi?',
          answer: 'Haqiqiy vazn tasdiqlangach, payout yozuvi yaratiladi va admin tomonidan tasdiqlanadi.'
        },
        {
          question: 'Qaysi plastik turlari qabul qilinadi?',
          answer: 'PET, konteynerlar, polietilen, polipropilen, paketlar va aralash plastik qabul qilinadi.'
        }
      ],
      seoDefaults: {
        title: 'ChiqindiBor',
        description: 'Plastik chiqindilarni yig‘ish va daromadga aylantirish uchun premium raqamli platforma.'
      },
      socialLinks: {
        telegram: 'https://t.me/chiqindibor',
        instagram: 'https://instagram.com/chiqindibor',
        linkedin: 'https://linkedin.com/company/chiqindibor'
      },
      createdAt: createTimestamp(20),
      updatedAt: createTimestamp(1)
    }
  ];

  const auditLogs = [
    {
      _id: ids.auditLogs.first,
      actor: ids.users.superAdmin,
      actorName: 'Ahror Superadmin',
      action: 'system_seeded',
      entityType: 'System',
      description: 'JSON fallback demo ma’lumotlari yaratildi.',
      metadata: {},
      createdAt: createTimestamp(20),
      updatedAt: createTimestamp(20)
    },
    {
      _id: ids.auditLogs.second,
      actor: ids.users.admin,
      actorName: 'Malika Admin',
      action: 'pickup_approved',
      entityType: 'PickupRequest',
      entityId: ids.pickups.second,
      description: 'Demo pickup admin tomonidan tasdiqlandi.',
      metadata: {},
      createdAt: createTimestamp(2),
      updatedAt: createTimestamp(2)
    },
    {
      _id: ids.auditLogs.third,
      actor: ids.users.factoryManager,
      actorName: 'Kamol Zavod',
      action: 'factory_purchase',
      entityType: 'Transaction',
      entityId: ids.transaction,
      description: 'Zavod demo xaridni yopdi.',
      metadata: {},
      createdAt: createTimestamp(1),
      updatedAt: createTimestamp(1)
    }
  ];

  return {
    roles,
    users,
    wasteCategories,
    wasteListings,
    pickupRequests,
    collectionPoints,
    factories,
    transactions,
    payments,
    notifications,
    blogPosts,
    contactMessages,
    siteSettings,
    auditLogs
  };
};

module.exports = {
  DEFAULT_PASSWORD,
  ids,
  createDefaultData
};
