const { check } = require("express-validator");
const productModel = require("../../models/productModel");
const validatorMiddleware = require("../../middlewares/ValidationMidleware");
const AppError = require("../AppError");
const idValidator = require("./cheackIdValidator");

exports.postProductToCartValidator = [
  check("product")
    .notEmpty()
    .withMessage("please select a product")
    .custom(async(product, { req }) => {
      const data = await productModel.findById(product);
      if (!data) {
        throw new AppError("Product not found", 404);
      }
      req.body.price = data.price;
      return true
    }),
  check("color").notEmpty().withMessage("Product color required"),
  validatorMiddleware,
];

exports.deleteProductFromCartValidator = idValidator("product");

exports.cartDiscountValidator = [
  check("coupon")
    .notEmpty()
    .withMessage("coupon name is required")
    .isLength({ min: 5, max: 30 })
    .withMessage("minemum length is 5 and maxemum length is 30"),
    validatorMiddleware
];
