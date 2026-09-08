import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  downloadCertificate,
  getCertificateById,
} from "../../services/certificate.service";

const CertificateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCertificateById(id);
        setCertificate(
          response?.data?.certificate || null
        );
      } catch (error) {
        setError(
          error.message ||
            "Failed to load certificate."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [id]);

  const handleDownload = async () => {
    if (!certificate?.certificate_url) return;

    try {
      setDownloading(true);
      await downloadCertificate(
        certificate.certificate_url,
        `${certificate.certificate_no}.jpg`
      );
    } catch (error) {
      setError(
        error.message ||
          "Failed to download certificate."
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <section className="student-page">
        Loading certificate...
      </section>
    );
  }

  if (!certificate) {
    return (
      <section className="student-page">
        <div className="student-error">
          {error || "Certificate not found."}
        </div>
      </section>
    );
  }

  return (
    <section className="student-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/student/certificates")}
      >
        ← Certificates
      </button>

      <div className="certificate-detail-header">
        <div>
          <p className="page-eyebrow">CERTIFICATE</p>
          <h1>{certificate.course_title}</h1>
          <p>
            Certificate No: {certificate.certificate_no}
          </p>
        </div>

        {certificate.certificate_url && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading
              ? "Downloading..."
              : "Download JPG"}
          </button>
        )}
      </div>

      {error && (
        <div className="student-error">{error}</div>
      )}

      {certificate.certificate_url ? (
        <div className="certificate-preview-card">
          <img
            src={certificate.certificate_url}
            alt={`EduPond certificate for ${certificate.student_name}`}
            className="certificate-full-image"
          />
        </div>
      ) : (
        <div className="student-empty">
          <h2>Certificate image is not ready</h2>
          <p>
            The certificate record exists, but its JPG could not
            be generated yet.
          </p>
        </div>
      )}
    </section>
  );
};

export default CertificateDetail;
