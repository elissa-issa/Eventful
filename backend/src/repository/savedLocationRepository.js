const SavedLocation = require('../models/SavedLocation');

async function createLocation(locationData) {
  return SavedLocation.create(locationData);
}

async function findByUser(userId) {
  return SavedLocation.find({ user: userId }).sort({ updatedAt: -1 });
}

async function findByIdForUser(locationId, userId) {
  return SavedLocation.findOne({ _id: locationId, user: userId });
}

async function updateByIdForUser(locationId, userId, locationData) {
  return SavedLocation.findOneAndUpdate(
    { _id: locationId, user: userId },
    locationData,
    { new: true, runValidators: true },
  );
}

async function deleteByIdForUser(locationId, userId) {
  return SavedLocation.findOneAndDelete({ _id: locationId, user: userId });
}

module.exports = {
  createLocation,
  findByUser,
  findByIdForUser,
  updateByIdForUser,
  deleteByIdForUser,
};
