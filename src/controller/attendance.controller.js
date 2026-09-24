import AttendanceModel from "../model/attendance.model.js";
import ClassModel from "../model/class.model.js";
import handelErrors from "../utils/globalError.js";
import ClassStatus from "../utils/class.status.js";
import appError from "../utils/appError.js";
import HttpStatusText from "../utils/httpStatusText.js";
import EnrollmentModel from "../model/enrollment.model.js";
import status from "../utils/class.status.js";

const markAttendance = handelErrors(async (req, res, next) => {
  const { studentId, status, participation, classCode, notes } = req.body;
  const teacherId = req.currentUser.id;

  const classData = await ClassModel.findOne({
    teacher: teacherId,
    code: classCode,
  });

  if (!classData) {
    const error = appError.create(
      "Class not found or you are not the teacher of this class",
      HttpStatusText.FAIL,
      404,
    );

    return next(error);
  }

  const enrollment = await EnrollmentModel.findOne({
    student: studentId,
    class: classCode,
  });

  if (!enrollment) {
    const error = appError.create(
      "Student is not enrolled in this class",
      HttpStatusText.FAIL,
      404,
    );

    return next(error);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingAttendance = await AttendanceModel.findOne({
    student: studentId,
    class: classCode,
    date: today,
  });

  if (existingAttendance) {
    const error = appError.create(
      "Attendance already marked for this student today",
      HttpStatusText.FAIL,
      400,
    );

    return next(error);
  }

  // 5. Create attendance
  const attendance = new AttendanceModel({
    markedBy: teacherId,
    student: studentId,
    class: classCode,
    status,
    participationScore: participation,
    date: today,
    notes,
  });

  await attendance.save();

  return res.status(201).json({
    status: HttpStatusText.SUCCESS,
    message: "Attendance marked successfully",
    statusCode: 201,
    data: attendance,
  });
});

const updateAttendance = handelErrors(async (req, res, next) => {
  const classCode = req.params.classCode;
  const studentId = req.params.studentId;
  const teacherId = req.currentUser.id;

  const { status, participation, notes } = req.body;

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Check that the class belongs to the logged-in teacher
  const classData = await ClassModel.findOne({
    code: classCode,
    teacher: teacherId,
  });

  if (!classData) {
    const error = appError.create(
      "Class not found or you are not the teacher of this class",
      HttpStatusText.FAIL,
      404,
    );

    return next(error);
  }

  // 2. Find today's attendance record
  const attendance = await AttendanceModel.findOne({
    student: studentId,
    class: classCode,
    date: today,
  });

  if (!attendance) {
    const error = appError.create(
      "Attendance record not found for this student today",
      HttpStatusText.FAIL,
      404,
    );

    return next(error);
  }

  // 3. Update attendance
  const updated = await AttendanceModel.findOneAndUpdate(
    {
      student: studentId,
      class: classCode,
      date: today,
    },
    {
      status,
      participationScore: participation,
      notes,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return res.status(200).json({
    status: HttpStatusText.SUCCESS,
    message: "Attendance updated successfully",
    statusCode: 200,
    data: updated,
  });
});

const attendanceHistory = handelErrors(async (req, res, next) => {
  const studentId = req.currentUser.id;
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const myHistory = await AttendanceModel.find(
    { student: studentId },
    { __v: false, _id: false },
  )
    .populate("markedBy", "name -_id")
    .limit(limit)
    .skip(skip)
    .sort({ date: -1 });

  return res.status(200).json({
    status: HttpStatusText.SUCCESS,
    message: "successfully executed",
    statusCode: 200,
    data: myHistory,
  });
});

const dailyAttendanceSummary = handelErrors(async (req, res, next) => {
  const classCode = req.params.classCode;
  const teacherId = req.currentUser.id;

  const date = req.query.date;

  // 1. Check class ownership
  const classData = await ClassModel.findOne({
    code: classCode,
    teacher: teacherId,
  });

  if (!classData) {
    const error = appError.create(
      "Class not found or you are not the teacher of this class",
      HttpStatusText.FAIL,
      404,
    );

    return next(error);
  }

  // 2. Get target date
  const targetDate = date ? new Date(date) : new Date();

  targetDate.setHours(0, 0, 0, 0);

  // 3. Get all enrolled students
  const enrollments = await EnrollmentModel.find({
    class: classCode,
  }).populate("student", "name userName -_id");

  // 4. Get attendance records for this day
  const attendanceRecords = await AttendanceModel.find({
    class: classCode,
    date: targetDate,
  }).populate("student", "name userName -_id");

  // 5. Create a quick lookup for attendance
  const attendanceMap = new Map();

  attendanceRecords.forEach((attendance) => {
    attendanceMap.set(attendance.student.userName, attendance);
  });

  // 6. Build daily summary
  let present = 0;
  let absent = 0;
  let notMarked = 0;

  const students = enrollments.map((enrollment) => {
    const student = enrollment.student;

    const attendance = attendanceMap.get(student.userName);

    if (!attendance) {
      notMarked++;

      return {
        student: student.name,
        userName: student.userName,
        status: "NOT_MARKED",
        participationScore: 0,
      };
    }

    if (attendance.status === "PRESENT") {
      present++;
    } else if (attendance.status === "ABSENT") {
      absent++;
    }

    return {
      student: student.name,
      userName: student.userName,
      status: attendance.status,
      participationScore: attendance.participationScore,
      notes: attendance.notes,
    };
  });

  return res.status(200).json({
    status: HttpStatusText.SUCCESS,
    message: "Daily attendance summary retrieved successfully",
    statusCode: 200,
    data: {
      class: classData.className,
      classCode: classData.code,
      date: targetDate,
      totalStudents: enrollments.length,
      present,
      absent,
      notMarked,
      students,
    },
  });
});

const exportAttendance = handelErrors(async (req, res, next) => {
  const classCode = req.params.classCode;
  const teacherId = req.currentUser.id;

  const { date, format = "json" } = req.query;

  // 1. Validate format
  if (!["json", "csv"].includes(format)) {
    const error = appError.create(
      "Invalid format. Use json or csv",
      HttpStatusText.FAIL,
      400,
    );

    return next(error);
  }

  // 2. Check class ownership
  const classData = await ClassModel.findOne({
    code: classCode,
    teacher: teacherId,
  });

  if (!classData) {
    const error = appError.create(
      "Class not found or you are not the teacher of this class",
      HttpStatusText.FAIL,
      404,
    );

    return next(error);
  }

  // 3. Get target date
  const targetDate = date ? new Date(date) : new Date();

  targetDate.setHours(0, 0, 0, 0);

  // 4. Get attendance records
  const attendanceRecords = await AttendanceModel.find({
    class: classCode,
    date: targetDate,
  })
    .populate("student", "name userName -_id")
    .populate("markedBy", "name -_id")
    .select("-_id -__v");

  // =========================
  // JSON
  // =========================

  if (format === "json") {
    return res.status(200).json({
      status: HttpStatusText.SUCCESS,
      message: "Attendance exported successfully",
      statusCode: 200,
      data: attendanceRecords,
    });
  }

  // =========================
  // CSV
  // =========================

  const headers = [
    "Student Name",
    "Username",
    "Date",
    "Status",
    "Participation Score",
    "Marked By",
    "Notes",
  ];

  const rows = attendanceRecords.map((attendance) => [
    attendance.student?.name || "",
    attendance.student?.userName || "",
    attendance.date.toISOString().split("T")[0],
    attendance.status,
    attendance.participationScore,
    attendance.markedBy?.name || "",
    attendance.notes || "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${classCode}-${
      targetDate.toISOString().split("T")[0]
    }.csv"`,
  );

  return res.status(200).send(csv);
});
export default {
  markAttendance,
  updateAttendance,
  attendanceHistory,
  dailyAttendanceSummary,
  exportAttendance,
};
