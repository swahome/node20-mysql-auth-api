import crypto from 'node:crypto';

export const generateToken = (size = 32) => crypto.randomBytes(size).toString('hex');

export const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
