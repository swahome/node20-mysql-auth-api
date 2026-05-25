import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { pickUser } from '../utils/pick-user.js';

export const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);

  res.status(201).json({
    message: result.message,
    user: pickUser(result.user)
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.query.token);
  res.json(result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login({
    ...req.body,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip
  });

  res.json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: pickUser(result.user)
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken, req.headers['user-agent'], req.ip);
  res.json(result);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json(result);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  res.json(result);
});

export const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.body.refreshToken);
  res.json(result);
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.auth.userId);
  res.json({ user: pickUser(user) });
});
