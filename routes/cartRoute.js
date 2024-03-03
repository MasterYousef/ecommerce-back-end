const express = require("express");
const { permissions, protect } = require("../controllers/authController");
const cartValidator = require("../utils/validators/cartValidator");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.use(protect, permissions("user"));

router
  .route("/")
  .post(
    cartValidator.postProductToCartValidator,
    cartController.postproductToCart
  )
  .get(cartController.getUserCart)
  .delete(cartController.DeleteUserCart);

router.delete(
  "/:id",
  cartValidator.deleteProductFromCartValidator,
  cartController.deleteProductFromCart
);

router.post("/couponDiscount", cartValidator.cartDiscountValidator, cartController.cartDiscount)
module.exports = router;