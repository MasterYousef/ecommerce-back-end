const expressAsyncHandler = require("express-async-handler");
const  MainController  = require("./mainControllers");
const brandModel = require("../models/brandModel");
const { SingleImageHandler, resizeImages } = require("../middlewares/ImageMidleware");

exports.resizeBrandsImage = expressAsyncHandler(async (req, res, next) => resizeImages(req, res, next,'brands'));
exports.brandImg = SingleImageHandler('image')
exports.getBrands = MainController.getAll(brandModel)
exports.getBrand = MainController.getOne(brandModel)
exports.UpdateBrand = MainController.updateOne(brandModel)
exports.postBrand = MainController.postOne(brandModel)
exports.deleteBrand = MainController.deleteOne(brandModel)