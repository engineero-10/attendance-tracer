import handelErrors from "../utils/globalError.js";
import appError from "../utils/appError.js";
import HttpStatusText from "../utils/httpStatusText.js";
import attendanceService from "../service/attendanceService.js";

const markAttendance = handelErrors(async (req, res, next) => {
  const { studentId, status, participation, classCode, notes } = req.body;
  const teacherId = req.currentUser.id;

  const attendance = await attendanceService.markAttendance({
    teacherId,
    studentId,
    classCode,
    status,
    participation,
    notes,
  });

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

  const updated = await attendanceService.updateAttendance({
    teacherId,
    studentId,
    classCode,
    status,
    participation,
    notes,
  });

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

  const myHistory = await attendanceService.attendanceHistory(
    studentId,
    limit,
    skip,
  );

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

  const summary = await attendanceService.dailyAttendanceSummary(
    classCode,
    teacherId,
    date,
  );
  const {
    classData,
    targetDate,
    enrollments,
    present,
    absent,
    notMarked,
    students,
  } = summary;

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

  const { targetDate, attendanceRecords } =
    await attendanceService.exportAttendance(classCode, teacherId, date);

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
