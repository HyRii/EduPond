const certificateService =
  require("../services/certificate.service");

const getMyCertificates = async (
  req,
  res,
  next
) => {
  try {

    const certificates =
      await certificateService
        .getMyCertificates(
          req.user.id
        );

    return res.status(200).json({
      success: true,
      message:
        "Certificates retrieved successfully",
      data: {
        certificates,
      },
    });

  } catch (error) {
    return next(error);
  }
};

const getCertificateById = async (
  req,
  res,
  next
) => {
  try {

    const certificate =
      await certificateService
        .getCertificateById(
          req.params.id,
          req.user.id,
          req.user.role
        );

    return res.status(200).json({
      success: true,
      message:
        "Certificate retrieved successfully",
      data: {
        certificate,
      },
    });

  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyCertificates,
  getCertificateById,
};