const expressAsyncHandler = require("express-async-handler");
const productModel = require("../models/productModel");
const MainController = require("./mainControllers");
const { MultiImagesHandler, resizeMultiImages } = require("../middlewares/ImageMidleware");

const fields = [
  {name: "imageCover",maxCount:1},
  {name: "images",maxCount:6}
]
exports.resizeProductImage = expressAsyncHandler(async (req, res, next) =>
resizeMultiImages(req, res, next, "products")
);
exports.productsImages = MultiImagesHandler(fields)
exports.postproduct = MainController.postOne(productModel);

exports.getproducts = MainController.getAll(productModel, "product");

exports.getproduct = MainController.getOne(productModel);

exports.Updateproduct = MainController.updateOne(productModel);

exports.deleteproduct = MainController.deleteOne(productModel);
