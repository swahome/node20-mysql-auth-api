import { ApiError } from '../lib/api-error.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const requireAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Missing bearer token.'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub };
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired access token.'));
  }
};
