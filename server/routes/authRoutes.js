

const express = require("express");
const { body } = require("express-validator");

const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");

const router = express.Router();

// REGISTER ROUTE
router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 80 })
      .withMessage("Name cannot exceed 80 characters"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address")
      .normalizeEmail(),

    body("password")
      .isString()
      .isLength({ min: 8, max: 72 })
      .withMessage("Password must be between 8 and 72 characters"),
  ],
  registerUser
);

// LOGIN ROUTE
router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address")
      .normalizeEmail(),

    body("password")
      .isString()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ max: 72 })
      .withMessage("Password cannot exceed 72 characters"),
  ],
  loginUser
);
router.post("/logout", logoutUser);

module.exports = router;
