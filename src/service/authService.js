import {
  findUserByUserName,
  findUserByEmail,
  getUserByUserName,
  createUser,
} from "../repository/user.repo.js";
import bcryp from "bcrypt";
import appError from "../utils/appError.js";
import HttpStatusText from "../utils/httpStatusText.js";

async function signup(reqBody) {
  const emailExists = await findUserByEmail(reqBody.email);
  const userNameExists = await findUserByUserName(reqBody.userName);

  if (emailExists) {
    throw appError.create(
      `Invalid Email: ${reqBody.email} already exists`,
      HttpStatusText.FAIL,
      400,
    );
  }
  if (userNameExists) {
    throw appError.create(
      `Invalid Username: ${reqBody.userName} already exists`,
      HttpStatusText.FAIL,
      400,
    );
  }

  const hashedPassword = await bcryp.hash(reqBody.password, 10);
  reqBody.password = hashedPassword;

  const newUser = await createUser(reqBody);
  return newUser;
}

async function login(userName, password) {
  const isUserExist = await getUserByUserName(userName);
  if (!isUserExist) {
    return { isUserExist, matchPassword: false };
  }

  const matchPassword = await bcryp.compare(password, isUserExist.password);
  return { isUserExist, matchPassword };
}

export default { signup, login };
