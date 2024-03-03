const express = require("express");
const {
  postSubCategoryValidtor,
  deleteSubCategoryValidtor,
  getSubCategoryValidtor,
  updateSubCategoryValidtor,
  getSubCategorysValidtor,
} = require("../utils/validators/subCategoryValidator");
const {
  postSubCategory,
  getSubCategorys,
  getSubCategory,
  UpdateSubCategory,
  deleteSubCategory,
  createSubCategoryFilterObj,
} = require("../controllers/subCategoryController");
const { protect, permissions } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });
router
  .route("/")
  .post(protect, permissions("admin"), postSubCategoryValidtor, postSubCategory)
  .get(createSubCategoryFilterObj,getSubCategorysValidtor, getSubCategorys);
router
  .route("/:id")
  .get(getSubCategoryValidtor, getSubCategory)
  .put(
    protect,
    permissions("admin"),
    updateSubCategoryValidtor,
    UpdateSubCategory
  )
  .delete(
    protect,
    permissions("admin"),
    deleteSubCategoryValidtor,
    deleteSubCategory
  );
module.exports = router;
