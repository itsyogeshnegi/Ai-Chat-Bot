import { Link, useNavigate } from "react-router-dom";
import { AuthPanel } from "../components/AuthPanel.jsx";
import { useAuth } from "../hooks/useAuth.js";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (values) => {
    await login(values);
    navigate("/");
  };

  return (
    <AuthPanel
      title="Welcome back"
      subtitle="Sign in to your private local AI workspace."
      submitLabel="Log In"
      onSubmit={handleSubmit}
      fields={[
        { name: "email", type: "email", label: "Email" },
        { name: "password", type: "password", label: "Password" }
      ]}
      footer={
        <p className="text-sm text-slate-300">
          New here?{" "}
          <Link className="text-accent" to="/register">
            Create an account
          </Link>
        </p>
      }
    />
  );
};
