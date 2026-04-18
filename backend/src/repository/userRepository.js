const User = require('../models/User');

async function findByEmail(email) {
  return User.findOne({ email });
}

async function createUser(userData) {
  return User.create(userData);
}

module.exports = {
  findByEmail,
  createUser,
};
