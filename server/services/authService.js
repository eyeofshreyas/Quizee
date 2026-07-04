const bcrypt = require('bcryptjs');
const User = require('../models/User.js');
const generateToken = require('../utils/generateToken.js');
const ApiError = require('../utils/ApiError.js');

const registerUser = async ({ username, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ username, email, passwordHash });
  const token = generateToken(user._id);

  return { user, token };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);
  return { user, token };
};

module.exports = { registerUser, loginUser };
