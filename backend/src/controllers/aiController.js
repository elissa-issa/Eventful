const Bundle = require('../models/Bundle');
const Decoration = require('../models/Decoration');
const Entertainment = require('../models/Entertainment');
const Menu = require('../models/Menu');
const Venue = require('../models/Venue');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const { generateInspirationPlan } = require('../services/geminiService');

const SERVICE_MODELS = [
  { serviceType: 'venues', Model: Venue },
  { serviceType: 'menus', Model: Menu },
  { serviceType: 'decorations', Model: Decoration },
  { serviceType: 'entertainment', Model: Entertainment },
  { serviceType: 'bundles', Model: Bundle },
];

function isPremiumUser(user) {
  return Boolean(
    user?.plan === 'premium' ||
      user?.subscriptionPlan === 'premium' ||
      user?.isPremium,
  );
}

function pickServiceFields(serviceType, service) {
  return {
    serviceType,
    itemId: service.itemId,
    title: service.title,
    description: service.description || '',
    detailsDescription: service.detailsDescription || '',
    category: service.category || '',
    location: service.location || service.vendorLocation || '',
    vendorName: service.vendorName || '',
    priceValue: service.priceValue || 0,
    priceText: service.priceText || '',
    guestText: service.guestText || '',
    imageSrc: service.imageSrc || '',
    imageAlt: service.imageAlt || '',
  };
}

async function loadAvailableServices() {
  const servicesByType = await Promise.all(
    SERVICE_MODELS.map(async ({ serviceType, Model }) => {
      const services = await Model.find({})
        .select(
          'itemId title description detailsDescription category location vendorLocation vendorName priceValue priceText guestText imageSrc imageAlt',
        )
        .lean();

      return services.map((service) => pickServiceFields(serviceType, service));
    }),
  );

  return servicesByType.flat();
}

function normalizePlan(plan) {
  return {
    title: String(plan.title || 'Eventful AI Plan').trim(),
    summary: String(plan.summary || '').trim(),
    recommendedItems: Array.isArray(plan.recommendedItems)
      ? plan.recommendedItems
      : [],
    estimatedTotal: Number(plan.estimatedTotal || 0),
    planningTips: Array.isArray(plan.planningTips)
      ? plan.planningTips.map((tip) => String(tip || '').trim()).filter(Boolean)
      : [],
  };
}

function validateRecommendedItems(recommendedItems, services) {
  const servicesByKey = new Map(
    services.map((service) => [`${service.serviceType}:${service.itemId}`, service]),
  );

  return recommendedItems
    .map((item) => {
      const serviceType = String(item.serviceType || '').trim();
      const itemId = String(item.itemId || '').trim();
      const service = servicesByKey.get(`${serviceType}:${itemId}`);

      if (!service) {
        return null;
      }

      return {
        serviceType,
        itemId,
        reason: String(item.reason || '').trim(),
        service,
      };
    })
    .filter(Boolean);
}

const createInspirationPlan = asyncHandler(async (request, response) => {
  if (!isPremiumUser(request.user)) {
    throw new ApiError(403, 'AI planning is available for premium users only.');
  }

  const userMessage = String(request.body.message || '').trim();

  if (!userMessage) {
    throw new ApiError(400, 'message is required');
  }

  const services = await loadAvailableServices();

  if (!services.length) {
    throw new ApiError(404, 'No Eventful services are available for AI planning');
  }

  const plan = normalizePlan(await generateInspirationPlan({ userMessage, services }));
  const recommendedItems = validateRecommendedItems(plan.recommendedItems, services);

  if (!recommendedItems.length) {
    throw new ApiError(404, 'No matching Eventful services were found for this plan');
  }

  response.status(200).json({
    message: 'AI plan created successfully',
    data: {
      ...plan,
      recommendedItems,
      estimatedTotal: recommendedItems.reduce(
        (total, item) => total + Number(item.service.priceValue || 0),
        0,
      ),
    },
  });
});

module.exports = { createInspirationPlan };
