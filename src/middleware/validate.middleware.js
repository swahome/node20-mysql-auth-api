import { ApiError } from '../lib/api-error.js';

export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message || 'Invalid request input.'));
  }

  req.body = parsed.data.body ?? req.body;
  req.params = parsed.data.params ?? req.params;
  req.query = parsed.data.query ?? req.query;

  return next();
};
