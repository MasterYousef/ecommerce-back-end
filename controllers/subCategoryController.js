const subCategoryModel = require("../models/subCategoryModel");
const MainController = require("./mainControllers");


exports.createSubCategoryFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};
exports.postSubCategory = MainController.postOne(subCategoryModel);
exports.getSubCategorys = MainController.getAll(subCategoryModel);
exports.getSubCategory = MainController.getOne(subCategoryModel);
exports.UpdateSubCategory = MainController.updateOne(subCategoryModel);
exports.deleteSubCategory = MainController.deleteOne(subCategoryModel);
