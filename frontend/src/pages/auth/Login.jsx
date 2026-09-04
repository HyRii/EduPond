import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../../components/auth/AuthForm";
import { login } from "../../services/auth.service";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    const response = await login(
      formData.email,
      formData.password
    );

    const role = response?.data?.user?.role;

    if (role === "ADMIN") {
      navigate("/admin");
    } else if (role === "INSTRUCTOR") {
      navigate("/instructor");
    } else if (role === "STUDENT") {
      navigate("/student");
    } else {
      navigate("/");
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Login to continue learning with EduPond."
      submitText="Login"
      onSubmit={handleLogin}
      fields={[
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
          placeholder: "Enter your password",
        },
      ]}
      footer={
        <>
          <p>
            Don't have an account?
          </p>

          <div className="auth-links">
            <Link to="/register/student">
              Register as Student
            </Link>

            <Link to="/register/instructor">
              Register as Instructor
            </Link>
          </div>
        </>
      }
    />
  );
};

export default Login;