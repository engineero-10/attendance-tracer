import attendanceController from "../controller/attendance.controller.js";
import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import allowedPermissionTo from "../middleware/allowTo.js";
import { userRole } from "../utils/user.role.js";

const router = Router();

router.route('/').post(verifyToken,allowedPermissionTo(userRole.TEACHER),attendanceController.markAttendance);
router.route('/:classCode/attendance/:studentId').patch(verifyToken,allowedPermissionTo(userRole.TEACHER),attendanceController.updateAttendance);
router.route('/:classCode/daily').get(verifyToken,allowedPermissionTo(userRole.TEACHER),attendanceController.dailyAttendanceSummary);
router.route('/export/:classCode').get(verifyToken,allowedPermissionTo(userRole.TEACHER),attendanceController.exportAttendance);
export default router;