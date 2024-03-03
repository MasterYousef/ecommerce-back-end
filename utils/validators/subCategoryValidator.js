const { default: slugify } = require("slugify");
const { check } = require("express-validator");
const ValidationMidleware = require("../../middlewares/ValidationMidleware");
const category = require("../../models/categoryModel");
const AppError = require("../AppError");

exports.postSubCategoryValidtor = [
  check("name")
    .notEmpty()
    .withMessage("SubCategory name reqired")
    .isLength({ min: 3 })
    .withMessage("SubCategory name is too short")
    .isLength({ max: 25 })
    .withMessage("SubCategory name is too long")
    .custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
      }),
  check("category")
    .isMongoId()
    .withMessage("invalid category id")
    .custom(async (value) => {
      const data = await category.findById(value);
      if (!data) {
        throw new AppError("Invalid category ID ", 500);
      }
      return true;
    }),
  ValidationMidleware,
];
exports.getSubCategoryValidtor = [
  check("id").isMongoId().withMessage("invalid category id"),
  ValidationMidleware,
];
exports.getSubCategorysValidtor = [
  check("categoryId").optional().isMongoId().withMessage("invalid category id"),
  ValidationMidleware,
];
exports.updateSubCategoryValidtor = [
  check("name")
    .notEmpty()
    .withMessage("SubCategory name reqired")
    .custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
      })
    .isLength({ min: 3 })
    .withMessage("SubCategory name is too short")
    .isLength({ max: 25 })
    .withMessage("SubCategory name is too long"),
  check("category").isMongoId().withMessage("invalid category id"),
  check("id").isMongoId().withMessage("invalid subCategory id"),
  ValidationMidleware,
];
exports.deleteSubCategoryValidtor = [
  check("id").isMongoId().withMessage("invalid subCategory id"),
  ValidationMidleware,
];
