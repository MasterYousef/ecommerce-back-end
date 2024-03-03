const express = require("express");
const {
  postRating,
  getRating,
  getRatings,
  UpdateRating,
  deleteRating,
  createRatingFilterObj,
  setProductIdAndUserId,
} = require("../controllers/ratingController");
const ratingValidator = require("../utils/validators/ratingValidator");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });
router.get("/",createRatingFilterObj,getRatings);
router.use(authController.protect)
router.post("/",setProductIdAndUserId,ratingValidator.postRatingValidator, postRating)
router
  .route("/:id")
  .get(ratingValidator.getRatingValidator, getRating)
  .put(setProductIdAndUserId,ratingValidator.UpdateRatingValidator, UpdateRating)
  .delete(ratingValidator.deleteRatingValidator, deleteRating);

module.exports = router;
