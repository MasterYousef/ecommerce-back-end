const mongoose = require("mongoose");
const productModel = require("./productModel");

const ratingOption = mongoose.Schema(
  {
    title: {
      type: String,
      minlenght: [2, "too short comment "],
      maxlenght: [50, "the long comment"],
    },
    rating: {
      type: Number,
      required: [true, "rating is required"],
      min: [1.0, "too short rating "],
      max: [5, "the long rating"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "user is required"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
      required: [true, "product is required"],
    },
  },
  { timestamps: true }
);
ratingOption.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name image _id",
  });
  next();
});

ratingOption.statics.calcAverageRatingsAndQuantity = async function (
  productId
) {
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "product",
        avgRatings: { $avg: "$rating" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};
ratingOption.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

ratingOption.post("findOneAndDelete", async (doc) => {
  await doc.constructor.calcAverageRatingsAndQuantity(doc.product);
});
const ratingModel = mongoose.model("rating", ratingOption);

module.exports = ratingModel;
