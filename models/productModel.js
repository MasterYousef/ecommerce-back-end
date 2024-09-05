const mongoose = require("mongoose");
const { imageModelOptions } = require("../middlewares/ImageMidleware");

const Option = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "name is required"],
      unique: [true, "name must be unique"],
      minlenght: [5, "too short product name"],
      maxlenght: [30, "the long product name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "name is required"],
      minlenght: [5, "too short product name"],
      maxlenght: [500, "too long product name"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      trim: true,
      max: [200000, "Too long product price"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors:{
      type: [String],
      required:[true,"product must have a color"],
    },
    imageCover: {
      type: String,
      required: [true, "Product Image cover is required"],
    },
    images:[String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      required: [true, "Product must be belong to category"],
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "subCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "brand",
    },
    ratingsAverage: {
      default:0,
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
imageModelOptions(Option, "products");

Option.virtual("ratings", {
  ref: "rating",
  foreignField: "product",
  localField: "_id",
});
Option.pre(/^findOne/, function (next) {
  this.populate({
    path: "category",
    select: "name _id",
  });
  this.populate({
    path: "ratings",
    select: "-user",
  });
    this.populate({
      path: 'subcategories',
      select: 'name _id', 
    });
  next();
});

const productModel = mongoose.model("product", Option);

module.exports = productModel;
