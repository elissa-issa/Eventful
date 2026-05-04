const {
  createUserDto,
  createLoginDto,
  createPasswordChangeDto,
  createProfileUpdateDto,
} = require('../dto/authDto');
const userRepository = require('../repository/userRepository');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const { hashPassword, verifyPassword } = require('../helpers/passwordHelper');
const { generateAuthToken } = require('../helpers/tokenHelper');

const CARD_PAYMENT_FIELDS = [
  'cardHolderName',
  'cardNumber',
  'expiryDate',
  'cvc',
];
const PREMIUM_PAYMENT_METHODS = ['card', 'omt', 'wish-money'];

function validatePremiumPayment(payload = {}) {
  const paymentMethod = String(payload.paymentMethod || '').trim();

  if (!paymentMethod) {
    throw new ApiError(400, 'paymentMethod is required');
  }

  if (!PREMIUM_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new ApiError(400, 'paymentMethod is not supported for premium upgrades');
  }

  if (paymentMethod !== 'card') {
    return paymentMethod;
  }

  const cardDetails = payload.cardDetails || payload;
  const missingField = CARD_PAYMENT_FIELDS.find(
    (field) => !String(cardDetails[field] || '').trim(),
  );

  if (missingField) {
    throw new ApiError(400, `${missingField} is required`);
  }

  return paymentMethod;
}

function buildAuthResponse(user) {
  return {
    token: generateAuthToken({
      userId: user.id,
      email: user.email,
    }),
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      birthday: user.birthday,
      avatarSrc: user.avatarSrc,
      subscriptionPlan: user.subscriptionPlan || 'free',
      isPremium: Boolean(user.isPremium),
      premiumSince: user.premiumSince,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

const signup = asyncHandler(async (request, response) => {
  const signupDto = createUserDto(request.body);
  const existingUser = await userRepository.findByEmail(signupDto.email);

  if (existingUser && !existingUser.isdeleted) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const passwordHash = await hashPassword(signupDto.password);

  if (existingUser?.isdeleted) {
    const restoredUser = await userRepository.updateUserById(existingUser.id, {
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
      email: signupDto.email,
      birthday: signupDto.birthday,
      passwordHash,
      isdeleted: false,
      subscriptionPlan: 'free',
      isPremium: false,
      premiumSince: null,
      avatarSrc: '',
    });

    response.status(201).json({
      message: 'User created successfully',
      data: buildAuthResponse(restoredUser),
    });
    return;
  }

  const createdUser = await userRepository.createUser({
    firstName: signupDto.firstName,
    lastName: signupDto.lastName,
    email: signupDto.email,
    birthday: signupDto.birthday,
    passwordHash,
    isdeleted: false,
  });

  response.status(201).json({
    message: 'User created successfully',
    data: buildAuthResponse(createdUser),
  });
});

const login = asyncHandler(async (request, response) => {
  const loginDto = createLoginDto(request.body);
  const user = await userRepository.findByEmail(loginDto.email);

  if (!user || user.isdeleted) {
    throw new ApiError(404, 'Account does not exist');
  }

  const passwordMatches = await verifyPassword(
    loginDto.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  response.status(200).json({
    message: 'Login successful',
    data: buildAuthResponse(user),
  });
});

const updateProfile = asyncHandler(async (request, response) => {
  const profileDto = createProfileUpdateDto(request.body);
  const existingUser = await userRepository.findByEmail(profileDto.email);

  if (
    existingUser &&
    existingUser.id.toString() !== request.user.id.toString()
  ) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const updatedUser = await userRepository.updateUserById(
    request.user.id,
    profileDto,
  );

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  response.status(200).json({
    message: 'Profile updated successfully',
    data: buildAuthResponse(updatedUser),
  });
});

const changePassword = asyncHandler(async (request, response) => {
  const passwordDto = createPasswordChangeDto(request.body);
  const passwordMatches = await verifyPassword(
    passwordDto.currentPassword,
    request.user.passwordHash,
  );

  if (!passwordMatches) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  const passwordHash = await hashPassword(passwordDto.newPassword);
  const updatedUser = await userRepository.updateUserById(request.user.id, {
    passwordHash,
  });

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  response.status(200).json({
    message: 'Password updated successfully',
  });
});

const upgradeToPremium = asyncHandler(async (request, response) => {
  validatePremiumPayment(request.body);

  const updatedUser = await userRepository.updateUserById(request.user.id, {
    subscriptionPlan: 'premium',
    isPremium: true,
    premiumSince: request.user.premiumSince || new Date(),
  });

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  response.status(200).json({
    message: 'Premium plan activated successfully',
    data: buildAuthResponse(updatedUser),
  });
});

const cancelPremium = asyncHandler(async (request, response) => {
  const updatedUser = await userRepository.updateUserById(request.user.id, {
    subscriptionPlan: 'free',
    isPremium: false,
    premiumSince: null,
  });

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  response.status(200).json({
    message: 'Premium plan cancelled successfully',
    data: buildAuthResponse(updatedUser),
  });
});

const deleteAccount = asyncHandler(async (request, response) => {
  const updatedUser = await userRepository.updateUserById(request.user.id, {
    isdeleted: true,
  });

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  response.status(200).json({
    message: 'Account deleted successfully',
  });
});

module.exports = {
  signup,
  login,
  updateProfile,
  changePassword,
  upgradeToPremium,
  cancelPremium,
  deleteAccount,
};
