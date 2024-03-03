const { default: slugify } = require("slugify");
const { check } = require("express-validator");
const ValidationMidleware = require("../../middlewares/ValidationMidleware");
const AppError = require("../AppError");

exports.getBrandValidtor = [
  check("id").isMongoId().withMessage("invalid Brand id"),
  ValidationMidleware,
];
exports.postBrandValidtor = [
  check("name")
    .notEmpty()
    .withMessage("Brand name reqired")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    })
    .isLength({ min: 3 })
    .withMessage("Brand name is too short")
    .isLength({ max: 25 })
    .withMessage("Brand name is too long"),
  check("image").notEmpty().withMessage("brand image reqired").custom((val)=>{
    if(val.endsWith(".jpeg")=== false){
      throw new AppError('unavailable image format')
    }else{
      return true
    }
  }),
  ValidationMidleware,
];
exports.updateBrandValidtor = [
  check("id").isMongoId().withMessage("invalid Brand id"),
  check("name")
    .notEmpty()
    .withMessage("Brand name reqired")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    })
    .isLength({ min: 3 })
    .withMessage("Brand name is too short")
    .isLength({ max: 25 })
    .withMessage("Brand name is too long"),
    check("image").optional().notEmpty().withMessage("you must add a brand image").custom((val)=>{
      if(val.endsWith(".jpeg")=== false){
        throw new AppError('unavailable image format')
      }else{
        return true
      }
    }),
  ValidationMidleware,
];
exports.deleteBrandValidtor = [
  check("id").isMongoId().withMessage("invalid brand id"),
  ValidationMidleware,
];
