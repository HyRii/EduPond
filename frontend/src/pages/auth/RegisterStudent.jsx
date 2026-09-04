import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../../components/auth/AuthForm";
import { registerStudent } from "../../services/auth.service";

const RegisterStudent = () => {
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    await registerStudent(
      formData.name,
      formData.email,
      formData.password
    );

    navigate("/login");
  };

  return (
    <AuthForm
      title="Join EduPond"
      subtitle="Create your Student account."
      submitText="Create Student Account"
      onSubmit={handleRegister}
      fields={[
        {
          name: "name",
          label: "Full Name",
          placeholder: "Your name",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Create a password",
        },
      ]}
      footer={
        <>
          <p>
            Already have an account?
          </p>

          <Link to="/login">
            Login
          </Link>
        </>
      }
    />
  );
};

export default RegisterStudent;