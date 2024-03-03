const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const MainController = require("./mainControllers");
const {
  SingleImageHandler,
  resizeImages,
} = require("../middlewares/ImageMidleware");
const userModel = require("../models/userModel");
const AppError = require("../utils/AppError");
const createToken = require("../utils/createToken");

exports.resizeUserImage = expressAsyncHandler(async (req, res, next) =>
  resizeImages(req, res, next, "users")
);
exports.userImg = SingleImageHandler("image");
exports.getUsers = MainController.getAll(userModel);
exports.getUser = MainController.getOne(userModel);
exports.UpdateUser = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      image: req.body.image,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!data) {
    return next(new AppError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ data });
});
exports.postUser = MainController.postOne(userModel);
exports.deleteUser = MainController.deleteOne(userModel, "category");
exports.resizeUserImage = expressAsyncHandler(async (req, res, next) =>
  resizeImages(req, res, next, "users")
);
exports.userImg = SingleImageHandler("image");
exports.getUsers = MainController.getAll(userModel);
exports.getUser = MainController.getOne(userModel);
exports.UpdateUserPassword = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.newPassword, 10),
      passwordChangeAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!data) {
    return next(new AppError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ data });
});

exports.getLoggedUserData = expressAsyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.updateLoggedUserPassword = expressAsyncHandler(
  async (req, res, next) => {
    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        password: await bcrypt.hash(req.body.newPassword, 10),
        passwordChangedAt: Date.now(),
      },
      {
        new: true,
      }
    );
    const token = createToken(user._id);
    res.status(200).json({ data: user, token });
  }
);

exports.updateLoggedUserData = expressAsyncHandler(async (req, res, next) => {
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.body.image,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});

exports.deactiveLoggedUser = expressAsyncHandler(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "Success" });
});

exports.postFavoriteProduct = expressAsyncHandler(async (req, res, next) => {
  await userModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { favorites: req.body.product } },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Product added successfully to your favorite List.",
  });
});

exports.deleteFavoriteProduct = expressAsyncHandler(async (req, res, next) => {
  await userModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { favorites: req.params.id } },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Product deleted successfully from your favorite List.",
  });
});

exports.getUserFavoriteList = expressAsyncHandler(async (req, res, next) => {
  const data = await userModel.findById(req.user._id).populate("favorites");
  res.status(200).json({
    status: "success",
    resault: data.favorites.length,
    favoriteList: data.favorites,
  });
});

exports.postAddress = expressAsyncHandler(async (req, res, next) => {
  await userModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { addresses: req.body } }
  );
  res.status(200).json({
    status: "success",
    message: "address added successfully to your acount.",
  });
});

exports.deleteAddress = expressAsyncHandler(async (req, res, next) => {
  await userModel.findByIdAndUpdate(
    req.user._id,
    { $set: { addresses: {_id:req.params.id} } }
  );
  res.status(200).json({
    status: "success",
    message: "address deleted successfully from your acount.",
  });
});

exports.updateAddress = expressAsyncHandler(async (req, res, next) => {
  let updateOps = {};

 Object.entries(req.body).forEach(([key, value]) => {
  updateOps[`addresses.$[elem].${key}`] = value;
});
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    { $set: updateOps },
    {
      new: true,
      arrayFilters: [{ "elem._id": req.params.id }]
    }
  );

  if (!updatedUser) {
    return next(new AppError("User not found or address not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Address updated successfully.",
    data: updatedUser.addresses
  });
});


exports.getUserAddresses = expressAsyncHandler(async (req, res, next) => {
  const data = await userModel.findById(req.user._id).populate("addresses");
  res.status(200).json({
    status: "success",
    resault: data.addresses.length,
    addresses: data.addresses,
  });
});
