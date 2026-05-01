const User = require('../models/User');

async function findByEmail(email) {
  return User.findOne({ email });
}

async function findById(id) {
  return User.findById(id);
}

async function createUser(userData) {
  return User.create(userData);
}

async function updateUserById(id, userData) {
  return User.findByIdAndUpdate(id, userData, {
    returnDocument: 'after',
    runValidators: true,
  });
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUserById,
};
