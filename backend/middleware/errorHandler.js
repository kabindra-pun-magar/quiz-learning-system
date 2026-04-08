export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
};

export const notFound = (req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.originalUrl}`
  });
};