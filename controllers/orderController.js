// eslint-disable-next-line import/newline-after-import
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const expressAsyncHandler = require("express-async-handler");
const Stripe = require("stripe")(process.env.stripe_secret);
const MainController = require("./mainControllers");
const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const AppError = require("../utils/AppError");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");

exports.getOneOrder = MainController.getOne(orderModel)

exports.createtOrder = expressAsyncHandler(async (req, res, next) => {
  let taxPrice = 0;
  let shippingPrice = 0;
  const checkAddress = req.user.addresses.findIndex(
    (item) => item._id.toString() === req.body.shippingAddress
  );
  if (checkAddress === -1) {
    throw new AppError("invalid shipping address", 400);
  }
  const cart = await cartModel.findById(req.params.id);
  if (!cart) {
    throw new AppError("user cart not found", 404);
  }
  const totalprice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  req.body.shippingAddress = req.user.addresses[checkAddress];
  const order = await orderModel.create({
    user: req.user._id,
    cartItems: cart.productItems,
    totalOrderPrice: totalprice + taxPrice + shippingPrice,
    shippingAddress: req.body.shippingAddress,
  });
  if (!order) {
    throw new AppError("order not created", 500);
  }
  const operations = order.cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: {
        $inc: { quantity: -item.quantity, sold: +item.quantity },
      },
    },
  }));
  productModel.bulkWrite(operations, {});
  await cartModel.findByIdAndDelete(cart._id);
  res.status(201).json({ status: "success", data: order });
});

exports.orderPermission = expressAsyncHandler((req, res, next) => {
  if (req.user.role === "user") {
    req.filterObj = { user: req.user._id };
  }
  next();
});

exports.getOrders = MainController.getAll(orderModel);

exports.updateIsPaid = expressAsyncHandler(async (req, res, next) => {
  const data = await orderModel.findByIdAndUpdate(
    req.params.id,
    { isPaid: true, paidAt: Date.now() },
    { new: true }
  );
  res
    .status(200)
    .json({ status: "success", message: "your order has been updated", data });
});

exports.updateisDelivered = expressAsyncHandler(async (req, res, next) => {
  const data = await orderModel.findByIdAndUpdate(
    req.params.id,
    { isDelivered: true, deliveredAt: Date.now() },
    { new: true }
  );
  res
    .status(200)
    .json({ status: "success", message: "your order has been updated", data });
});

exports.deleteOrder = MainController.deleteOne(orderModel);

exports.checkoutSession = expressAsyncHandler(async (req, res, next) => {
  const frontendUrl = req.get('Origin') || req.get('Referer');
  const checkAddress = req.user.addresses.findIndex(
    (item) => item._id.toString() === req.body.shippingAddress
  );
  if (checkAddress === -1) {
    throw new AppError("invalid shipping address", 400);
  }
  req.body.shippingAddress = req.user.addresses[checkAddress];
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    throw new AppError("user cart not found", 404);
  }
  const totalprice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  const address = {
    alias: req.body.shippingAddress.alias,
    details: req.body.shippingAddress.details,
    city: req.body.shippingAddress.city,
    postalCode: req.body.shippingAddress.postalCode,
  };
  const items = {};
  cart.productItems.forEach((element, index) => {
    const simplifiedElement = {
      product: element.product.toString(),
      quantity: element.quantity.toString(),
      color: element.color.toString(),
      price: element.price.toString(),
    };
    items[`value_${index}`] = JSON.stringify(simplifiedElement);
  });
  const session = await Stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalprice * 100,
          product_data: {
            name: req.user.name,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: req.user.email,
    client_reference_id: cart._id.toString(),
    metadata: {
      ...items,
      shippingAddress: JSON.stringify(address),
    },
    success_url: `${frontendUrl}/user/allorders`,
    cancel_url: `${frontendUrl}/Cart`,
  });
  res.status(200).json({
    status: "success",
    data: session,
  });
});

exports.webhookCreateOrder = async (session) => {
  const cartId = session.client_reference_id;
  const userEmail = session.customer_email;
  const shippingAddress = JSON.parse(session.metadata.shippingAddress);
  delete session.metadata.shippingAddress;
  const cartItems = Object.entries(session.metadata).map(([value, key]) =>
    JSON.parse(key)
  );
  const totalOrderPrice = session.amount_total / 100;
  const user = await userModel.findOne({ email: userEmail });
  if (!user) {
    throw new AppError("user not found", 404);
  }
  await orderModel.create({
    user: user._id,
    cartItems,
    totalOrderPrice,
    shippingAddress,
    paymentMethodType: "card",
    isPaid: true,
    paidAt: Date.now(),
  });
  await cartModel.findByIdAndDelete(cartId);
};