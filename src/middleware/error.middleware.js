export const notFoundHandler = (_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error.' : err.message;

  res.status(statusCode).json({ message });
};
