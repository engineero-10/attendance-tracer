import EnrollmentModel from "../model/enrollment.model.js";

function findEnrollment(query) {
  return EnrollmentModel.findOne(query);
}

async function createEnrollment(data) {
  const newEnroll = new EnrollmentModel(data);
  await newEnroll.save();
  return newEnroll;
}

function findMyEnrollments(studentId, limit, skip) {
  return EnrollmentModel.find(
    { student: studentId },
    { __v: false, _id: false },
  )
    .limit(limit)
    .skip(skip);
}

function findEnrollmentsByClass(classCode) {
  return EnrollmentModel.find({ class: classCode }).populate(
    "student",
    "name userName -_id",
  );
}

export default {
  findEnrollment,
  createEnrollment,
  findMyEnrollments,
  findEnrollmentsByClass,
};
