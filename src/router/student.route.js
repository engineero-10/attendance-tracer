import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import allowedPermissionTo from "../middleware/allowTo.js";
import { userRole } from "../utils/user.role.js";
import studentController from "../controller/student.controller.js";

const route = Router();

route
  .route("/classes")
  .get(
    verifyToken,
    allowedPermissionTo(userRole.STUDENT),
    studentController.getAvailableClasses,
  );
route
  .route("/")
  .get(
    verifyToken,
    allowedPermissionTo(userRole.STUDENT),
    studentController.getMyEnrollments,
  );

route
  .route("/:code")
  .post(
    verifyToken,
    allowedPermissionTo(userRole.STUDENT),
    studentController.enrollInClass,
  );

export default route;
