const fs = require('fs');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionsDirectory = path.join(__dirname, '..', 'data');
const sessionsFile = path.join(sessionsDirectory, 'sessions.json');

const ensureSessionsFile = () => {
  fs.mkdirSync(sessionsDirectory, { recursive: true });
  if (!fs.existsSync(sessionsFile)) {
    fs.writeFileSync(sessionsFile, JSON.stringify({}, null, 2));
  }
};

const readSessions = () => {
  ensureSessionsFile();
  return JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
};

const writeSessions = (sessions) => {
  ensureSessionsFile();
  fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2));
};

class JsonSessionStore extends session.Store {
  get(sid, callback) {
    try {
      const sessions = readSessions();
      callback(null, sessions[sid] || null);
    } catch (error) {
      callback(error);
    }
  }

  set(sid, sessionData, callback) {
    try {
      const sessions = readSessions();
      sessions[sid] = sessionData;
      writeSessions(sessions);
      callback?.(null);
    } catch (error) {
      callback?.(error);
    }
  }

  destroy(sid, callback) {
    try {
      const sessions = readSessions();
      delete sessions[sid];
      writeSessions(sessions);
      callback?.(null);
    } catch (error) {
      callback?.(error);
    }
  }

  touch(sid, sessionData, callback) {
    this.set(sid, sessionData, callback);
  }

  clear(callback) {
    try {
      writeSessions({});
      callback?.(null);
    } catch (error) {
      callback?.(error);
    }
  }
}

const createSessionStore = (runtime = {}) => {
  const mongoUrl = process.env.MONGODB_URI?.trim();

  if (runtime.mode === 'mongo' && mongoUrl) {
    return MongoStore.create({
      mongoUrl,
      stringify: false,
      touchAfter: 24 * 3600
    });
  }

  console.warn('Session store JSON fayl rejimida ishlayapti.');
  return new JsonSessionStore();
};

module.exports = createSessionStore;
