const expressAsyncHandler = require("express-async-handler");
const cartModel = require("../models/cartModel");
const AppError = require("../utils/AppError");
const couponModel = require("../models/couponModel");

const cartPriceCounter = (cart) => {
  let totalPrice = 0;
  cart.productItems.forEach((element) => {
    totalPrice += element.quantity * element.price;
  });
  cart.totalPrice = totalPrice;
};

exports.postproductToCart = expressAsyncHandler(async (req, res, next) => {
  let cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    cart = await cartModel.create({
      productItems: [
        {
          product: req.body.product,
          color: req.body.color,
          price: req.body.price,
        },
      ],
      user: req.user._id,
    });
    res
      .status(200)
      .json({ status: "success", message: "product added successfully" });
  } else {
    const productIndex = cart.productItems.findIndex(
      (item) =>
        item.product.toString() === req.body.product &&
        item.color === req.body.color
    );
    if (productIndex === -1) {
      cart.productItems.push({
        product: req.body.product,
        color: req.body.color,
        price: req.body.price,
      });
    } else {
      cart.productItems[productIndex].quantity += 1;
    }
    cartPriceCounter(cart);
    cart.totalPriceAfterDiscount = undefined;
    cart.save();
    res
      .status(200)
      .json({ status: "success", message: "product added successfully" });
  }
});

exports.getUserCart = expressAsyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    throw new AppError("user Cart not found", 404);
  }
  cartPriceCounter(cart);
  cart.save();
  res.status(200).json({ status: "success", data: cart });
});

exports.deleteProductFromCart = expressAsyncHandler(async (req, res, next) => {
  await cartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        productItems: {
          product: req.params.id,
        },
      },
      totalPriceAfterDiscount: undefined,
    }
  );

  res
    .status(200)
    .json({ status: "success", message: "product deleted from cart" });
});

exports.DeleteUserCart = expressAsyncHandler(async (req, res, next) => {
  await cartModel.deleteOne({ user: req.user._id });
  res.status(200).send();
});

exports.cartDiscount = expressAsyncHandler(async (req, res, next) => {
  const coupon = await couponModel.findOne({ name: req.body.coupon });
  if (!coupon) {
    throw new AppError("coupon not found", 404);
  }
  if (coupon.expire < Date.now()) {
    throw new AppError("coupon expired");
  }
  const cart = await cartModel.findOne({ user: req.user._id });
  cartPriceCounter(cart);
  cart.totalPriceAfterDiscount =
    cart.totalPrice - (coupon.discount / 100) * cart.totalPrice;
  cart.save();
  res.status(200).json({
    status: "success",
    message: "coupon successfully avilabled",
    data: cart,
  });
});
