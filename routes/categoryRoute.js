const express = require("express");
const {
  postCategory,
  getCategorys,
  getCategory,
  UpdateCategory,
  deleteCategory,
  categoryImg,
  resizeCategoryImage,
} = require("../controllers/categoryController");
const {
  getCategoryValidtor,
  postCategoryValidtor,
  updateCategoryValidtor,
  deleteCategoryValidtor,
} = require("../utils/validators/categoryValidator");
const subCategoryRoute = require("./subCategoryRoute");
const { protect, permissions } = require("../controllers/authController");

const router = express.Router();
router
  .route("/")
  .post(
    protect,
    permissions("admin"),
    categoryImg,
    resizeCategoryImage,
    postCategoryValidtor,
    postCategory
  )
  .get(getCategorys);
router
  .route("/:id")
  .get(getCategoryValidtor, getCategory)
  .put(
    protect,
    permissions("admin"),
    categoryImg,
    resizeCategoryImage,
    updateCategoryValidtor,
    UpdateCategory
  )
  .delete(
    protect,
    permissions("admin"),
    deleteCategoryValidtor,
    deleteCategory
  );
router.use("/:categoryId/subCategory", subCategoryRoute);
module.exports = router;
