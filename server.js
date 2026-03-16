const { startServer } = require('./app');

startServer().catch((error) => {
  console.error('Server bootstrap error:', error);
  process.exit(1);
});
