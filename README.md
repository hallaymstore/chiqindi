# ChiqindiBor

ChiqindiBor plastik chiqindilarni yig�ish, sotish, pickup qilish, qabul punktlari orqali agregatsiya qilish va zavodlarga yetkazish uchun yaratilgan premium eco-tech platforma. Loyiha server-rendered EJS sahifalar, role-based dashboardlar va MongoDB asosidagi biznes modellari bilan qurilgan.

## Asosiy imkoniyatlar

- Public marketing sayti: bosh sahifa, loyiha haqida, qanday ishlaydi, punktlar xaritasi, hamkor zavodlar, narxlar, blog, FAQ, aloqa
- Session-based autentifikatsiya va rol asosidagi kirish nazorati
- Seller dashboard: listing yaratish, pickup so?rovi, payout va favorit punktlar
- Collector dashboard: biriktirilgan pickup navbati, status yangilash, proof photo yuklash
- Point manager dashboard: inventar, qabul, zavodga transfer
- Factory dashboard: purchase price, incoming supply, supplier analytics
- Admin dashboard: foydalanuvchilar, pickup, to�lovlar, kategoriyalar, blog, FAQ, content va hisobotlar
- Super admin dashboard: adminlar, audit loglar, komissiya va permission boshqaruvi
- Chart.js analitikasi, Leaflet xaritalari, premium CSS UI, CSV export

## Stack

- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Frontend: EJS, modular partials
- Styling: Pure CSS, Bootstrap 5 CDN, AOS, Remix Icons, Chart.js, Leaflet, SweetAlert2
- Security: helmet, express-session, connect-mongo, express-validator, xss-clean, mongo-sanitize, rate limit

## O�rnatish

1. Dependencylarni o�rnating:
   ```bash
   npm install
   ```
2. `.env.example` fayldan nusxa olib `.env` yarating:
   ```bash
   cp .env.example .env
   ```
3. MongoDB ishga tushganini tekshiring va `MONGODB_URI` ni moslang.
4. Demo ma?lumotlarni yuklang:
   ```bash
   npm run seed
   ```
5. Development serverni ishga tushiring:
   ```bash
   npm run dev
   ```
6. Brauzerda oching: `http://localhost:5000`

## Environment o�zgaruvchilari

`.env.example` ichida:

- `PORT`
- `MONGODB_URI`
- `SESSION_SECRET`
- `BASE_URL`
- `NODE_ENV`

## Demo kirish ma?lumotlari

Barcha demo foydalanuvchilar uchun parol: `Demo123!`

- Super Admin: `superadmin@chiqindibor.uz`
- Admin: `admin@chiqindibor.uz`
- Seller: `seller@chiqindibor.uz`
- Collector: `collector@chiqindibor.uz`
- Point Manager: `point@chiqindibor.uz`
- Factory Manager: `factory@chiqindibor.uz`

## Seed mazmuni

`npm run seed` quyidagilarni yaratadi:

- 6 ta rol
- 6 ta demo foydalanuvchi
- 6 ta chiqindi kategoriyasi
- 1 ta demo punkt
- 1 ta demo zavod
- 3 ta sample listing va pickup
- to�lov, tranzaksiya va notification yozuvlari
- blog postlar, FAQ va site settings
- audit loglar va bitta contact message

## Papkalar tuzilmasi

```text
config/
controllers/
middlewares/
models/
routes/
services/
utils/
views/
  layouts/
  partials/
  public/
  auth/
  user/
  collector/
  point-manager/
  factory/
  admin/
  super-admin/
public/
  css/
  js/
  images/
  uploads/
seeds/
```

## Buyruqlar

- `npm run dev` � development server
- `npm start` � production server
- `npm run seed` � demo ma?lumotlarni yaratish

## Eslatma

- Fayl yuklamalar `public/uploads` ichiga saqlanadi.
- CSV export admin va super admin panellarida mavjud.
- AI aniqlash bo�limi backend-ready placeholder sifatida kiritilgan va keyinchalik model integratsiyasi uchun tayyor.

