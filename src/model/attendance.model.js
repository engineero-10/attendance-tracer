import mongoose from "mongoose";
import AttendanceStatus from "../utils/attendance.role.js";
import attendanceStatus from "../utils/attendance.role.js";
const attendanceSchema = new mongoose.Schema({
  class: {
    type: String,
    ref: "Class",
    required: [true, "Class is required"],
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Student is required"],
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
    default: Date.now,
  },
  status: {
    type: String,
    enum: [AttendanceStatus.ABSENT, attendanceStatus.PRESENT],
    required: [true, "Attendance status is required"],
  },
  participationScore: {
    type: Number,
    min: [0, "Participation score cannot be less than 0"],
    max: [5, "Participation score cannot be more than 5"],
    default: 0,
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Teacher who marked is required"],
  },
  notes: {
    type: String,
    trim: true,
  },
});
attendanceSchema.index(
  {
    student: 1,
    class: 1,
  },
  {
    unique: true,
  },
);
const AttendanceModel = mongoose.model("Attendance", attendanceSchema);

export default AttendanceModel;
