const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (err.name === 'CastError') {
      const message = `Invalid id:  ${error.value}}`;

      error = new AppError(message, 400);
    }

    if (err.code === 11000) {
      const { name, email } = error.keyValue;
      let message;
      if (name) {
        message = `Name already exists: ${error.keyValue.name}, Please use a different name.`;
      }
      if (email) {
        message = `Email address already exists, please use a different email.`;
      }

      error = new AppError(message, 400);
    }

    if (err.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((val) => val.message);
      const message = `Invalid input data: ${errors.join(', ')}`;
      error = new AppError(message, 400);
    }

    if (err.name === 'JsonWebTokenError') {
      const message = 'Something went wrong, Please try again';
      error = new AppError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
      const message = 'Please login again to continue';
      error = new AppError(message, 401);
    }

    res.status(error.statusCode).json({
      status: error.status,
      message: error.isOperational ? error.message : 'Something went wrong',
    });
  }

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
};
