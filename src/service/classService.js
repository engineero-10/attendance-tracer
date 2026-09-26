import classRepo from "../repository/class.repo.js";

async function createClass(reqBody, teacherId) {
  reqBody.teacher = teacherId;
  return classRepo.createClass(reqBody);
}

function getAllClasses(teacherId, limit, skip) {
  return classRepo.findAllClasses(teacherId, limit, skip);
}

function getClassByCode(teacherId, reqClassCode) {
  return classRepo.findClassByCode(
    { teacher: teacherId, code: reqClassCode },
    { _id: false, __v: false },
  );
}

function editClass(teacherId, reqClassCode, updateData) {
  return classRepo.updateClass(
    { teacher: teacherId, code: reqClassCode },
    updateData,
  );
}

function deleteClass(teacherId, reqClassCode) {
  return classRepo.deleteClass({ teacher: teacherId, code: reqClassCode });
}

export default {
  createClass,
  getAllClasses,
  getClassByCode,
  editClass,
  deleteClass,
};
