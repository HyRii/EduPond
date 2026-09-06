// NEW FILE (Phase 4 compatibility): centralized handler required by Phase 0 and used by Phase 4.
const errorMiddleware = (error, req, res, next) => {
  const statusCode = Number(error.statusCode || error.status || 500);
  if (statusCode >= 500) console.error(error);

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Internal server error" : (error.message || "Request failed"),
    ...(error.errors ? { errors: error.errors } : {}),
  });
};

module.exports = errorMiddleware;
