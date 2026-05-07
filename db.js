const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

function ensureDatabaseFile() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ submissions: [], users: [] }, null, 2), 'utf8');
  }
}

function normalizeDatabase(db) {
  return {
    submissions: Array.isArray(db.submissions) ? db.submissions : [],
    users: Array.isArray(db.users) ? db.users : [],
  };
}

function saveSubmission(submission, callback) {
  ensureDatabaseFile();

  fs.readFile(dbPath, 'utf8', (readErr, data) => {
    if (readErr) {
      return callback(readErr);
    }

    let db;
    try {
      db = normalizeDatabase(JSON.parse(data));
    } catch (parseErr) {
      return callback(parseErr);
    }

    const submissionId = (db.submissions.length ? db.submissions[db.submissions.length - 1].id : 0) + 1;
    const record = Object.assign({ id: submissionId }, submission);
    db.submissions.push(record);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8', (writeErr) => {
      callback(writeErr, submissionId);
    });
  });
}

function loadSubmissions(callback) {
  ensureDatabaseFile();

  fs.readFile(dbPath, 'utf8', (readErr, data) => {
    if (readErr) {
      return callback(readErr);
    }

    let db;
    try {
      db = normalizeDatabase(JSON.parse(data));
    } catch (parseErr) {
      return callback(parseErr);
    }

    callback(null, db.submissions || []);
  });
}

function saveUser(user, callback) {
  ensureDatabaseFile();

  fs.readFile(dbPath, 'utf8', (readErr, data) => {
    if (readErr) {
      return callback(readErr);
    }

    let db;
    try {
      db = normalizeDatabase(JSON.parse(data));
    } catch (parseErr) {
      return callback(parseErr);
    }

    const duplicateUser = db.users.find(
      (savedUser) => savedUser.email.toLowerCase() === user.email.toLowerCase()
    );

    if (duplicateUser) {
      const duplicateErr = new Error('이미 가입된 이메일입니다.');
      duplicateErr.code = 'DUPLICATE_EMAIL';
      return callback(duplicateErr);
    }

    const userId = (db.users.length ? db.users[db.users.length - 1].id : 0) + 1;
    const record = Object.assign({ id: userId }, user);
    db.users.push(record);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8', (writeErr) => {
      callback(writeErr, userId);
    });
  });
}

function loadUsers(callback) {
  ensureDatabaseFile();

  fs.readFile(dbPath, 'utf8', (readErr, data) => {
    if (readErr) {
      return callback(readErr);
    }

    let db;
    try {
      db = normalizeDatabase(JSON.parse(data));
    } catch (parseErr) {
      return callback(parseErr);
    }

    callback(null, db.users || []);
  });
}

module.exports = {
  saveSubmission,
  loadSubmissions,
  saveUser,
  loadUsers,
};
