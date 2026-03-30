import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

const OAuth = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      login(token);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [login, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-white text-xl">Logging in...</div>
    </div>
  );
};

export default OAuth;