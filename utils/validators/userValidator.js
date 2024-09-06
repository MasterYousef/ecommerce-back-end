const { default: slugify } = require("slugify");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const ValidationMidleware = require("../../middlewares/ValidationMidleware");
const AppError = require("../AppError");
const userModel = require("../../models/userModel");
const productModel = require("../../models/productModel");

exports.createUserValidator = [
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
  check("image").optional(),
  check("role").optional(),
  ValidationMidleware,
];

exports.updateUservalidator = [
  check("id").isMongoId().withMessage("user id is not valid"),
  check("name")
    .optional()
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
    .optional()
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
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("only EGY and Sa phone numbers are allowed"),
  check("image").optional(),
  check("role").optional(),
  ValidationMidleware,
];

exports.getUserValidator = [
  check("id").isMongoId().withMessage("user id is not valid"),
  ValidationMidleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("user id is not valid"),
];

exports.updateUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  check("password")
    .notEmpty()
    .withMessage("You must enter your current password"),
  check("newPasswordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm"),
  check("newPassword")
    .notEmpty()
    .withMessage("You must enter new password")
    .isLength({ min: 6 })
    .withMessage("too short password")
    .custom(async (val, { req }) => {
      const user = await userModel.findById(req.params.id);
      if (!user) {
        throw new AppError("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isCorrectPassword) {
        throw new AppError("Incorrect current password");
      }
      if (val !== req.body.newPasswordConfirm) {
        throw new AppError("Password Confirmation incorrect");
      }
      return true;
    }),
  ValidationMidleware,
];

exports.changeLoggedUserPasswordValidator = [
  check("password")
    .notEmpty()
    .withMessage("You must enter your current password"),
  check("newPasswordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm"),
  check("newPassword")
    .notEmpty()
    .withMessage("You must enter new password")
    .isLength({ min: 6 })
    .withMessage("too short password")
    .custom(async (val, { req }) => {
      const user = await userModel.findById(req.user._id);
      if (!user) {
        throw new AppError("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isCorrectPassword) {
        throw new AppError("Incorrect current password");
      }
      if (val !== req.body.newPasswordConfirm) {
        throw new AppError("Password Confirmation incorrect");
      }
      return true;
    }),
  ValidationMidleware,
];

exports.updateLoggedUservalidator = [
  check("name")
    .optional()
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
    .optional()
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
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("only EGY and Sa phone numbers are allowed"),
  check("image").optional(),
  ValidationMidleware,
];

exports.postFavoriteProductValidator = [
  check("product")
    .isMongoId()
    .withMessage("invalid product id")
    .custom(async (val) => {
      const data = await productModel.findById(val);
      if (!data) {
        throw new AppError("product not found", 404);
      }
      return true;
    }),
  ValidationMidleware,
];

exports.deleteFavoriteProductValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid product id")
    .custom(async (val) => {
      const data = await productModel.findById(val);
      if (!data) {
        throw new AppError("product not found", 404);
      }
      return true;
    }),
  ValidationMidleware,
];

exports.postAddressValidator = [
  check("alias").notEmpty().withMessage("Please enter address alias"),
  check("details").notEmpty().withMessage("Please enter address details"),
  check("city").notEmpty().withMessage("Please enter address city"),
  check("postalCode")
    .notEmpty()
    .withMessage("Please enter yout postal Code")
    .isPostalCode("any")
    .withMessage("invalid postal code"),
  ValidationMidleware,
];

exports.updateAddressValidator = [
  check("alias")
    .optional()
    .notEmpty()
    .withMessage("Please enter address alias"),
  check("details")
    .optional()
    .notEmpty()
    .withMessage("Please enter address details"),
  check("city").optional().notEmpty().withMessage("Please enter address city"),
  check("postalCode")
    .optional()
    .notEmpty()
    .withMessage("Please enter yout postal Code")
    .isPostalCode("any")
    .withMessage("invalid postal code"),
  ValidationMidleware,
];

exports.idCheack = [
  check("id").isMongoId().withMessage("invalid address id"),
  ValidationMidleware,
];
