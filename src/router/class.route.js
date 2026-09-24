import express from "express";
import allowPermissionTo from "../middleware/allowTo.js";
import verifyToken from "../middleware/verifyToken.js";
import ClassValidation from "../middleware/class.validation.js";
import { userRole } from "../utils/user.role.js";
import classController from "../controller/class.controller.js";
const router = express.Router();

router
  .route("/")
  .get(
    verifyToken,
    allowPermissionTo(userRole.TEACHER),
    classController.getAllClasses,
  );
router
  .route("/create")
  .post(
    verifyToken,
    allowPermissionTo(userRole.TEACHER),
    ClassValidation,
    classController.createClass,
  );
router
  .route("/edit/:code")
  .patch(
    verifyToken,
    allowPermissionTo(userRole.TEACHER),
    classController.editClass,
  );
  router.route('/:code')
   .get(verifyToken, classController.getClassByCode);
router
  .route("/delete/:code")
  .delete(
    verifyToken,
    allowPermissionTo(userRole.TEACHER),
    classController.deleteClass,
  );
export default router;
