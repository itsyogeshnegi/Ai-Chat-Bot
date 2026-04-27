import { Link, useNavigate } from "react-router-dom";
import { AuthPanel } from "../components/AuthPanel.jsx";
import { useAuth } from "../hooks/useAuth.js";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (values) => {
    await register(values);
    navigate("/");
  };

  return (
    <AuthPanel
      title="Create your command center"
      subtitle="Spin up a local-first AI chat workspace with Ollama."
      submitLabel="Register"
      onSubmit={handleSubmit}
      fields={[
        { name: "name", type: "text", label: "Name" },
        { name: "email", type: "email", label: "Email" },
        { name: "password", type: "password", label: "Password" }
      ]}
      footer={
        <p className="text-sm text-slate-300">
          Already have an account?{" "}
          <Link className="text-accent" to="/login">
            Sign in
          </Link>
        </p>
      }
    />
  );
};
