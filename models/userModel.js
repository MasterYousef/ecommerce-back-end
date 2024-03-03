const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { imageModelOptions } = require("../middlewares/ImageMidleware");

const userOption = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      unique: [true, "name must be unique"],
      minlenght: [3, "too short user name"],
      maxlenght: [25, "the long user name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "user email is required"],
    },
    password: {
      type: String,
      required: [true, "user password is required"],
      minlenght: [6, "too short user password"],
    },
    phone: {
      type: String,
    },
    image: {
      type: String,
      default: "default_user.jpeg",
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    favorites:[
      {
        type: mongoose.Schema.ObjectId,
        ref: "product",
      }
    ],
    addresses: [
      {
        id:{ type: mongoose.Schema.Types.ObjectId },
        alias:{type:String,required:[true,"address alias is required"]},
        details:{type:String,required:[true,"address details is required"]},
        city:{type:String,required:[true,"address city is required"]},
        postalCode:{type:Number,required:[true,"address postal Code is required"]},
      },
    ],
    passwordChangeAt:String,
    resetCode:String,
    expireResetcode:Number,
    verifyPassword:Boolean,
    active:Boolean,
  },
  { timestamps: true }
);
userOption.pre('save', async function (next) {
    if (this.isModified('password')){
      this.password = await bcrypt.hash(this.password, 10);
      next();
    }else if(this.isModified('newPassword')){
      this.newPassword = await bcrypt.hash(this.password, 10);
      next();
    }
next()
  });
imageModelOptions(userOption, "users");
const userModel = mongoose.model("user", userOption);
module.exports = userModel;
