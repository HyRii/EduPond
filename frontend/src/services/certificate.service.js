
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

// NEW (Phase 3D): Download the generated JPEG certificate as a local file.
export const downloadCertificate = async (certificateUrl, fileName) => {
  const response = await fetch(certificateUrl);

  if (!response.ok) {
    throw new Error("Failed to download certificate image.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName || "edupond-certificate.jpg";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};
