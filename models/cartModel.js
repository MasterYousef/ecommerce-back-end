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
    coupon:String
  },
  { timestamps: true }
);

cartOption.pre(/^findOne/, function (next) {
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
      select: "name", // Adjust this according to the fields you need from 'brand'
    },
  });
  next();
});

module.exports = mongoose.model("cart", cartOption);
