import { registerUser, loginUser } from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const register = async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body);
    res.status(201).json(new ApiResponse(201, { user, token }, 'User registered successfully'));
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);
    res.status(200).json(new ApiResponse(200, { user, token }, 'Login successful'));
  } catch (err) {
    next(err);
  }
};