import ClassModel from "../model/class.model.js";
import { validationResult } from "express-validator";
import handelErrors from "../utils/globalError.js";
import appError from "../utils/appError.js";
import HttpStatusText from "../utils/httpStatusText.js";

const createClass = handelErrors(async (req, res, next) => {
  const reqBody = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), HttpStatusText.ERROR, 400);
    return next(error);
  }
  const teacherId = req.currentUser.id;
  reqBody.teacher = teacherId;
  const newClass = new ClassModel(reqBody);
  await newClass.save();
  res.status(201).json({
    status: HttpStatusText.SUCCESS,
    message: "Class successfully added",
    statusCode: 201,
    data: newClass,
  });
});

const getAllClasses = handelErrors(async (req, res, next) => {
  const limit = req.params.limit || 10;
  const page = req.params.page || 1;
  const skip = (page - 1) * limit;
  const teacherId = req.currentUser.id;
  const classes = await ClassModel.find(
    { teacher: teacherId },
    { _id: false, __v: false },
  )
    .limit(limit)
    .skip(skip);
  res.status(200).json({
    status: HttpStatusText.SUCCESS,
    message: "get all classes",
    statusCode: 200,
    data: classes,
  });
});

const getClassByCode = handelErrors(async (req, res, next) => {
  const reqClassCode = req.params.code;
  const teacherId = req.currentUser.id;
  console.log("sdfsdf");
  
  const classData = await ClassModel.findOne(
    {
      teacher: teacherId,
      code: reqClassCode,
    },
    {
      _id: false,
      __v: false,
    },
  );

  if (!classData) {
    const error = appError.create(
      `Class with code ${reqClassCode} not found`,
      HttpStatusText.FAIL,
      404,
    );

    return next(error);
  }

  return res.status(200).json({
    status: HttpStatusText.SUCCESS,
    message: "Class retrieved successfully",
    statusCode: 200,
    data: classData,
  });
});

const editClass = handelErrors(async (req, res, next) => {
  const reqClassCode = req.params.code;
  const teacherId = req.currentUser.id;
  // Only allow these fields to be updated
  const allowedFields = [
    "className",
    "description",
    "code",
    "schedule",
    "status",
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  const updatedClass = await ClassModel.findOneAndUpdate(
    {
      teacher: teacherId,
      code: reqClassCode,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedClass) {
    const error = appError.create(
      `Class with code ${reqClassCode} not found`,
      HttpStatusText.FAIL,
      404,
    );

    return next(error);
  }

  return res.status(200).json({
    status: HttpStatusText.SUCCESS,
    message: `Class with code ${reqClassCode} updated successfully`,
    statusCode: 200,
    data: updatedClass,
  });
});

const deleteClass = handelErrors(async (req, res, next) => {
  const reqClassCode = req.params.code;
  const teacherId = req.currentUser.id;

  const deletedClass = await ClassModel.findOneAndDelete({
    teacher: teacherId,
    code: reqClassCode,
  });

  if (!deletedClass) {
    const error = appError.create(
      `Cannot delete class with code: ${reqClassCode}`,
      HttpStatusText.FAIL,
      404,
    );

    return next(error);
  }

  return res.status(200).json({
    status: HttpStatusText.SUCCESS,
    message: `Class with code: ${reqClassCode} deleted successfully`,
    statusCode: 200,
    data: null,
  });
});
export default {
  createClass,
  getAllClasses,
  editClass,
  deleteClass,
  getClassByCode,
};
