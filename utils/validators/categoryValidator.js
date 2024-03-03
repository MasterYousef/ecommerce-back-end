const { default: slugify } = require("slugify");
const { check } = require("express-validator");
const ValidationMidleware = require("../../middlewares/ValidationMidleware");
const AppError = require("../AppError");

exports.getCategoryValidtor = [
  check("id").isMongoId().withMessage("invalid category id"),
  ValidationMidleware,
];
exports.postCategoryValidtor = [
  check("name")
    .notEmpty()
    .withMessage("category name reqired")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    })
    .isLength({ min: 3 })
    .withMessage("category name is too short")
    .isLength({ max: 25 })
    .withMessage("category name is too long"),
  check("image")
    .notEmpty()
    .withMessage("category image reqired"),
  ValidationMidleware,
];
exports.updateCategoryValidtor = [
  check("id")
    .isMongoId()
    .withMessage("invalid category id")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("name").optional().notEmpty().withMessage("category name reqired"),
  check("image")
    .optional()
    .notEmpty()
    .withMessage("you must add a category image")
    .custom((val) => {
      if (val.endsWith(".jpeg") === false) {
        throw new AppError("unavailable image format");
      } else {
        return true;
      }
    }),
  ValidationMidleware,
];
exports.deleteCategoryValidtor = [
  check("id").isMongoId().withMessage("invalid category id"),
  ValidationMidleware,
];
