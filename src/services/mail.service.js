import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS
        }
      : undefined
});

export const mailService = {
  async sendMail({ to, subject, text, html }) {
    await transport.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text,
      html
    });
  }
};
