const CustomizedPlan = require('../models/CustomizedPlan');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const {
  attachServiceDetails,
  getServiceByType,
  validateObjectId,
  validateServiceId,
  validateServiceType,
} = require('../helpers/serviceResolver');

function normalizeQuantity(value, fallback = 1) {
  const quantity = Number(value ?? fallback);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ApiError(400, 'quantity must be a positive integer');
  }

  return quantity;
}

function getPlanId(request) {
  const { planId } = request.params;
  validateObjectId(planId, 'planId');
  return planId;
}

async function findOwnedPlan(userId, planId) {
  const plan = await CustomizedPlan.findOne({
    _id: planId,
    user: userId,
  });

  if (!plan) {
    throw new ApiError(404, 'Customized plan not found');
  }

  return plan;
}

function buildSnapshot(service, body = {}) {
  return {
    pricingSnapshot: body.pricingSnapshot || {
      priceValue: service.priceValue,
      priceText: service.priceText,
    },
    titleSnapshot: body.titleSnapshot || service.title || '',
    imageSnapshot: body.imageSnapshot || service.imageSrc || '',
    vendorSnapshot: body.vendorSnapshot || service.vendorName || '',
    priceTextSnapshot: body.priceTextSnapshot || service.priceText || '',
  };
}

async function normalizePlanItem(body) {
  const section = body.section || body.serviceType;
  const rawItemId = body.itemId || body.serviceId;

  validateServiceType(section);
  validateServiceId(String(rawItemId || ''), 'itemId');

  const service = await getServiceByType(section, rawItemId);

  return {
    section,
    itemId: service.itemId || service.id,
    quantity: normalizeQuantity(body.quantity),
    selectedOptions: body.selectedOptions || body.customOptions || {},
    ...buildSnapshot(service, body),
  };
}

