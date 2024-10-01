const { default: mongoose } = require("mongoose");

const cartOption = mongoose.Schema(
  {
    productItems: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: "product" },
        color: String,
        price: Number,
        _id: false,
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    user: { type: mongoose.Schema.ObjectId, ref: "user" },
    totalPrice: Number,
    totalPriceAfterDiscount: Number,
    coupon: { ref: "coupon", type: String },
  },
  { timestamps: true }
);

cartOption.pre(/^findOne/, function (next) {
  this.populate({
    path: "coupon",
  });

  this.populate({
    path: "productItems.product",
    select: "imageCover category brand",
    populate: {
      path: "category",
      select: "name",
    },
  });

  this.populate({
    path: "productItems.product",
    select: "imageCover category brand",
    populate: {
      path: "brand",
      select: "name",
    },
  });
  next();
});
module.exports = mongoose.model("cart", cartOption);
