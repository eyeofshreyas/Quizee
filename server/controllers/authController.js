const { registerUser, loginUser, updateProfile } = require('../services/authService.js');
const ApiResponse = require('../utils/ApiResponse.js');

const register = async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body);
    res.status(201).json(new ApiResponse(201, { user, token }, 'User registered successfully'));
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);
    res.status(200).json(new ApiResponse(200, { user, token }, 'Login successful'));
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json(new ApiResponse(200, req.user, 'Current user fetched'));
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const user = await updateProfile({ userId: req.user._id, updates: req.body });
    res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateMe };