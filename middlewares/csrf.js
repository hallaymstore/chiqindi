const crypto = require('crypto');

const ensureCsrfToken = (req) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  return req.session.csrfToken;
};

const setCsrfToken = (req, res, next) => {
  res.locals.csrfToken = ensureCsrfToken(req);
  next();
};

const verifyCsrfToken = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const token = req.body?._csrf || req.headers['x-csrf-token'];
  if (!token || token !== req.session.csrfToken) {
    req.flash('danger', 'Xavfsizlik tokeni yaroqsiz. Sahifani yangilang va qayta urinib ko‘ring.');
    return res.redirect(req.get('referer') || '/');
  }

  return next();
};

module.exports = {
  setCsrfToken,
  verifyCsrfToken
};
