import jwt from "jsonwebtoken";
import appError from "../utils/appError";
import HttpStatusText from "../utils/httpStatusText";

function verifyToken(req,res,next) {
  const authHeader = req.get("Authorization") || req.get("authorization");
  if(!authHeader){
    const error = appError.create("JWT token required",HttpStatusText.FAIL,401);
    return next(error);
  }
  const token = authHeader.split(" ")[1];
  const currentUser= jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!currentUser) {
    const error= appError.create("JWT Token Invalid",401,"FAIL");
       return next(error)
  }
  req.currentUser = currentUser;
  next();
}

export default verifyToken;
