const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const healthRoutes = require("./routes/health.routes");
const categoryRoutes = require("./routes/category.routes");
const courseRoutes = require("./routes/course.routes");
const sectionRoutes = require("./routes/section.routes");
const lessonRoutes = require("./routes/lesson.routes")
const enrollmentRoutes = require("./routes/enrollment.routes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);
app.use(express.json());
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api", sectionRoutes);
app.use("/api", lessonRoutes);
app.use("/api", enrollmentRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to EduPond API",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;