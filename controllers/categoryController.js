const expressAsyncHandler = require("express-async-handler");
const categoryModel = require("../models/categoryModel");
const MainController = require("./mainControllers");
const { SingleImageHandler, resizeImages } = require("../middlewares/ImageMidleware");



exports.resizeCategoryImage = expressAsyncHandler(async (req, res, next) => resizeImages(req, res, next,'categories'));
exports.categoryImg = SingleImageHandler('image')
exports.getCategorys = MainController.getAll(categoryModel);
exports.getCategory = MainController.getOne(categoryModel);
exports.UpdateCategory = MainController.updateOne(categoryModel);
exports.postCategory = MainController.postOne(categoryModel);
exports.deleteCategory = MainController.deleteOne(categoryModel, "category");
