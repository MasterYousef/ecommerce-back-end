const express = require("express");
const ratingRoute = require("./ratingRoute")
const {
  postProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidtor");
const {
  postproduct,
  getproducts,
  getproduct,
  Updateproduct,
  deleteproduct,
  productsImages,
  resizeProductImage,
} = require("../controllers/productController");
const { protect, permissions } = require("../controllers/authController");

const router = express.Router();
router
  .route("/")
  .post(
    protect,
    permissions("admin"),
    productsImages,
    resizeProductImage,
    postProductValidator,
    postproduct
  )
  .get(getproducts);
router
  .route("/:id")
  .get(getProductValidator, getproduct)
  .put(
    protect,
    permissions("admin"),
    productsImages,
    resizeProductImage,
    updateProductValidator,
    Updateproduct
  )
  .delete(protect, permissions("admin"), deleteProductValidator, deleteproduct);
router.use('/:productId/rating',ratingRoute)
module.exports = router;
