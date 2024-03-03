const express = require("express");
const {
  signUpValidator,
  loginValidator,
  forgtenPasswordvalidator,
  resetCodeValidator,
  resetPasswordValidator,
} = require("../utils/validators/authValidator");
const {
  signup,
  login,
  forgotenpassword,
  resetCode,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();
router.post("/signUp", signUpValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotenpassword", forgtenPasswordvalidator, forgotenpassword);
router.post("/resetCode", resetCodeValidator, resetCode);
router.post("/resetPassword", resetPasswordValidator, resetPassword);
module.exports = router;
