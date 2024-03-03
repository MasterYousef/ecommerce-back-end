const categoryRoute = require("../routes/categoryRoute");
const brandRoute = require("../routes/brandRoute");
const subCategory = require("../routes/subCategoryRoute");
const productRoute = require("../routes/productRoute");
const userRoute = require("../routes/userRoute");
const authRoute = require("../routes/authRoute");
const ratingRoute = require("../routes/ratingRoute");
const couponRoute = require("../routes/couponRoute");
const cartRoute = require("../routes/cartRoute");
const orderRoute = require("../routes/orderRoute");

const serverRoutes = (app)=>{
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/brand", brandRoute);
app.use("/api/v1/subCategory",subCategory);
app.use("/api/v1/product",productRoute);
app.use("/api/v1/user",userRoute);
app.use("/api/v1/auth",authRoute);
app.use("/api/v1/rating",ratingRoute);
app.use("/api/v1/coupons",couponRoute);
app.use("/api/v1/cart",cartRoute);
app.use("/api/v1/order",orderRoute);
}
module.exports = serverRoutes;