import ClassModel from "../model/class.model.js";
import ClassStatus from "../utils/class.status.js";

async function createClass(data) {
  const newClass = new ClassModel(data);
  await newClass.save();
  return newClass;
}

function findAllClasses(teacherId, limit, skip) {
  return ClassModel.find({ teacher: teacherId }, { _id: false, __v: false })
    .limit(limit)
    .skip(skip);
}

function findAvailableClasses(limit, skip) {
  return ClassModel.find(
    { status: ClassStatus.ACTIVE },
    { _id: false, __v: false },
  )
    .populate("teacher", "name -_id")
    .limit(limit)
    .skip(skip);
}

function findClassByCode(query, projection) {
  return ClassModel.findOne(query, projection);
}

function updateClass(query, data) {
  return ClassModel.findOneAndUpdate(
    query,
    { $set: data },
    { new: true, runValidators: true },
  );
}

function deleteClass(query) {
  return ClassModel.findOneAndDelete(query);
}

export default {
  createClass,
  findAllClasses,
  findAvailableClasses,
  findClassByCode,
  updateClass,
  deleteClass,
};
