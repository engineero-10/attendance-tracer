import appError from "../utils/appError.js";
const allowedPermissionTo = (...roles) => {
  return (req, res, next) => {
    const role = req.currentUser.role;
    if (!roles.includes(role)) {
      const error = appError.create(
        `permission denaied`,
        "FAIL",
        401,
      );
      return next(error);
    }
    next();
  };
};
export default allowedPermissionTo;