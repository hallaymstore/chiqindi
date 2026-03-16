const fs = require('fs');
const path = require('path');

const { createDefaultData } = require('../seeds/defaultData');

const dataDirectory = path.join(__dirname, '..', 'data');
const databaseFile = path.join(dataDirectory, 'json-db.json');

const collectionKeyByModel = {
  Role: 'roles',
  User: 'users',
  WasteCategory: 'wasteCategories',
  WasteListing: 'wasteListings',
  PickupRequest: 'pickupRequests',
  CollectionPoint: 'collectionPoints',
  Factory: 'factories',
  Transaction: 'transactions',
  Payment: 'payments',
  Notification: 'notifications',
  BlogPost: 'blogPosts',
  ContactMessage: 'contactMessages',
  SiteSetting: 'siteSettings',
  AuditLog: 'auditLogs'
};

let cache = null;

const clone = (value) => JSON.parse(JSON.stringify(value));

const ensureDirectory = () => {
  fs.mkdirSync(dataDirectory, { recursive: true });
};

const ensureDatabaseFile = () => {
  ensureDirectory();
  if (!fs.existsSync(databaseFile)) {
    fs.writeFileSync(databaseFile, JSON.stringify(createDefaultData(), null, 2));
  }
};

const loadDatabase = () => {
  if (cache) {
    return cache;
  }

  ensureDatabaseFile();
  cache = JSON.parse(fs.readFileSync(databaseFile, 'utf8'));
  return cache;
};

const saveDatabase = (database) => {
  ensureDatabaseFile();
  cache = database;
  fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
  return cache;
};

const resetDatabase = (database = createDefaultData()) => saveDatabase(clone(database));

const getCollectionKey = (modelName) => collectionKeyByModel[modelName] || `${modelName[0].toLowerCase()}${modelName.slice(1)}s`;

const getCollection = (modelName) => {
  const database = loadDatabase();
  const collectionKey = getCollectionKey(modelName);

  if (!Array.isArray(database[collectionKey])) {
    database[collectionKey] = [];
    saveDatabase(database);
  }

  return database[collectionKey];
};

const readCollection = (modelName) => clone(getCollection(modelName));

const writeCollection = (modelName, collection) => {
  const database = loadDatabase();
  database[getCollectionKey(modelName)] = clone(collection);
  saveDatabase(database);
  return clone(database[getCollectionKey(modelName)]);
};

module.exports = {
  databaseFile,
  clone,
  loadDatabase,
  saveDatabase,
  resetDatabase,
  getCollectionKey,
  getCollection,
  readCollection,
  writeCollection
};
