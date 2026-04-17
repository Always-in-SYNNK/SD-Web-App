//GOOGLE LOGIN BUTTON COMPONENT - TRIGGERS GOOGLE OAUTH FLOW AND HANDLES RESPONSE
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/useAuth";
import { loginWithGoogle } from "../../services/authService";

export default function GoogleLoginButton({ selectedRole, from, onLoadingChange }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (res) => {
    onLoadingChange?.(true);
    try {
      const googleToken = res.credential;

      const data = await loginWithGoogle(googleToken, selectedRole);

      if (data.user.role !== selectedRole) {
      navigate("/auth-error", {
        state: {
          loginPage: "prov-login",
          message:
              "This account is registered as a provider. Please log in through the provider portal.",
        },
      });
      return;
    }

      login(data.user, data.token);

      if (data.user.role === "applicant") {
        navigate(from, { replace: true });
      }

    } catch (err) {
      console.error("Login failed:", err);
      navigate("/auth-error", {
        state: {
          loginPage: selectedRole === "provider" ? "prov-login" : "app-login",
          message: err?.message || "Authentication failed. Please try again.",
        },
      });
    } finally {
      onLoadingChange?.(false);
    }
  };

  const handleError = () => {
    console.error("Google OAuth failed"); 
    navigate("/auth-error", {
      state: {
        loginPage: "app-login",
        message: "Google sign-in was cancelled or failed. Please try again.",
      },
    });
  };
 
  return (
    <div className="w-full flex items-center justify-center">
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}