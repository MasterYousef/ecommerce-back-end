const ratingModel = require("../models/ratingsModel");
const MainController = require("./mainControllers");

  exports.createRatingFilterObj = (req, res, next) => {
    let filterObject = {};
    if (req.params.productId) filterObject = { product: req.params.productId };
    req.filterObj = filterObject;
    next();
  };
  exports.setProductIdAndUserId = (req, res, next) => {
    if (req.params.productId ){
        req.body.product = req.params.productId;
    }
    if (req.user._id){
        req.body.user = req.user._id.toString();
    } 
    next();
  };

exports.getRatings = MainController.getAll(ratingModel);
exports.getRating = MainController.getOne(ratingModel);
exports.UpdateRating = MainController.updateOne(ratingModel);
exports.postRating = MainController.postOne(ratingModel);
exports.deleteRating = MainController.deleteOne(ratingModel);