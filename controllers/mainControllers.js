const expressAsyncHandler = require("express-async-handler");
const ApiFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/AppError");
const subCategoryModel = require("../models/subCategoryModel");

exports.postOne = (Model) =>
  expressAsyncHandler(async (req, res) => {
    const data = await Model.create(req.body);
    res.status(201).json({ data: data });
  });
exports.getAll = (Model, modelName) =>
  expressAsyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    const apiFeatures = new ApiFeatures(Model,Model.find(filter), req.query)
      .filterAndSearch(modelName)
      .sort()
      .limitFields();

    const totalResults = await apiFeatures.count
    apiFeatures.paginate(totalResults)
    const data = await apiFeatures.mongooseQuery;    
    const { paginationResult } = apiFeatures;
    res.status(201).json({ results: data.length,totalResults , paginationResult, data });
  });
exports.getOne = (Model) =>
  expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const data = await Model.findById(id);
    if (!data) {
      return next(new AppError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ data });
  });
exports.deleteOne = (Model, type) =>
  expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const data = await Model.findByIdAndDelete(id);
    if (type === "category") {
      await subCategoryModel.deleteMany({ category: id });
    }
    if (!data) {
      return next(new AppError(`No document for this id ${id}`, 404));
    }
    res.status(204).send();
  });
exports.updateOne = (Model) =>
  expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!data) {
      return next(new AppError(`No document for this id ${id}`, 404));
    }
    data.save();
    res.status(200).json({ data });
  });
