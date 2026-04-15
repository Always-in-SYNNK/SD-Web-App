//GOOGLE LOGIN BUTTON COMPONENT - TRIGGERS GOOGLE OAUTH FLOW AND HANDLES RESPONSE
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/useAuth";
import { loginWithGoogle } from "../../services/authService";

export default function GoogleLoginButton() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const selectedRole = "applicant";
  const loginPage = "app-login";


  const handleSuccess = async (res) => {
    try {
      const googleToken = res.credential;

      const data = await loginWithGoogle(googleToken, selectedRole);

      login(data.user, data.token);

      if (data.user.role === "applicant") {
        navigate("/dashboard");
      }
      else if (data.user.role === "provider") { //do i even handle this?
        navigate("/pipeline");
      }

    } catch (err) {
      console.error("Login failed:", err);
      navigate("/auth-error");
    }
  };

  const handleError = () => {
    console.error("Google OAuth failed"); //need to make sure tash's error page goes back to proper login page
    navigate("/auth-error", {
      state: {
        loginPage,
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