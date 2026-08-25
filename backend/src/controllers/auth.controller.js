const authService = require("../services/auth.service");
const { generateAccessToken } = require("../utils/jwt");

const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const user = await authService.registerUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "STUDENT",
    });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Student registration error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const registerInstructor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const user = await authService.registerUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "INSTRUCTOR",
    });

    return res.status(201).json({
      success: true,
      message: "Instructor registered successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Instructor registration error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await authService.login({
      email: email.trim().toLowerCase(),
      password,
    });

    const token = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Current user retrieved successfully",
    data: {
      user: req.user,
    },
  });
};

const getAdminTest = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin access granted",
    data: {
      user: req.user,
    },
  });
};

module.exports = {
  registerStudent,
  registerInstructor,
  login,
  getCurrentUser,
  getAdminTest,
};