import UserModel from "../model/user.model.js";
import { validationResult } from "express-validator";
import handelErrors from "../utils/globalError.js";
import appError from "../utils/appError.js";
import HttpStatusText from "../utils/httpStatusText.js";
import bcryp from "bcrypt";
import generateToken from "../utils/generateToken.js";
/////////////////////////////////
const signup = handelErrors(async (req, res, next) => {
  const reqBody = req.body;

  const reqErrors = validationResult(req);

  if (!reqErrors.isEmpty()) {
    const error = appError.create(reqErrors.array(), HttpStatusText.ERROR, 400);

    return next(error);
  }

  // Check email
  if (await findUserByEmail(reqBody.email)) {
    const error = appError.create(
      `Invalid Email: ${reqBody.email} already exists`,
      HttpStatusText.FAIL,
      400,
    );

    return next(error);
  }

  // Check username
  if (await findUserByUserName(reqBody.userName)) {
    const error = appError.create(
      `Invalid Username: ${reqBody.userName} already exists`,
      HttpStatusText.FAIL,
      400,
    );

    return next(error);
  }

  // Hash password
  const hashedPassword = await bcryp.hash(reqBody.password, 10);
  reqBody.password = hashedPassword;

  // Create user
  const newUser = new UserModel(reqBody);

  await newUser.save();

  // JWT payload
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
/////////////////////////////////
const login = handelErrors(async (req, res, next) => {
  const reqBody = req.body;
  const reqErrors = validationResult(req);

  if (!reqErrors.isEmpty()) {
    const error = appError.create(reqErrors.array(), HttpStatusText.ERROR, 400);

    return next(error);
  }

  const isUserExist = await UserModel.findOne({ userName: reqBody.userName });
  if (isUserExist) {
    const matchPassword = await bcryp.compare(
      reqBody.password,
      isUserExist.password,
    );
    if (!matchPassword) {
      const error = appError.create(
        "Invalid username or password",
        HttpStatusText.FAIL,
        401,
      );

      return next(error);
    } else {
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
    }
  }else{
   const error = appError.create(
        "Invalid username or password",
        HttpStatusText.FAIL,
        401,
      );

      return next(error);
  }
});

async function findUserByUserName(userName) {
  const user = await UserModel.findOne({ userName });
  return user === null ? false : true;
}
async function findUserByEmail(email) {
  const user = await UserModel.findOne({ email });
  return user === null ? false : true;
}
export default {
  signup,
  login,
};
