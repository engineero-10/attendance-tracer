import express from 'express';
import authController from "../controller/auth.controller.js";
import userValidation from '../middleware/user.validation.js';


const router = express.Router();

router.route("/signup").post(userValidation.userSignupValidation,authController.signup);
router.route("/login").post(userValidation.userLoginValidation,authController.login);

export default router;