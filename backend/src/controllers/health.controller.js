const pool = require("../config/database");

const getHealth = async (req, res) => {
  try {
    await pool.query("SELECT 1");

    return res.status(200).json({
      success: true,
      message: "EduPond API is running",
      data: {
        status: "UP",
        database: "CONNECTED",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return res.status(503).json({
      success: false,
      message: "EduPond API is running but database is unavailable",
      data: {
        status: "DEGRADED",
        database: "DISCONNECTED",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

module.exports = {
  getHealth,
};