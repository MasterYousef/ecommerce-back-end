const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/ValidationMidleware");
const idValidator = require("./cheackIdValidator");

exports.postCouponValidator = [
  check("name")
    .notEmpty()
    .withMessage("Coupon name is required")
    .isLength({ min: 5 })
    .withMessage("Coupon name is too short")
    .isLength({ max: 30 })
    .withMessage("Coupon name is too long"),
  check("discount")
    .notEmpty()
    .withMessage("coupon discount is required")
    .isNumeric()
    .withMessage("Coupon discount must be a number"),
  check("expire")
    .notEmpty()
    .withMessage("coupon expire date is required")
    .isDate()
    .withMessage("coupon expire date must be a date"),
  validatorMiddleware,
];

exports.UpdateCouponValidator = [
  idValidator("coupon"),
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Coupon name is required")
    .isLength({ min: 5 })
    .withMessage("Coupon name is too short")
    .isLength({ max: 30 })
    .withMessage("Coupon name is too long"),
  check("discount")
    .optional()
    .notEmpty()
    .withMessage("coupon discount is required")
    .isNumeric()
    .withMessage("Coupon discount must be a number"),
  check("expire")
    .optional()
    .notEmpty()
    .withMessage("coupon expire date is required")
    .isDate()
    .withMessage("coupon expire date must be a date"),
  validatorMiddleware,
];

exports.deleteCouponValidator = idValidator("coupon")

exports.getCouponValidator = idValidator("coupon")