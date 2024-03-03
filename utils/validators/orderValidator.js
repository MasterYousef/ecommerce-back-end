const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/ValidationMidleware");
const idValidator = require("./cheackIdValidator");

exports.createOrderValidator = [
  idValidator(),
  check("shippingAddress")
    .notEmpty()
    .withMessage("Please enter a shipping address")
    .isMongoId()
    .withMessage("shipping address id not valid"),
  validatorMiddleware,
];

exports.updateIsPaidValidator = idValidator();

exports.updateisDeliveredValidator = idValidator();

exports.deleteOrderValidator = idValidator();
