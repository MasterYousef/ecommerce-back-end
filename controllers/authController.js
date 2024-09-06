const crypto = require("crypto");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const AppError = require("../utils/AppError");
const createToken = require("../utils/createToken");
const sendEmails = require("../utils/sendEmails");

exports.signup = expressAsyncHandler(async (req, res, next) => {
  const data = await userModel.create({
    name: req.body.name,
    slug: req.body.slug,
    email: req.body.email,
    password: req.body.password,
    phone:req.body.phone
  });
  let token;
  if (data) {
    token = createToken(data);
  } else {
    throw new AppError("can't sign up now please try again later", 403);
  }
  res.status(200).json({ user: data, token });
});

exports.login = expressAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const data = await userModel.findOne({ email });
  if (!data) {
    return next(new AppError("user not found", 404));
  }
  if (!(await bcrypt.compare(password, data.password))) {
    return next(new AppError("wrong password", 400));
  }
  let token = createToken(data);
  res.status(200).json({ user: data, token });
});

exports.protect = expressAsyncHandler(async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.jwt_key);
    req.userId = decoded.userId;
    const user = await userModel.findById(req.userId);
    if (!user) {
      throw new AppError("user not found", 404);
    }
    if (user.passwordChangeAt) {
      const passwordChange = Math.round(user.passwordChangeAt / 1000);
      if (passwordChange > decoded.iat) {
        throw new AppError(
          "User recently changed his password. please login again",
          404
        );
      }
    }
    req.user = user;
  } else {
    throw new AppError("this route is protected please login first");
  }
  next();
});

exports.permissions = (...roles) =>
  expressAsyncHandler((req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      throw new AppError("you are not authorized to access this route", 403);
    }
  });

exports.forgotenpassword = expressAsyncHandler(async (req, res, next) => {
  const data = await userModel.findOne({ email: req.body.email });
  if (!data) {
    throw new AppError(
      `There is no user with that email ${req.body.email}`,
      404
    );
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hachCode = crypto.createHash("sha256").update(code).digest("hex");
  data.resetCode = hachCode;
  data.expireResetcode = Date.now() + 5 * 1000 * 60;
  data.verifyPassword = false;
  try {
    const options = {
      email: data.email,
      subject: "reset code for password reset",
      message: `hi ${data.name}\nyour reset code is ${code}\nonly available for 10 minutes`,
    };
    await sendEmails(options);
  } catch (err) {
    data.resetCode = undefined;
    data.expireResetcode = undefined;
    data.verifyPassword = undefined;
  }
  await data.save();
  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});
exports.resetCode = expressAsyncHandler(async (req, res, next) => {
  const code = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const data =await userModel.findOne({
    resetCode: code,
    expireResetcode: { $gte: Date.now() },
  });
  if (!data) {
    throw new AppError("reset Code invalid or expired");
  }
  data.verifyPassword = true;
  await data.save();
  res.status(200).json({
    status: "success",
  });
});
exports.resetPassword = expressAsyncHandler(async (req, res, next) => {
  const data = await userModel.findOne({ email: req.body.email });
  if (!data) {
    throw new AppError(
      `There is no user with that email ${req.body.email}`,
      404
    );
  }
  if(data.verifyPassword !== true){
    throw new AppError("can't reset your password please try again later")
  }
  data.password = req.body.newPassword
  data.passwordChangeAt = Date.now()
  data.resetCode = undefined;
  data.expireResetcode = undefined;
  data.verifyPassword = undefined;
  await data.save();
  const token = createToken(data);
  res.status(200).json({
    status: "success",
    message: "password reset successfully",
    token
  });
});
