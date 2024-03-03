const express = require("express");
const { permissions, protect } = require("../controllers/authController");
const couponValidator = require("../utils/validators/couponValidator");
const couponController = require("../controllers/couponController");

const router = express.Router();

router.use(protect, permissions("admin"));

router
  .route("/")
  .post(couponValidator.postCouponValidator, couponController.postCoupon)
  .get(couponController.getCoupons);

router
  .route("/:id")
  .get(couponValidator.getCouponValidator, couponController.getCoupon)
  .put(couponValidator.UpdateCouponValidator, couponController.UpdateCoupon)
  .delete(couponValidator.deleteCouponValidator, couponController.deleteCoupon);

module.exports = router;
