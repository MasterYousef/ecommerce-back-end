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
    res.status(200).json({
      status: "success",
      numOfCartItems: cart.productItems.length,
      message: "product added successfully",
    });
  } else {
    const productIndex = cart.productItems.findIndex(
      (item) =>
        item.product._id.toString() === req.body.product &&
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
    cart.coupon = undefined;
    cart.save();
    res.status(200).json({
      status: "success",
      numOfCartItems: cart.productItems.length,
      message: "product added successfully",
    });
  }
});

exports.getUserCart = expressAsyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    throw new AppError("user Cart not found", 404);
  }
  cartPriceCounter(cart);
  if (cart.coupon && cart.coupon.discount) {
    const discount = cart.coupon.discount;
    const num = cart.totalPrice * (discount / 100);
    cart.totalPriceAfterDiscount = num;
  }
  cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.productItems.length,
    data: cart,
  });
});

exports.updateQuantity = expressAsyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
    },
    { $set: { "productItems.$[elem].quantity": req.body.quantity } },
    {
      new: true,
      arrayFilters: [
        { "elem.product": req.params.id, "elem.color": req.body.color },
      ],
    }
  );
  if (!cart) {
    throw new AppError("product not found in cart", 404);
  }
  res
    .status(200)
    .json({
      status: "success",
      message: "quantity updated successfly",
      numOfCartItems: cart.productItems.length,
      data: cart,
    });
});

exports.deleteProductFromCart = expressAsyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        productItems: {
          product: req.params.id,
          color: req.body.color,
        },
      },
      totalPriceAfterDiscount: null,
      coupon: null,
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.productItems.length,
    message: "product deleted from cart",
  });
});

exports.DeleteUserCart = expressAsyncHandler(async (req, res, next) => {
  await cartModel.deleteOne({ user: req.user._id });
  res.status(204).send();
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
  cart.coupon = coupon._id;
  cart.save();
  res.status(200).json({
    status: "success",
    message: "coupon successfully avilabled",
    data: cart,
  });
});
