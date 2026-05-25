import { ApiError } from '../lib/api-error.js';
import { buildPasswordResetEmail, buildVerificationEmail } from '../lib/email-templates.js';
import { env } from '../config/env.js';
import { authRepository } from '../repositories/auth.repository.js';
import { generateToken, sha256 } from '../utils/crypto.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { addDays, addMinutes } from '../utils/time.js';
import { mailService } from './mail.service.js';

const requireVerifiedUser = (user) => {
  if (!user.emailVerified) {
    throw new ApiError(403, 'Email verification is required before login.');
  }
};

const verificationTokenTtlMinutes = 60 * 24;
const passwordResetTokenTtlMinutes = 30;

const buildAuthResponse = (user) => {
  const accessToken = createAccessToken(user.id);
  const { token: refreshToken, jti } = createRefreshToken(user.id);

  return { accessToken, refreshToken, jti };
};

export const authService = {
  async signup({ email, password, firstName, lastName }) {
    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'Email is already registered.');
    }

    const user = await authRepository.createUser({
      email,
      passwordHash: await hashPassword(password),
      firstName,
      lastName,
      emailVerified: false
    });

    const rawToken = generateToken();
    const tokenHash = sha256(rawToken);

    await authRepository.createVerificationToken({
      tokenHash,
      userId: user.id,
      expiresAt: addMinutes(new Date(), verificationTokenTtlMinutes)
    });

    const verifyUrl = `${env.APP_BASE_URL}/api/auth/verify-email?token=${rawToken}`;
    const message = buildVerificationEmail({ firstName: user.firstName, verifyUrl });

    await mailService.sendMail({ to: user.email, ...message });

    return { user, message: 'Signup successful. Please verify your email.' };
  },

  async verifyEmail(rawToken) {
    const tokenHash = sha256(rawToken);
    const tokenRecord = await authRepository.findVerificationToken(tokenHash);

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new ApiError(400, 'Invalid or expired verification token.');
    }

    await authRepository.updateUser(tokenRecord.userId, { emailVerified: true });
    await authRepository.deleteVerificationTokensByUserId(tokenRecord.userId);

    return { message: 'Email verification completed.' };
  },

  async login({ email, password, userAgent, ipAddress }) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials.');
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      throw new ApiError(401, 'Invalid credentials.');
    }

    requireVerifiedUser(user);

    const { accessToken, refreshToken, jti } = buildAuthResponse(user);
    await authRepository.createRefreshToken({
      jti,
      tokenHash: sha256(refreshToken),
      userId: user.id,
      userAgent,
      ipAddress,
      expiresAt: addDays(new Date(), 7)
    });

    return { accessToken, refreshToken, user };
  },

  async refresh(refreshToken, userAgent, ipAddress) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, 'Invalid refresh token.');
    }

    const tokenRecord = await authRepository.findRefreshTokenByJti(payload.jti);
    if (
      !tokenRecord ||
      tokenRecord.revokedAt ||
      tokenRecord.expiresAt < new Date() ||
      tokenRecord.tokenHash !== sha256(refreshToken)
    ) {
      throw new ApiError(401, 'Invalid refresh token.');
    }

    await authRepository.revokeRefreshToken(tokenRecord.id);

    const user = await authRepository.findUserById(payload.sub);
    if (!user) {
      throw new ApiError(401, 'User not found for token.');
    }

    const nextTokens = buildAuthResponse(user);

    await authRepository.createRefreshToken({
      jti: nextTokens.jti,
      tokenHash: sha256(nextTokens.refreshToken),
      userId: user.id,
      userAgent,
      ipAddress,
      expiresAt: addDays(new Date(), 7)
    });

    return { accessToken: nextTokens.accessToken, refreshToken: nextTokens.refreshToken };
  },

  async forgotPassword(email) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      return { message: 'If that email exists, a password reset link has been sent.' };
    }

    const rawToken = generateToken();
    const tokenHash = sha256(rawToken);

    await authRepository.deletePasswordResetTokensByUserId(user.id);
    await authRepository.createPasswordResetToken({
      tokenHash,
      userId: user.id,
      expiresAt: addMinutes(new Date(), passwordResetTokenTtlMinutes)
    });

    const resetUrl = `${env.APP_BASE_URL}/api/auth/reset-password?token=${rawToken}`;
    const message = buildPasswordResetEmail({ firstName: user.firstName, resetUrl });
    await mailService.sendMail({ to: user.email, ...message });

    return { message: 'If that email exists, a password reset link has been sent.' };
  },

  async resetPassword(token, newPassword) {
    const tokenRecord = await authRepository.findPasswordResetToken(sha256(token));
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new ApiError(400, 'Invalid or expired reset token.');
    }

    await authRepository.updateUser(tokenRecord.userId, {
      passwordHash: await hashPassword(newPassword)
    });

    await authRepository.deletePasswordResetTokensByUserId(tokenRecord.userId);
    await authRepository.revokeRefreshTokensByUserId(tokenRecord.userId);

    return { message: 'Password has been reset successfully.' };
  },

  async logout(refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const tokenRecord = await authRepository.findRefreshTokenByJti(payload.jti);
      if (tokenRecord && !tokenRecord.revokedAt) {
        await authRepository.revokeRefreshToken(tokenRecord.id);
      }
    } catch {}

    return { message: 'Logged out successfully.' };
  },

  async getCurrentUser(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    return user;
  }
};
