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
  },
  { timestamps: true }
);

module.exports = mongoose.model("cart", cartOption);
