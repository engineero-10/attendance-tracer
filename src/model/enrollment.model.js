import mongoose from "mongoose";
const enrollSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Student Id Is Required"],
  },
  class: {
    type: String,
    ref: "Class",
    required: [true, "Class Code Is Required"],
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
});

const EnrollmentModel = mongoose.model("enrollment", enrollSchema);
export default EnrollmentModel;
