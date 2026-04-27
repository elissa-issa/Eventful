const mongoose = require('mongoose');

function normalizeServicePayload(payload) {
  const normalizedPayload = { ...payload };

  if (Object.prototype.hasOwnProperty.call(normalizedPayload, 'id')) {
    normalizedPayload.itemId = normalizedPayload.id;
    delete normalizedPayload.id;
  }

  return normalizedPayload;
}

function buildIdFilter(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return {
      $or: [{ itemId: id }, { _id: id }],
    };
  }

  return { itemId: id };
}

function createServiceRepository(Model) {
  async function findAll(filters = {}) {
    return Model.find(filters).sort({ createdAt: -1 });
  }

  async function findById(id) {
    return Model.findOne(buildIdFilter(id));
  }

  async function create(payload) {
    return Model.create(normalizeServicePayload(payload));
  }

  async function updateById(id, payload) {
    return Model.findOneAndUpdate(buildIdFilter(id), normalizeServicePayload(payload), {
      returnDocument: 'after',
      runValidators: true,
    });
  }

  async function deleteById(id) {
    return Model.findOneAndDelete(buildIdFilter(id));
  }

  return {
    findAll,
    findById,
    create,
    updateById,
    deleteById,
  };
}

module.exports = { createServiceRepository };
