const express = require("express");
const { permissions, protect } = require("../controllers/authController");
const orderValidator = require("../utils/validators/orderValidator");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.post("/webhook",express.raw({ type: 'application/json' }),orderController.webhookCheckout)

router.use(protect);

router
  .route("/:id")
  .post(
    permissions("user"),
    orderValidator.createOrderValidator,
    orderController.createtOrder
  )
  .delete(
    permissions("admin"),
    orderValidator.deleteOrderValidator,
    orderController.deleteOrder
  );

router.put(
  "/setIsPaid/:id",
  permissions("admin"),
  orderValidator.updateIsPaidValidator,
  orderController.updateIsPaid
);

router.put(
  "/setIsDelivered/:id",
  permissions("admin"),
  orderValidator.updateisDeliveredValidator,
  orderController.updateisDelivered
);

router.get(
  "/",
  permissions("user", "admin"),
  orderController.orderPermission,
  orderController.getOrders
);

router.post("/checkout/session",permissions("user"), orderController.checkoutSession)
module.exports = router;
