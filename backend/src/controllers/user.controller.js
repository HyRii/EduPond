const userService = require("../services/user.service");

const getUsers = async (
  req,
  res,
  next
) => {
  try {
    const {
      role,
      status,
    } = req.query;

    const users =
      await userService.listUsers({
        role,
        status,
      });

    return res.status(200).json({
      success: true,
      message:
        "Users retrieved successfully",
      data: {
        users,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updateUserStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user =
      await userService.updateUserStatus(
        id,
        status
      );

    return res.status(200).json({
      success: true,
      message:
        "User status updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
};