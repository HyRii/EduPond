import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../../components/auth/AuthForm";
import { registerInstructor } from "../../services/auth.service";

const RegisterInstructor = () => {
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    await registerInstructor(
      formData.name,
      formData.email,
      formData.password
    );

    navigate("/login");
  };

  return (
    <AuthForm
      title="Become an Instructor"
      subtitle="Create your Instructor account and start sharing knowledge."
      submitText="Create Instructor Account"
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

export default RegisterInstructor;