async function buildPlanResponse(plan) {
  const compatibleItems = plan.items.map((item) => {
    const itemObject = item.toObject ? item.toObject() : item;
    return {
      ...itemObject,
      serviceType: itemObject.section,
      serviceId: itemObject.itemId,
      customOptions: itemObject.selectedOptions || {},
    };
  });
  const enrichedItems = await attachServiceDetails(compatibleItems);
  const items = enrichedItems.map((item) => ({
    id: item._id?.toString?.() || item.id,
    section: item.section || item.serviceType,
    itemId: item.itemId || item.serviceId,
    serviceType: item.section || item.serviceType,
    serviceId: item.itemId || item.serviceId,
    quantity: item.quantity,
    selectedOptions: item.selectedOptions || item.customOptions || {},
    pricingSnapshot: item.pricingSnapshot || {},
    titleSnapshot: item.titleSnapshot || '',
    imageSnapshot: item.imageSnapshot || '',
    vendorSnapshot: item.vendorSnapshot || '',
    priceTextSnapshot: item.priceTextSnapshot || '',
    addedAt: item.addedAt,
    service: item.service,
  }));

  return {
    id: plan.id,
    user: plan.user.toString(),
    name: plan.name,
    title: plan.name,
    description: plan.description,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    previewItems: items.slice(0, 4).map((item) => ({
      id: `${item.section}:${item.itemId}`,
      imageSrc: item.service?.imageSrc || item.imageSnapshot,
      imageAlt: item.service?.imageAlt || item.titleSnapshot || item.section,
    })),
    items,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

const listPlans = asyncHandler(async (request, response) => {
  const plans = await CustomizedPlan.find({ user: request.user.id }).sort({
    updatedAt: -1,
  });
  const data = await Promise.all(plans.map(buildPlanResponse));

  response.status(200).json({
    message: 'Customized plans fetched successfully',
    data,
  });
});

const createPlan = asyncHandler(async (request, response) => {
  const name = String(request.body.name || '').trim();

  if (!name) {
    throw new ApiError(400, 'name is required');
  }

  const plan = await CustomizedPlan.create({
    user: request.user.id,
    name,
    description: String(request.body.description || '').trim(),
    items: [],
  });

  response.status(201).json({
    message: 'Customized plan created successfully',
    data: await buildPlanResponse(plan),
  });
});

const getPlan = asyncHandler(async (request, response) => {
  const plan = await findOwnedPlan(request.user.id, getPlanId(request));

  response.status(200).json({
    message: 'Customized plan fetched successfully',
    data: await buildPlanResponse(plan),
  });
});

const updatePlan = asyncHandler(async (request, response) => {
  const plan = await findOwnedPlan(request.user.id, getPlanId(request));

  if (request.body.name !== undefined) {
    const name = String(request.body.name || '').trim();

    if (!name) {
      throw new ApiError(400, 'name cannot be empty');
    }

    plan.name = name;
  }

  if (request.body.description !== undefined) {
    plan.description = String(request.body.description || '').trim();
  }

  await plan.save();

  response.status(200).json({
    message: 'Customized plan updated successfully',
    data: await buildPlanResponse(plan),
  });
});

const deletePlan = asyncHandler(async (request, response) => {
  const plan = await findOwnedPlan(request.user.id, getPlanId(request));
  await plan.deleteOne();

  response.status(200).json({
    message: 'Customized plan deleted successfully',
    data: { id: plan.id },
  });
});

const addItem = asyncHandler(async (request, response) => {
  const plan = await findOwnedPlan(request.user.id, getPlanId(request));
  const itemPayload = await normalizePlanItem(request.body);
  const existingItem = plan.items.find(
    (item) => item.section === itemPayload.section && item.itemId === itemPayload.itemId,
  );

  if (existingItem) {
    existingItem.quantity += itemPayload.quantity;
    existingItem.selectedOptions = {
      ...(existingItem.selectedOptions || {}),
      ...(itemPayload.selectedOptions || {}),
    };
    existingItem.pricingSnapshot = itemPayload.pricingSnapshot;
    existingItem.titleSnapshot = itemPayload.titleSnapshot;
    existingItem.imageSnapshot = itemPayload.imageSnapshot;
    existingItem.vendorSnapshot = itemPayload.vendorSnapshot;
    existingItem.priceTextSnapshot = itemPayload.priceTextSnapshot;
  } else {
    plan.items.push(itemPayload);
  }

  await plan.save();

  response.status(200).json({
    message: existingItem
      ? 'Customized plan item quantity updated successfully'
      : 'Customized plan item added successfully',
    data: await buildPlanResponse(plan),
  });
});

const updateItem = asyncHandler(async (request, response) => {
  const plan = await findOwnedPlan(request.user.id, getPlanId(request));
  const { itemId } = request.params;
  const section = request.body?.section || request.query.section;

  validateServiceType(section);
  validateServiceId(itemId, 'itemId');

  const item = plan.items.find(
    (planItem) => planItem.section === section && planItem.itemId === itemId,
  );

  if (!item) {
    throw new ApiError(404, 'Customized plan item not found');
  }

  if (request.body.quantity !== undefined) {
    item.quantity = normalizeQuantity(request.body.quantity);
  }

  if (request.body.selectedOptions !== undefined || request.body.customOptions !== undefined) {
    item.selectedOptions = request.body.selectedOptions || request.body.customOptions || {};
  }

  await plan.save();

  response.status(200).json({
    message: 'Customized plan item updated successfully',
    data: await buildPlanResponse(plan),
  });
});

const removeItem = asyncHandler(async (request, response) => {
  const plan = await findOwnedPlan(request.user.id, getPlanId(request));
  const { itemId } = request.params;
  const section = request.body?.section || request.query.section;

  validateServiceType(section);
  validateServiceId(itemId, 'itemId');

  const initialItemCount = plan.items.length;
  plan.items = plan.items.filter(
    (item) => !(item.section === section && item.itemId === itemId),
  );

  if (plan.items.length === initialItemCount) {
    throw new ApiError(404, 'Customized plan item not found');
  }

  await plan.save();

  response.status(200).json({
    message: 'Customized plan item removed successfully',
    data: await buildPlanResponse(plan),
  });
});

module.exports = {
  addItem,
  createPlan,
  deletePlan,
  getPlan,
  listPlans,
  removeItem,
  updateItem,
  updatePlan,
};
