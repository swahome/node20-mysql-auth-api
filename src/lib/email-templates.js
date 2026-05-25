export const buildVerificationEmail = ({ firstName, verifyUrl }) => ({
  subject: 'Verify your account',
  text: `Hi ${firstName},\n\nPlease verify your account by opening this link:\n${verifyUrl}\n\nIf you did not sign up, you can ignore this email.`,
  html: `<p>Hi ${firstName},</p><p>Please verify your account by opening this link:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>If you did not sign up, you can ignore this email.</p>`
});

export const buildPasswordResetEmail = ({ firstName, resetUrl }) => ({
  subject: 'Reset your password',
  text: `Hi ${firstName},\n\nUse this link to reset your password:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
  html: `<p>Hi ${firstName},</p><p>Use this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`
});
