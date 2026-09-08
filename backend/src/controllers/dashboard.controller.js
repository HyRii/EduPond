const service = require("../services/dashboard.service");

const getAdminDashboard = async (req, res, next) => {
  try {
    const metrics = await service.getAdminMetrics();
    return res.status(200).json({
      success: true,
      message: "Admin dashboard metrics retrieved",
      data: { metrics },
    });
  } catch (error) {
    next(error);
  }
};

const getInstructorDashboard = async (req, res, next) => {
  try {
    const metrics = await service.getInstructorMetrics(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Instructor dashboard metrics retrieved",
      data: { metrics },
    });
  } catch (error) {
    next(error);
  }
};

const getStudentDashboard = async (req, res, next) => {
  try {
    const metrics = await service.getStudentMetrics(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Student dashboard metrics retrieved",
      data: { metrics },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getInstructorDashboard,
  getStudentDashboard,
};
