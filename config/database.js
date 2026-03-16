const mongoose = require('mongoose');

const { setRuntime } = require('./runtime');
const { enableJsonFallback } = require('../services/jsonModelAdapter');

const connectDatabase = async () => {
  const mongoUrl = process.env.MONGODB_URI?.trim();
  const timeout = Number(process.env.MONGODB_TIMEOUT_MS || 3000);

  if (!mongoUrl) {
    enableJsonFallback();
    const runtime = setRuntime({
      mode: 'json',
      connected: false,
      usingJsonFallback: true,
      lastError: 'MONGODB_URI is not configured'
    });
    console.warn('MongoDB URI topilmadi. JSON fallback rejimi yoqildi.');
    return runtime;
  }

  try {
    await mongoose.connect(mongoUrl, {
      autoIndex: true,
      serverSelectionTimeoutMS: timeout
    });

    const runtime = setRuntime({
      mode: 'mongo',
      connected: true,
      usingJsonFallback: false,
      lastError: null
    });

    console.log('MongoDB connected');
    return runtime;
  } catch (error) {
    console.error(`MongoDB ulanmayapti: ${error.message}`);
    console.warn("JSON fallback rejimiga o'tilmoqda.");

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.warn(`MongoDB disconnect warning: ${disconnectError.message}`);
    }

    enableJsonFallback();
    const runtime = setRuntime({
      mode: 'json',
      connected: false,
      usingJsonFallback: true,
      lastError: error.message
    });

    return runtime;
  }
};

module.exports = connectDatabase;
