import { validationResult } from "express-validator";
import handelErrors from "../utils/globalError.js";
import appError from "../utils/appError.js";
import HttpStatusText from "../utils/httpStatusText.js";
import generateToken from "../utils/generateToken.js";
import authService from "../service/authService.js";

const signup = handelErrors(async (req, res, next) => {
  const reqBody = req.body;

  const reqErrors = validationResult(req);

  if (!reqErrors.isEmpty()) {
    const error = appError.create(reqErrors.array(), HttpStatusText.ERROR, 400);

    return next(error);
  }

  const newUser = await authService.signup(reqBody);

  const payload = {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };

  const token = await generateToken(payload);

  return res.status(201).json({
    status: HttpStatusText.SUCCESS,
    message: "User successfully added",
    statusCode: 201,
    data: {
      user: {
        id: newUser._id,
        userName: newUser.userName,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token,
      },
    },
  });
});
const login = handelErrors(async (req, res, next) => {
  const reqBody = req.body;
  const reqErrors = validationResult(req);

  if (!reqErrors.isEmpty()) {
    const error = appError.create(reqErrors.array(), HttpStatusText.ERROR, 400);

    return next(error);
  }

  const { isUserExist, matchPassword } = await authService.login(
    reqBody.userName,
    reqBody.password,
  );
  if (!isUserExist || !matchPassword) {
    const error = appError.create(
      "Invalid username or password",
      HttpStatusText.FAIL,
      401,
    );

    return next(error);
  }

  const payload = {
    id: isUserExist._id,
    name: isUserExist.name,
    email: isUserExist.email,
    role: isUserExist.role,
  };
  const token = await generateToken(payload);
  return res.status(200).json({
    status: HttpStatusText.SUCCESS,
    message: "logged in successfully",
    statusCode: 200,
    data: {
      user: {
        id: isUserExist._id,
        userName: isUserExist.userName,
        name: isUserExist.name,
        email: isUserExist.email,
        role: isUserExist.role,
        token,
      },
    },
  });
});

export default {
  signup,
  login,
};
