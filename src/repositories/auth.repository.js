import { prisma } from '../lib/prisma.js';

export const authRepository = {
  findUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  createUser(data) {
    return prisma.user.create({ data });
  },

  updateUser(id, data) {
    return prisma.user.update({ where: { id }, data });
  },

  createVerificationToken(data) {
    return prisma.verificationToken.create({ data });
  },

  findVerificationToken(tokenHash) {
    return prisma.verificationToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
  },

  deleteVerificationTokensByUserId(userId) {
    return prisma.verificationToken.deleteMany({ where: { userId } });
  },

  createPasswordResetToken(data) {
    return prisma.passwordResetToken.create({ data });
  },

  findPasswordResetToken(tokenHash) {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
  },

  deletePasswordResetTokensByUserId(userId) {
    return prisma.passwordResetToken.deleteMany({ where: { userId } });
  },

  createRefreshToken(data) {
    return prisma.refreshToken.create({ data });
  },

  findRefreshTokenByJti(jti) {
    return prisma.refreshToken.findUnique({ where: { jti } });
  },

  revokeRefreshToken(id) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() }
    });
  },

  revokeRefreshTokensByUserId(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
};
