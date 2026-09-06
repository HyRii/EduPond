import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getCertificateById,
} from "../../services/certificate.service";

const CertificateDetail = () => {

  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const [certificate, setCertificate] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    const loadCertificate =
      async () => {

        try {

          const response =
            await getCertificateById(
              id
            );

          setCertificate(
            response
              ?.data
              ?.certificate
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
          {error ||
            "Certificate not found."}
        </div>
      </section>
    );
  }

  return (
    <section className="student-page">

      <button
        type="button"
        className="back-button"
        onClick={() =>
          navigate(
            "/student/certificates"
          )
        }
      >
        ← Certificates
      </button>

      <div className="certificate-document">

        <p className="page-eyebrow">
          EDU POND
        </p>

        <h1>
          Certificate of Completion
        </h1>

        <p>
          This certifies that
        </p>

        <h2>
          {certificate.student_name}
        </h2>

        <p>
          has successfully completed
        </p>

        <h2>
          {certificate.course_title}
        </h2>

        <p>
          Certificate Number
        </p>

        <strong>
          {certificate.certificate_no}
        </strong>

        <p>
          Issued{" "}
          {new Date(
            certificate.issued_at
          ).toLocaleDateString()}
        </p>

      </div>

    </section>
  );
};

export default CertificateDetail;