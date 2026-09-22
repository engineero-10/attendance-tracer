import mongoose from "mongoose";
import { userRole } from "../utils/user.role.js";
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 8 characters"],
  },
  role: {
    type: String,
    enum: [userRole.TEACHER, userRole.STUDENT],
    default: userRole.STUDENT,
  },
});
const userModel = mongoose.model("User", userSchema);
export default userModel;
