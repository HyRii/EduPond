import apiRequest from "./api";

export const getMyCertificates =
  async () => {
    return apiRequest(
      "/me/certificates"
    );
  };

export const getCertificateById =
  async (certificateId) => {
    return apiRequest(
      `/certificates/${certificateId}`
    );
  };