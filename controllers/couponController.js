const  MainController  = require("./mainControllers");
const couponModel = require("../models/couponModel");

exports.getCoupons = MainController.getAll(couponModel)
exports.getCoupon = MainController.getOne(couponModel)
exports.UpdateCoupon = MainController.updateOne(couponModel)
exports.postCoupon = MainController.postOne(couponModel)
exports.deleteCoupon = MainController.deleteOne(couponModel)