import UserModel from "../model/user.model.js";

async function findUserByUserName(userName) {
  const user = await UserModel.findOne({ userName });
  return user === null ? false : true;
}
async function findUserByEmail(email) {
  const user = await UserModel.findOne({ email });
  return user === null ? false : true;
}

function getUserByUserName(userName) {
  return UserModel.findOne({ userName });
}

async function createUser(data) {
  const newUser = new UserModel(data);
  await newUser.save();
  return newUser;
}

export { findUserByUserName, findUserByEmail, getUserByUserName, createUser };
