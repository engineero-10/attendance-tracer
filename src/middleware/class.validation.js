import { body } from "express-validator";
const classValidation = [
  body("className")
    .trim()
    .notEmpty()
    .withMessage("name can not be empty")
    .isString()
    .withMessage("name must be a string, for example [backend]"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("description can not be empty"),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Code can not be empty")
    .isString()
    .withMessage("code must be a string, for example [code#123]")
    .toUpperCase(),

  body("schedule")
    .isArray({ min: 1 })
    .withMessage("Schedule must be an array with at least one item"),

  body("schedule.*.dayOfWeek")
    .notEmpty()
    .withMessage("Day of week is required")
    .isIn([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ])
    .withMessage("Invalid day of week"),

  body("schedule.*.startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Start time must be in HH:mm format"),

  body("schedule.*.endTime")
    .notEmpty()
    .withMessage("End time is required")
    .matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("End time must be in HH:mm format"),
];
export default classValidation;