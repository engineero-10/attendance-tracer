import mongoose from "mongoose";
import ClassStatus from "../utils/class.status.js";
const ClassSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Teacher is required"],
  },
  className: {
    type: String,
    required: [true, "Class Name Is Required"],
  },
  description: {
    type: String,
  },
  code: {
    type: String,
    required: [true, "Class Code Is Required To Be Identifier"],
    unique: [true, "This Code Already Exist Try Another One"],
    uppercase: true,
  },
  schedule: [
    {
      dayOfWeek: {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
      startTime: {
        type: String,
        validate: {
          validator: function (value) {
            return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
          },
          message: "Invalid time format. Use HH:mm (e.g. 09:30 or 18:45)",
        },
      },

      endTime: {
        type: String,
        validate: {
          validator: function (value) {
            return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
          },
          message: "Invalid time format. Use HH:mm (e.g. 09:30 or 18:45)",
        },
      },
    },
  ],
  status: {
    type: String,
    enum: [ClassStatus.ACTIVE, ClassStatus.INACTIVE],
    default: ClassStatus.ACTIVE,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const ClassModel = mongoose.model("Class", ClassSchema);
export default ClassModel;
