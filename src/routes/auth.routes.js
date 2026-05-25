import { Router } from 'express';
import {
  forgotPassword,
  login,
  logout,
  me,
  refreshToken,
  resetPassword,
  signup,
  verifyEmail
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema
} from '../validators/auth.validator.js';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.get('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/logout', validate(refreshTokenSchema), logout);
router.get('/me', requireAuth, me);

export default router;
