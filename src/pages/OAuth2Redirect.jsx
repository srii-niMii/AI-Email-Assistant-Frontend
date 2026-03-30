import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token); 
      navigate("/dashboard"); 
    } else {
      navigate("/"); 
    }
  }, [navigate]);

  return <p>Redirecting...</p>;
};

export default OAuth2RedirectHandler;