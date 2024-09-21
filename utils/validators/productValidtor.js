const slugify = require("slugify");
const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/ValidationMidleware");
const subCategory = require("../../models/subCategoryModel");
const AppError = require("../AppError");
const category = require("../../models/categoryModel");
const idValidator = require("./cheackIdValidator");

exports.postProductValidator = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Product required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 500 })
    .withMessage("Too long description"),
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 32 })
    .withMessage("To long price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new AppError("priceAfterDiscount must be lower than price", 500);
      }
      return true;
    }),
  check("colors").notEmpty().withMessage("product must have a color"),
  check("imageCover").notEmpty().withMessage("Product imageCover is required"),
  check("images").optional().notEmpty().withMessage("add one image at latest"),
  check("category")
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom(async (value) => {
      const data = await category.findById(value);
      if (!data) {
        throw new AppError("Invalid category ID ", 500);
      }
      return true;
    }),
  check("subcategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategories ID formate")
    .custom((subcategoriesId) =>
      subCategory
        .find({ _id: { $exists: true, $in: subcategoriesId } })
        .then((result) => {
          if (result.length < 1) {
            return Promise.reject(new AppError(`Invalid subcategories Id`));
          }
          if (
            Array.isArray(subcategoriesId) &&
            result.length !== subcategoriesId.length
          ) {
            return Promise.reject(new AppError(`Invalid subcategories Id`));
          }
        })
    )
    .custom(async (subcategoriesIds, { req }) => {
      const subcategories = await subCategory.find({
        category: req.body.category,
      });
      const data = [];
      subcategories.forEach((element) => {
        data.push(`${element._id}`);
      });
      if (Array.isArray(subcategoriesIds)) {
        if (subcategoriesIds.every((v) => data.includes(v)) === false) {
          throw new AppError(` subcategories not belong to category`);
        }
      } else if (data.includes(subcategoriesIds) === false) {
        throw new AppError(` subcategories not belong to category`);
      }
    }),
  validatorMiddleware,
];
exports.getProductValidator = idValidator("product");

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Product required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("description")
    .optional()
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 500 })
    .withMessage("Too long description"),
  check("quantity")
    .optional()
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("price")
    .optional()
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 32 })
    .withMessage("To long price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new AppError("priceAfterDiscount must be lower than price", 500);
      }
      return true;
    }),
  check("colors").optional().notEmpty().withMessage("add one color at latest"),
  check("images").optional().notEmpty().withMessage("add one image at latest"),
  check("category")
    .optional()
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom(async (value) => {
      const data = await category.findById(value);
      if (!data) {
        throw new AppError("Invalid category ID ", 500);
      }
      return true;
    }),
  check("subcategories")
    .optional()
    .custom((subcategoriesId) => {
      if (subcategoriesId !== "none") {
        subCategory
          .find({ _id: { $exists: true, $in: subcategoriesId } })
          .then((result) => {
            if (result.length < 1) {
              return Promise.reject(new AppError(`Invalid subcategories Id`));
            }
            if (
              Array.isArray(subcategoriesId) &&
              result.length !== subcategoriesId.length
            ) {
              return Promise.reject(new AppError(`Invalid subcategories Id`));
            }
          });
        return true;
      }
      return true;
    })
    .custom(async (subcategoriesIds, { req }) => {
      if (subcategoriesIds !== "none") {
        const data = [];
        const subcategories = await subCategory.find({
          category: req.body.category,
        });
        if (subcategories.length <= 0) {
          throw new AppError("can't find category");
        }
        subcategories.forEach((element) => {
          data.push(`${element._id}`);
        });
        if (Array.isArray(subcategoriesIds)) {
          if (subcategoriesIds.every((v) => data.includes(v)) === false) {
            throw new AppError(`subcategories not belong to category`);
          }
        } else if (!data.includes(subcategoriesIds)) {
          throw new AppError(` subcategories not belong to category`);
        }
        return true;
      }
      return true;
    }),
  check("imageCover").optional().notEmpty().withMessage("image cover reqired"),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
];
