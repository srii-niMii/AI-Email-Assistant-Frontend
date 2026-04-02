import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const token = res.data.token;
      login(token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "https://ai-emailassistant-production.up.railway.app/login/oauth2/code/google";
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 ">
      <div className="bg-gray-800 p-10 rounded-lg w-96 text-white shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">AI Email Assistant</h2>

        {error && (
          <div className="bg-green-900 p-2 text-white rounded mt-4 mb-4 text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Enter email"
          className="w-full p-2 mb-3 mt-4 rounded bg-gray-700 text-white placeholder-gray-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Enter password"
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white placeholder-gray-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button
          onClick={handleEmailLogin}
          className="w-full bg-blue-500 p-2 rounded mb-3 font-semibold hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login with Email"}
        </button>

        <div className="text-center text-gray-400 mb-3">OR</div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-600 p-2 rounded font-semibold hover:bg-red-700"
          disabled={loading}
        >
          Continue with Google
        </button>

        <div className="text-center mt-4 text-gray-400 text-sm">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-400 cursor-pointer hover:underline"
          >
            Register
          </span>
        </div>



      </div>
    </div>
  );
}