import attendanceRepo from "../repository/attendance.repo.js";
import classRepo from "../repository/class.repo.js";
import enrollmentRepo from "../repository/enrollment.repo.js";
import appError from "../utils/appError.js";
import HttpStatusText from "../utils/httpStatusText.js";

function notFound(message) {
  return appError.create(message, HttpStatusText.FAIL, 404);
}

async function markAttendance(data) {
  const classData = await classRepo.findClassByCode({
    teacher: data.teacherId,
    code: data.classCode,
  });
  if (!classData) {
    throw notFound("Class not found or you are not the teacher of this class");
  }

  const enrollment = await enrollmentRepo.findEnrollment({
    student: data.studentId,
    class: data.classCode,
  });
  if (!enrollment) {
    throw notFound("Student is not enrolled in this class");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existingAttendance = await attendanceRepo.findAttendance({
    student: data.studentId,
    class: data.classCode,
    date: today,
  });
  if (existingAttendance) {
    throw appError.create(
      "Attendance already marked for this student today",
      HttpStatusText.FAIL,
      400,
    );
  }

  return attendanceRepo.createAttendance({
    markedBy: data.teacherId,
    student: data.studentId,
    class: data.classCode,
    status: data.status,
    participationScore: data.participation,
    date: today,
    notes: data.notes,
  });
}

async function updateAttendance(data) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const classData = await classRepo.findClassByCode({
    code: data.classCode,
    teacher: data.teacherId,
  });
  if (!classData) {
    throw notFound("Class not found or you are not the teacher of this class");
  }

  const attendance = await attendanceRepo.findAttendance({
    student: data.studentId,
    class: data.classCode,
    date: today,
  });
  if (!attendance) {
    throw notFound("Attendance record not found for this student today");
  }

  return attendanceRepo.updateAttendance(
    { student: data.studentId, class: data.classCode, date: today },
    {
      status: data.status,
      participationScore: data.participation,
      notes: data.notes,
    },
  );
}

function attendanceHistory(studentId, limit, skip) {
  return attendanceRepo.findAttendanceHistory(studentId, limit, skip);
}

async function dailyAttendanceSummary(classCode, teacherId, date) {
  const classData = await classRepo.findClassByCode({
    code: classCode,
    teacher: teacherId,
  });
  if (!classData) {
    throw notFound("Class not found or you are not the teacher of this class");
  }

  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const enrollments = await enrollmentRepo.findEnrollmentsByClass(classCode);
  const attendanceRecords = await attendanceRepo.findAttendanceByClassAndDate(
    classCode,
    targetDate,
  );

  const attendanceMap = new Map();
  attendanceRecords.forEach((attendance) => {
    attendanceMap.set(attendance.student.userName, attendance);
  });

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
        studentId: student._id,
        userName: student.userName,
        status: "NOT_MARKED",
        participationScore: 0,
      };
    }
    if (attendance.status === "PRESENT") present++;
    else if (attendance.status === "ABSENT") absent++;
    return {
      student: student.name,
      studentId: student._id,
      userName: student.userName,
      status: attendance.status,
      participationScore: attendance.participationScore,
      notes: attendance.notes,
    };
  });

  return {
    classData,
    targetDate,
    enrollments,
    present,
    absent,
    notMarked,
    students,
  };
}

async function exportAttendance(classCode, teacherId, date) {
  const classData = await classRepo.findClassByCode({
    code: classCode,
    teacher: teacherId,
  });
  if (!classData) {
    throw notFound("Class not found or you are not the teacher of this class");
  }
  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const attendanceRecords = await attendanceRepo.findExportAttendance(
    classCode,
    targetDate,
  );
  return { targetDate, attendanceRecords };
}

export default {
  markAttendance,
  updateAttendance,
  attendanceHistory,
  dailyAttendanceSummary,
  exportAttendance,
};
