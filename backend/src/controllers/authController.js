const {
  createUserDto,
  createLoginDto,
  createProfileUpdateDto,
} = require('../dto/authDto');
const userRepository = require('../repository/userRepository');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const { hashPassword, verifyPassword } = require('../helpers/passwordHelper');
const { generateAuthToken } = require('../helpers/tokenHelper');

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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

const signup = asyncHandler(async (request, response) => {
  const signupDto = createUserDto(request.body);
  const existingUser = await userRepository.findByEmail(signupDto.email);

  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const passwordHash = await hashPassword(signupDto.password);
  const createdUser = await userRepository.createUser({
    firstName: signupDto.firstName,
    lastName: signupDto.lastName,
    email: signupDto.email,
    birthday: signupDto.birthday,
    passwordHash,
  });

  response.status(201).json({
    message: 'User created successfully',
    data: buildAuthResponse(createdUser),
  });
});

const login = asyncHandler(async (request, response) => {
  const loginDto = createLoginDto(request.body);
  const user = await userRepository.findByEmail(loginDto.email);

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
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

module.exports = {
  signup,
  login,
  updateProfile,
};
