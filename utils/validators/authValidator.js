const { check } = require("express-validator");
const { default: slugify } = require("slugify");
const userModel = require("../../models/userModel");
const AppError = require("../AppError");
const ValidationMidleware = require("../../middlewares/ValidationMidleware");

exports.signUpValidator = [
  check("name")
    .notEmpty()
    .withMessage("Please enter a valid name")
    .isLength({ min: 3 })
    .withMessage("to short user name")
    .isLength({ max: 25 })
    .withMessage("to long user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("please enter your email address")
    .isEmail()
    .withMessage("please enter a valid email address")
    .custom(async (val) => {
      const data = await userModel.findOne({ email: val });
      if (data) {
        throw new AppError("email already exists", 400);
      }
    }),
  check("password")
    .notEmpty()
    .withMessage("user password is required")
    .isLength({ min: 6 })
    .withMessage("too short password")
    .custom((password, { req }) => {
      if (password !== req.body.newPasswordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  check("newPasswordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),
  check("phone")
    .notEmpty()
    .withMessage("user phone is required")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("only EGY and Sa phone numbers are allowed"),
  ValidationMidleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("please enter your email address")
    .isEmail()
    .withMessage("please enter a valid email address"),
  check("password")
    .notEmpty()
    .withMessage("user password is required")
    .isLength({ min: 6 })
    .withMessage("too short password"),
  ValidationMidleware,
];

exports.forgtenPasswordvalidator = [
  check("email")
    .notEmpty()
    .withMessage("please enter your email address")
    .isEmail()
    .withMessage("please enter a valid email address"),
  ValidationMidleware,
];

exports.resetCodeValidator = [
  check("resetCode").notEmpty().withMessage("please enter your reset code"),
  ValidationMidleware,
];

exports.resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("please enter your email address")
    .isEmail()
    .withMessage("please enter a valid email address"),
  check("newPassword")
    .notEmpty()
    .withMessage("user password is required")
    .isLength({ min: 6 })
    .withMessage("too short password")
    .custom((password, { req }) => {
      if (password !== req.body.newPasswordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  check("newPasswordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),
  ValidationMidleware,
];
