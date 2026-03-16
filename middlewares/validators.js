const { body, validationResult } = require('express-validator');
const { PICKUP_STATUSES } = require('../utils/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  req.flash('danger', errors.array().map((item) => item.msg).join(' '));
  return res.redirect('back');
};

const registerValidator = [
  body('name').trim().isLength({ min: 3 }).withMessage('Ism kamida 3 ta belgidan iborat bo‘lsin.'),
  body('email').trim().isEmail().withMessage('To‘g‘ri email kiriting.'),
  body('password').isLength({ min: 6 }).withMessage('Parol kamida 6 ta belgidan iborat bo‘lsin.'),
  validate
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('To‘g‘ri email kiriting.'),
  body('password').notEmpty().withMessage('Parol kiritilishi shart.'),
  validate
];

const listingValidator = [
  body('title').trim().isLength({ min: 3 }).withMessage('Sarlavha kiritilishi shart.'),
  body('category').notEmpty().withMessage('Chiqindi turi tanlanishi kerak.'),
  body('estimatedWeight').isFloat({ min: 0.1 }).withMessage('Taxminiy vazn to‘g‘ri bo‘lishi kerak.'),
  body('address').trim().isLength({ min: 5 }).withMessage('Manzilni to‘liq kiriting.'),
  validate
];

const contactValidator = [
  body('name').trim().isLength({ min: 3 }).withMessage('Ism kiriting.'),
  body('email').trim().isEmail().withMessage('Email manzil noto‘g‘ri.'),
  body('message').trim().isLength({ min: 10 }).withMessage('Xabar kamida 10 ta belgidan iborat bo‘lsin.'),
  validate
];

const categoryValidator = [
  body('name').trim().isLength({ min: 2 }).withMessage('Nom kiritilishi shart.'),
  body('pricePerKg').isFloat({ min: 0 }).withMessage('Narx noto‘g‘ri kiritildi.'),
  validate
];

const blogPostValidator = [
  body('title').trim().isLength({ min: 5 }).withMessage('Maqola sarlavhasi yetarli emas.'),
  body('content').trim().isLength({ min: 50 }).withMessage('Maqola matni kamida 50 ta belgidan iborat bo‘lsin.'),
  validate
];

const pickupStatusValidator = [
  body('status').isIn(PICKUP_STATUSES).withMessage('Status noto‘g‘ri.'),
  validate
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  listingValidator,
  contactValidator,
  categoryValidator,
  blogPostValidator,
  pickupStatusValidator
};
