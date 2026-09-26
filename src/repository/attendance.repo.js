import AttendanceModel from "../model/attendance.model.js";

async function createAttendance(data) {
  const attendance = new AttendanceModel(data);
  await attendance.save();
  return attendance;
}

function findAttendance(query) {
  return AttendanceModel.findOne(query);
}

function updateAttendance(query, data) {
  return AttendanceModel.findOneAndUpdate(query, data, {
    new: true,
    runValidators: true,
  });
}

function findAttendanceHistory(studentId, limit, skip) {
  return AttendanceModel.find(
    { student: studentId },
    { __v: false, _id: false },
  )
    .populate("markedBy", "name -_id")
    .limit(limit)
    .skip(skip)
    .sort({ date: -1 });
}

function findAttendanceByClassAndDate(classCode, targetDate) {
  return AttendanceModel.find({
    class: classCode,
    date: targetDate,
  }).populate("student", "name userName -_id");
}

function findExportAttendance(classCode, targetDate) {
  return AttendanceModel.find({
    class: classCode,
    date: targetDate,
  })
    .populate("student", "name userName -_id")
    .populate("markedBy", "name -_id")
    .select("-_id -__v");
}

export default {
  createAttendance,
  findAttendance,
  updateAttendance,
  findAttendanceHistory,
  findAttendanceByClassAndDate,
  findExportAttendance,
};
