//GOOGLE LOGIN BUTTON COMPONENT - TRIGGERS GOOGLE OAUTH FLOW AND HANDLES RESPONSE
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/useAuth";
import { loginWithGoogle } from "../../services/authService";

export default function GoogleLoginButton() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const handleSuccess = async (res) => {
    try {
      const googleToken = res.credential;
      const selectedRole = location.state?.role;

      const data = await loginWithGoogle(googleToken, selectedRole);

      login(data.user, data.token);

      if (data.user.role === "applicant") {
        navigate("/dashboard");
      }
      else if (data.user.role === "provider") {
        navigate("/pipeline");
      }

    } catch (err) {
      console.error("Login failed:", err);
      navigate("/auth-error");
    }
  };

  const handleError = () => {
    console.error("Google OAuth failed");
    navigate("/auth-error");
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
}