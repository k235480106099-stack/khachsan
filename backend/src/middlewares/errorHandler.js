export function notFoundHandler(req, res, next) {
  res.status(404).json({ message: `Không tìm thấy tài nguyên: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error('🔥 [Unhandled Error]:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Lỗi máy chủ nội bộ',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

