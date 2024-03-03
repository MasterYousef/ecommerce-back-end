const express = require("express");
const {
  postBrand,
  getBrands,
  getBrand,
  UpdateBrand,
  deleteBrand,
  brandImg,
  resizeBrandsImage,
} = require("../controllers/brandController");
const {
  getBrandValidtor,
  postBrandValidtor,
  updateBrandValidtor,
  deleteBrandValidtor,
} = require("../utils/validators/brandValidator");
const { permissions, protect } = require("../controllers/authController");


const router = express.Router();
router
  .route("/")
  .post(
    protect,
    permissions("admin"),
    brandImg,
    resizeBrandsImage,
    postBrandValidtor,
    postBrand
  )
  .get(getBrands);
router
  .route("/:id")
  .get(getBrandValidtor, getBrand)
  .put(
    protect,
    permissions("admin"),
    brandImg,
    resizeBrandsImage,
    updateBrandValidtor,
    UpdateBrand
  )
  .delete(protect, permissions("admin"), deleteBrandValidtor, deleteBrand);
module.exports = router;
