const { check } = require("express-validator");
const ValidationMidleware = require("../../middlewares/ValidationMidleware");
const AppError = require("../AppError");
const productModel = require("../../models/productModel");
const ratingModel = require("../../models/ratingsModel");

exports.postRatingValidator = [
  check("title").optional().notEmpty().withMessage("please write your comment"),
  check("rating")
    .notEmpty()
    .withMessage("rating is required")
    .isNumeric()
    .withMessage("rating must be a number")
    .custom((value) => {
      if (value < 1 || value > 5) {
        throw new Error("Rating must be between 1 and 5");
      }
      return true;
    }),
  check("user")
    .isMongoId()
    .withMessage("user id not valid")
    .notEmpty()
    .withMessage("rating must belong to user"),
  check("product")
    .isMongoId()
    .withMessage("product id not valid")
    .notEmpty()
    .withMessage("rating must belong to product")
    .custom(async (val) => {
      const user = await productModel.findById(val);
      if (!user) {
        throw new AppError("product not found", 400);
      }
      return true;
    }),
  ValidationMidleware,
];

exports.getRatingValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  ValidationMidleware,
];

exports.deleteRatingValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom(async (val, { req }) => {
      const data = await ratingModel.findById(val);
      if (!data) {
        throw new AppError("no rating for this id", 400);
      }
      if (data.user._id.toString() !== req.user._id.toString()) {
        throw new AppError("you are not the owner of this rating", 400);
      }
    }),
  ValidationMidleware,
];

exports.UpdateRatingValidator = [
  check("title").optional().notEmpty().withMessage("please write your comment"),
  check("id")
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom(async (val, { req }) => {
      const data = await ratingModel.findById(val);
      if (!data) {
        throw new AppError("user not found", 400);
      }
      if (data.user._id.toString() !== req.user._id.toString()) {
        throw new AppError("you are not the owner of this rating", 400);
      }
    }),
  check("rating")
    .optional()
    .notEmpty()
    .withMessage("rating is required")
    .isNumeric()
    .withMessage("rating must be a number")
    .custom((value) => {
      if (value < 1 || value > 5) {
        throw new Error("Rating must be between 1 and 5");
      }
      return true;
    }),
  check("user")
    .optional()
    .isMongoId()
    .withMessage("user id not valid")
    .notEmpty()
    .withMessage("rating must belong to user"),
  check("product")
    .optional()
    .isMongoId()
    .withMessage("product id not valid")
    .notEmpty()
    .withMessage("rating must belong to product")
    .custom(async (val) => {
      const user = await productModel.findById(val);
      if (!user) {
        throw new AppError("product not found", 400);
      }
      return true;
    }),
  ValidationMidleware,
];
