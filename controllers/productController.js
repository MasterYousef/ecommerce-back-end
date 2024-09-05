const fs = require("fs");
const expressAsyncHandler = require("express-async-handler");
const productModel = require("../models/productModel");
const MainController = require("./mainControllers");
const { MultiImagesHandler, resizeMultiImages } = require("../middlewares/ImageMidleware");

const fields = [
  {name: "imageCover",maxCount:1},
  {name: "images",maxCount:6}
]
exports.resizeProductImage = expressAsyncHandler(async (req, res, next) =>
resizeMultiImages(req, res, next, "products")
);
exports.productsImages = MultiImagesHandler(fields)
exports.postproduct = MainController.postOne(productModel);

exports.getproducts = MainController.getAll(productModel, "product");

exports.getproduct = MainController.getOne(productModel);

exports.Updateproduct = expressAsyncHandler(async(req,res,next)=>{
  const product = await productModel.findById(req.params.id)
  if(!product) return res.status(404).json({message: "Product not found"})
if(Array.isArray(product.images) && req.body.images){
  req.body.imageCover = req.body.images[0]
  product.images.forEach((e)=>{
    if(!req.body.images.includes(e)){
      if(e.startsWith(`http://${process.env.BASE_URL}/`)){
      const image = e.replace(`http://${process.env.BASE_URL}/`, "");
        fs.unlinkSync(`uploads/${image}`)
      }
    }
  })
}else if(req.body.images){
  req.body.imageCover = req.body.images
}
  Object.entries(req.body).forEach(([k,v])=>{
    if(k === "subcategories" && v === "none"){
       product[k] = []
    }else{
      product[k] = v
    }
  })
  await product.save()
  res.status(200).json({message:"product updated successfly"})
})
exports.deleteproduct = MainController.deleteOne(productModel);
