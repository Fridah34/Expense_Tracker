const errorMiddleware = (err,req, res, next) => {
    console.error('Error:', {
        message:err.message,
        stack:process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
    });

    //Postgresql unique violation
    if(err.code === '23505') {
        return res.status(409).json({
            status:'error',
            message: 'Arecord with that value already exists',
            field: err.detail,
        });

    if (err.code ==='23503') {
        return res.status(400).json({
            status: 'error',
            message: 'Referenced record does not exist',
        });
    }

    if(err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status:'error',
            message: 'Invalid token.Please login again.',
        });
    }


    }if(err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            message: 'Your session has expired.Please login again.',
        });
    }

    // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }

  // Default — unknown server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500
      ? 'Something went wrong. Please try again later.'
      : err.message,
  });
};

module.exports = errorMiddleware;