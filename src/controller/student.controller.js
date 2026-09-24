import EnrollmentModel from "../model/enrollment.model.js";
import ClassModel from "../model/class.model.js";
import handelErrors from "../utils/globalError.js";
import ClassStatus from "../utils/class.status.js";
import appError from "../utils/appError.js";
import HttpStatusText from "../utils/httpStatusText.js";

const enrollInClass = handelErrors(async (req, res, next) => {
  const studentId = req.currentUser.id;
  const classCode = req.params.code;

  const isClassExist = await ClassModel.findOne({
    code: classCode,
    status: ClassStatus.ACTIVE,
  });

  if (!isClassExist) {
    const error = appError.create(
      "This Class Is Not Exist",
      HttpStatusText.FAIL,
      404,
    );
    return next(error);
  }

  const isStudentEnrolledBefor = await EnrollmentModel.findOne({
    student: studentId,
    class: classCode,
  });

  if (isStudentEnrolledBefor) {
    const error = appError.create(
      "You Already Enrolled In This Class Befor",
      HttpStatusText.FAIL,
      400,
    );
    return next(error);
  }

  const newEnroll = new EnrollmentModel({
    student: studentId,
    class: classCode,
  });
  await newEnroll.save();
  return res.status(201).json({
    status: HttpStatusText.SUCCESS,
    message: "Enrolled successfully",
    statusCode: 201,
    data: newEnroll,
  });
});

const getMyEnrollments = handelErrors(async (req, res, next) => {
  const studentId = req.currentUser.id;
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;
  const myEnrollments = await EnrollmentModel.find(
    { student: studentId },
    { __v: false, _id: false },
  )
    .limit(limit)
    .skip(skip);
  return res.status(200).json({
    status: HttpStatusText.SUCCESS,
    message: "successfully executed",
    statusCode: 200,
    data: myEnrollments,
  });
});

const getAvailableClasses = handelErrors(async (req, res, next) => {
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;
  const classes = await ClassModel.find(
    { status: ClassStatus.ACTIVE },
    { _id: false, __v: false },
  )
    .populate("teacher", "name -_id")
    .limit(limit)
    .skip(skip);
  return res.status(200).json({
    status: HttpStatusText.SUCCESS,
    message: "successfuly execution",
    statusCode: 200,
    data: classes,
  });
});
export default {
  enrollInClass,
  getMyEnrollments,
  getAvailableClasses,
};
