const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const storage = require("../../config/cloudinary");
const User = require("../../models/users/User");
const { appErr, AppErr } = require("../../utils/appErr");
const generateToken = require("../../utils/generateToken");
const getTokenFromHeader = require("../../utils/getTokenFromHeader");
const multer = require("multer");

//Register
// const bcrypt = require('bcrypt');
// const User = require('../models/User'); // Adjust the path as needed
// const AppErr = require('../utils/appErr'); // Adjust the path as needed

const userRegisterCtrl = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  try {
    // Check if email is provided
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        status: "fail",
        data: "Email, password, and confirm password are required",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        data: "Passwords do not match",
      });
    }

    // Check if email already exists
    const userFound = await User.findOne({ email });
    if (userFound) {
      return next(new AppErr("User already exists", 500));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = await User.create({
     
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status: "success",
      data: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    next(new AppErr(error.message, 500));
  }
};

module.exports = userRegisterCtrl;


//Login
const userLoginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Check if email exists
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return next(appErr("Invalid login credentials"));
    }
    
    // Verify password
    const isPasswordMatched = await bcrypt.compare(password, userFound.password);
    if (!isPasswordMatched) {
      return next(appErr("Invalid login credentials"));
    }

    // If login is successful
    res.json({
      status: "success",
      data: {
        firstname: userFound.firstname,
        lastname: userFound.lastname,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        token: generateToken(userFound._id),
      },
    });
  } catch (error) {
    next(appErr(error.message));
  }
};


//update password
const updatePasswordCtrl = async (req, res, next) => {
  const { password } = req.body;
  try {
    //Check if user is updating the password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      //update user
      await User.findByIdAndUpdate(
        req.userAuth,
        { password: hashedPassword },
        { new: true, runValidators: true }
      );
      res.json({
        status: "success",
        data: "Password has been changed successfully",
      });
    } else {
      return next(appErr("Please provide password field"));
    }
  } catch (error) {
    next(appErr(error.message));
  }
};


// Forgot Password Controller
const forgotPasswordCtrl = async (req, res, next) => {
  const { email } = req.body;
  // console.log("Email provided: ", email); // Debugging log

  try {
    const userFound = await User.findOne({ email });
    // console.log("User found: ", userFound); // Debugging log

    if (!userFound) {
      return next(appErr("Email address not found", 404));
    }

    const token = jwt.sign({ id: userFound._id }, process.env.JWT_KEY, { expiresIn: '1h' });

    res.json({
      status: "success",
      message: "Email address verified. Use the token to reset your password.",
      token,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};


// Reset Password Controller
const resetPasswordCtrl = async (req, res, next) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // console.log("Decoded token: ", decoded); // Debugging log

    const userFound = await User.findById(decoded.id);
    // console.log("User found for reset: ", userFound); // Debugging log

    if (!userFound) {
      return next(appErr("User not found", 404));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    userFound.password = hashedPassword;
    await userFound.save();

    res.json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};


//all
const usersCtrl = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({
      status: "success",
      data: users,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
//profile
const userProfileCtrl = async (req, res, next) => {
  try {
    const user = await User.findById(req.userAuth);
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error.message);
  }
};

//update
const updateUserCtrl = async (req, res, next) => {
  const { email, lastname, firstname } = req.body;
  try {
    //Check if email is not taken
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return next(appErr("Email is taken", 400));
      }
    }

    //update the user
    const user = await User.findByIdAndUpdate(
      req.userAuth,
      {
        lastname,
        firstname,
        email,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    //send response
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};


//delete account
const deleteUserAccountCtrl = async (req, res, next) => {
  try {
    //1. Find the user to be deleted
    const userTodelete = await User.findById(req.userAuth);
    //2. find all posts to be deleted
    await Post.deleteMany({ user: req.userAuth });
    //3. Delete all comments of the user
    await Comment.deleteMany({ user: req.userAuth });
    //4. Delete all category of the user
    await Category.deleteMany({ user: req.userAuth });
    //5. delete
    await userTodelete.delete();
    //send response
    return res.json({
      status: "success",
      data: "Your account has been deleted successfully",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//Profile Photo Upload
const profilePhotoUploadCtrl = async (req, res, next) => {
  try {
    // Find the user to be updated
    const userToUpdate = await User.findById(req.userAuth);

    // Check if user is found
    if (!userToUpdate) {
      return next(appErr("User not found", 403));
    }

    // Check if a user is updating their photo
    if (req.file) {
      // Update profile photo
      const updatedUser = await User.findByIdAndUpdate(
        req.userAuth,
        {
          $set: {
            profilePhoto: req.file.path,
          },
        },
        {
          new: true,
        }
      );

      // Check if the update was successful
      if (!updatedUser) {
        return next(appErr("Failed to update profile photo", 500));
      }

      return res.json({
        status: "success",
        data: "You have successfully updated your profile photo",
      });
    } else {
      return res.status(400).json({
        status: "fail",
        data: "No file uploaded",
      });
    }
  } catch (error) {
    next(appErr(error.message, 500));
  }
};


module.exports = {
  userRegisterCtrl,
  userLoginCtrl,
  usersCtrl,
  userProfileCtrl,
  updateUserCtrl,
  profilePhotoUploadCtrl,
  updatePasswordCtrl,
  deleteUserAccountCtrl,
  forgotPasswordCtrl,
  resetPasswordCtrl,
};
