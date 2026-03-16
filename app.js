require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

require('./models');

const connectDatabase = require('./config/database');
const createSessionStore = require('./config/session');
const { getRuntime } = require('./config/runtime');

const { attachFlash } = require('./middlewares/flash');
const { attachCurrentUser } = require('./middlewares/auth');
const { attachLocals } = require('./middlewares/locals');
const { setCsrfToken, verifyCsrfToken } = require('./middlewares/csrf');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const collectorRoutes = require('./routes/collectorRoutes');
const pointManagerRoutes = require('./routes/pointManagerRoutes');
const factoryRoutes = require('./routes/factoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');

const app = express();
const PORT = Number(process.env.PORT || 5000);

const configureApp = async () => {
  if (app.locals.isConfigured) {
    return app;
  }

  const runtime = await connectDatabase();

  app.locals.runtime = runtime;
  app.locals.dataMode = runtime.mode;

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false
    })
  );
  app.use(morgan('dev'));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(mongoSanitize());
  app.use(xssClean());
  app.use(methodOverride('_method'));

  app.use(
    session({
      name: 'chiqindibor.sid',
      secret: process.env.SESSION_SECRET || 'development-secret',
      resave: false,
      saveUninitialized: false,
      store: createSessionStore(runtime),
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    })
  );

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.set('layout', 'layouts/main');
  app.use(expressLayouts);
  app.set('layout extractScripts', true);
  app.set('layout extractStyles', true);

  app.use(express.static(path.join(__dirname, 'public')));

  app.use(attachFlash);
  app.use(attachCurrentUser);
  app.use(setCsrfToken);
  app.use(attachLocals);
  app.use(verifyCsrfToken);

  app.use('/', publicRoutes);
  app.use('/', authRoutes);
  app.use('/user', userRoutes);
  app.use('/collector', collectorRoutes);
  app.use('/point-manager', pointManagerRoutes);
  app.use('/factory', factoryRoutes);
  app.use('/admin', adminRoutes);
  app.use('/super-admin', superAdminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.locals.isConfigured = true;
  return app;
};

const startServer = async () => {
  if (app.locals.server) {
    return app.locals.server;
  }

  await configureApp();

  return new Promise((resolve, reject) => {
    const server = app.listen(PORT);

    server.once('error', (error) => {
      reject(error);
    });

    server.once('listening', () => {
      const runtime = getRuntime();
      const modeLabel = runtime.mode === 'json' ? 'JSON fallback' : 'MongoDB';
      console.log(`ChiqindiBor started on port ${PORT} (${modeLabel})`);
      app.locals.server = server;
      resolve(server);
    });
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('ChiqindiBor failed to start:', error);
    process.exit(1);
  });
}

module.exports = {
  app,
  configureApp,
  startServer
};
