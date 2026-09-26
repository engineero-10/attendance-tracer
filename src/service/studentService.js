import classRepo from "../repository/class.repo.js";
import enrollmentRepo from "../repository/enrollment.repo.js";
import ClassStatus from "../utils/class.status.js";

function getClassByCode(classCode) {
  return classRepo.findClassByCode({
    code: classCode,
    status: ClassStatus.ACTIVE,
  });
}

function getEnrollment(studentId, classCode) {
  return enrollmentRepo.findEnrollment({
    student: studentId,
    class: classCode,
  });
}

function enrollInClass(studentId, classCode) {
  return enrollmentRepo.createEnrollment({
    student: studentId,
    class: classCode,
  });
}

function getMyEnrollments(studentId, limit, skip) {
  return enrollmentRepo.findMyEnrollments(studentId, limit, skip);
}

function getAvailableClasses(limit, skip) {
  return classRepo.findAvailableClasses(limit, skip);
}

export default {
  getClassByCode,
  getEnrollment,
  enrollInClass,
  getMyEnrollments,
  getAvailableClasses,
};
