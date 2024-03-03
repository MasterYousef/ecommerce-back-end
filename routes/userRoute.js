const express = require("express");
const userController = require("../controllers/userController");
const userValidator = require("../utils/validators/userValidator");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.get(
  "/getLoggedUser",
  userController.getLoggedUserData,
  userController.getUser
);

router.put(
  "/updateLoggedUserPassword",
  userValidator.changeLoggedUserPasswordValidator,
  userController.updateLoggedUserPassword
);

router.put(
  "/updateLoggedUserData",
  userController.userImg,
  userController.resizeUserImage,
  userValidator.updateLoggedUservalidator,
  userController.updateLoggedUserData
);

router.delete(
  "/deactiveLoggedUser",
  userValidator.deleteUserValidator,
  userController.deactiveLoggedUser
);

router
  .route("/favoriteList")
  .post(
    userValidator.postFavoriteProductValidator,
    userController.postFavoriteProduct
  )
  .get(userController.getUserFavoriteList);

router.delete(
  "/favoriteList/:id",
  userValidator.deleteFavoriteProductValidator,
  userController.deleteFavoriteProduct
);

router
  .route("/userAddresses")
  .post(userValidator.postAddressValidator, userController.postAddress)
  .get(userController.getUserAddresses);
router

  .route("/userAddresses/:id")
  .delete(userValidator.deleteAddressValidator, userController.deleteAddress)
  .put(userValidator.updateAddressValidator, userController.updateAddress);
router.use(authController.permissions("admin"));

router
  .route("/")
  .post(
    userController.userImg,
    userController.resizeUserImage,
    userValidator.createUserValidator,
    userController.postUser
  )
  .get(userController.getUsers);

router
  .route("/:id")
  .get(userValidator.getUserValidator, userController.getUser)
  .put(
    userController.userImg,
    userController.resizeUserImage,
    userValidator.updateUservalidator,
    userController.UpdateUser
  )
  .delete(userValidator.deleteUserValidator, userController.deleteUser);

router
  .route("/changePassword/:id")
  .put(
    userValidator.updateUserPasswordValidator,
    userController.UpdateUserPassword
  );

module.exports = router;
