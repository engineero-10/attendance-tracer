import { body } from "express-validator";

const userSignupValidation = [
  body("userName")
    .trim()
    .notEmpty()
    .withMessage("Username can not be empty")
    .isString()
    .withMessage("Username must be a string, for example [user1]"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name can not be empty")
    .isString()
    .withMessage("Name must be a string, for example [Mohamed]"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email can not be empty")
    .isEmail()
    .withMessage("This email is not valid, try another one"),

  body("password")
    .isLength({ min: 6, max: 12 })
    .withMessage("Password must be between [6-12] characters"),
];
const userLoginValidation = [
  body('userName')
  .trim()
  .notEmpty()
  .withMessage("Username can not be empty")
  .isString()
  .withMessage("Username must be string"),
  body('password')
  .trim()
  .notEmpty()
  .withMessage("Username can not be empty")
];
export default {userSignupValidation,userLoginValidation};