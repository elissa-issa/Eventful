const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');

function createServiceController(repository, serviceName) {
  const readableName = serviceName.toLowerCase();

  const list = asyncHandler(async (request, response) => {
    const items = await repository.findAll(request.query);

    response.status(200).json({
      message: `${serviceName} list fetched successfully`,
      data: items,
    });
  });

  const getById = asyncHandler(async (request, response) => {
    const item = await repository.findById(request.params.id);

    if (!item) {
      throw new ApiError(404, `${serviceName} item not found`);
    }

    response.status(200).json({
      message: `${serviceName} item fetched successfully`,
      data: item,
    });
  });

  const create = asyncHandler(async (request, response) => {
    const item = await repository.create(request.body);

    response.status(201).json({
      message: `${serviceName} item created successfully`,
      data: item,
    });
  });

  const update = asyncHandler(async (request, response) => {
    const item = await repository.updateById(request.params.id, request.body);

    if (!item) {
      throw new ApiError(404, `${serviceName} item not found`);
    }

    response.status(200).json({
      message: `${serviceName} item updated successfully`,
      data: item,
    });
  });

  const remove = asyncHandler(async (request, response) => {
    const item = await repository.deleteById(request.params.id);

    if (!item) {
      throw new ApiError(404, `${serviceName} item not found`);
    }

    response.status(200).json({
      message: `${serviceName} item deleted successfully`,
      data: {
        id: item.id,
        type: readableName,
      },
    });
  });

  return {
    list,
    getById,
    create,
    update,
    remove,
  };
}

module.exports = { createServiceController };
