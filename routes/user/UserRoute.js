const express = require("express");
const {
  userRegisterCtrl,
  userLoginCtrl,
  updatePasswordCtrl,
  forgotPasswordCtrl,
  resetPasswordCtrl,
  profilePhotoUploadCtrl,
  usersCtrl,
  userProfileCtrl,
} = require("../../controllers/users/userCtrl");
const isAdmin = require("../../middlewares/isAdmin");
const isLogin = require("../../middlewares/isLogin");
const userRouter = express.Router();

const storage = require("../../config/cloudinary");
const multer = require("multer");
// const userRouter = express.Router();
//instance of multer
const upload = multer({ storage });

//POST/api/v1/users/register
userRouter.post("/register", userRegisterCtrl);

//Get all users
userRouter.get("/", usersCtrl);

//GET/api/v1/users
userRouter.get("/profile", isLogin, userProfileCtrl);

//POST/api/v1/users/login
userRouter.post("/login", userLoginCtrl);

userRouter.post(
  "/profile-photo-upload",
  isLogin,
  upload.single("profile"),
  profilePhotoUploadCtrl
);

//PUT/api/v1/users/updatePassword
userRouter.put("/updatePassword", updatePasswordCtrl);

userRouter.post("/profile-photo-upload",isLogin, profilePhotoUploadCtrl);

userRouter.post('/forgotPassword', forgotPasswordCtrl);
userRouter.post('/resetPassword', resetPasswordCtrl);

module.exports = userRouter;