const AppError = require("../utils/AppError");

const tokenError = (err) => {
  if (err.name === "JsonWebTokenError") {
    err = new AppError("Invalid token, please login again..", 401);
    return err;
  }
  if (err.name === "TokenExpiredError") {
    err = new AppError("Expired token, please login again..", 401);
    return err;
  }
};
const devHandler = (err, res) => {
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError"){
    err = tokenError(err);
  }
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
};
const prodHandler = (error, res) => {
  const err = tokenError(error);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "dev") {
    devHandler(err, res);
  } else {
    prodHandler(err, res);
  }
};
module.exports = globalError;
