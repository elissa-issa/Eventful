const Favorite = require('../models/Favorite');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const {
  attachServiceDetails,
  getServiceByType,
  validateObjectId,
  validateServiceType,
} = require('../helpers/serviceResolver');

async function findOrCreateFavorites(userId) {
  return Favorite.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { returnDocument: 'after', upsert: true },
  );
}

async function buildFavoritesResponse(favorites) {
  const items = await attachServiceDetails(favorites.items);

  return {
    id: favorites.id,
    user: favorites.user.toString(),
    items,
    createdAt: favorites.createdAt,
    updatedAt: favorites.updatedAt,
  };
}

const getFavorites = asyncHandler(async (request, response) => {
  const favorites = await findOrCreateFavorites(request.user.id);

  response.status(200).json({
    message: 'Favorites fetched successfully',
    data: await buildFavoritesResponse(favorites),
  });
});

const addFavorite = asyncHandler(async (request, response) => {
  const { serviceId, serviceType } = request.body;

  validateServiceType(serviceType);
  validateObjectId(serviceId);
  await getServiceByType(serviceType, serviceId);

  const favorites = await findOrCreateFavorites(request.user.id);
  const existingItem = favorites.items.find(
    (item) =>
      item.serviceType === serviceType &&
      item.serviceId.toString() === serviceId,
  );

  if (!existingItem) {
    favorites.items.push({ serviceId, serviceType });
    await favorites.save();
  }

  response.status(200).json({
    message: 'Favorite added successfully',
    data: await buildFavoritesResponse(favorites),
  });
});

const removeFavorite = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const serviceType = request.query.serviceType || request.body.serviceType;

  validateServiceType(serviceType);
  validateObjectId(id, 'id');

  const favorites = await findOrCreateFavorites(request.user.id);
  const initialItemCount = favorites.items.length;
  favorites.items = favorites.items.filter(
    (item) =>
      !(
        item.serviceType === serviceType &&
        item.serviceId.toString() === id
      ),
  );

  if (favorites.items.length === initialItemCount) {
    throw new ApiError(404, 'Favorite item not found');
  }

  await favorites.save();

  response.status(200).json({
    message: 'Favorite removed successfully',
    data: await buildFavoritesResponse(favorites),
  });
});

const toggleFavorite = asyncHandler(async (request, response) => {
  const { serviceId, serviceType } = request.body;

  validateServiceType(serviceType);
  validateObjectId(serviceId);
  await getServiceByType(serviceType, serviceId);

  const favorites = await findOrCreateFavorites(request.user.id);
  const existingItemIndex = favorites.items.findIndex(
    (item) =>
      item.serviceType === serviceType &&
      item.serviceId.toString() === serviceId,
  );
  const isFavorite = existingItemIndex === -1;

  if (isFavorite) {
    favorites.items.push({ serviceId, serviceType });
  } else {
    favorites.items.splice(existingItemIndex, 1);
  }

  await favorites.save();

  response.status(200).json({
    message: isFavorite
      ? 'Favorite added successfully'
      : 'Favorite removed successfully',
    data: {
      isFavorite,
      favorites: await buildFavoritesResponse(favorites),
    },
  });
});

module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite,
  toggleFavorite,
};
