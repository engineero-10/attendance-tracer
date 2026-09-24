import express from "express";
import HttpStatusText from "./utils/httpStatusText.js";
import AuthRoute from './router/auth.route.js'
import ClassRoute from './router/class.route.js'
import StudentRoute from './router/student.route.js'
import TeacherRoute from './router/teacher.route.js'
import cors from 'cors'
const app = express();
app.use(express.json());
app.use(cors({origin:'*',credentials:true}))
app.use("/api/auth",AuthRoute);
app.use("/api/classes",ClassRoute);
app.use("/api/students",StudentRoute);
app.use("/api/teachers",TeacherRoute);
app.use((req, res, next) => {
  return res.status(401).json({
    status: HttpStatusText.Error,
    message: "This Resource Not Available",
    statusCode: 401,
    data: null,
  });
});

app.use((error, req, res, next) => {
  return res.status(error.statusCode || 401).json({
    status: error.statusText || HttpStatusText.ERROR,
    message: error.message,
    statusCode: error.statusCode || 401,
    data: null,
  });
});

export { app };
