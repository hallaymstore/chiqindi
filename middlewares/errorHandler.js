const notFoundHandler = (req, res) => {
  res.status(404).render('public/errors/404', {
    layout: 'layouts/main',
    pageTitle: 'Sahifa topilmadi',
    pageDescription: 'So‘ralgan sahifa mavjud emas.'
  });
};

const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500).render('public/errors/500', {
    layout: 'layouts/main',
    pageTitle: 'Server xatosi',
    pageDescription: 'Kutilmagan xatolik yuz berdi.',
    error
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
