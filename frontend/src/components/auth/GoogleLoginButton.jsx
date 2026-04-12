//GOOGLE LOGIN BUTTON COMPONENT - TRIGGERS GOOGLE OAUTH FLOW AND HANDLES RESPONSE

import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/useAuth";
import { loginWithGoogle } from "../../services/authService";

export default function GoogleLoginButton({ setPage }) {
  const { login } = useAuth();

  const handleSuccess = async (res) => {
    try {
      const googleToken = res.credential;
      const selectedRole = localStorage.getItem("selectedRole");

      const data = await loginWithGoogle(googleToken, selectedRole);

      login(data.user, data.token, data.user.role || selectedRole);

      if (data.user.role === "applicant") {
        setPage("dashboard");
      } //add other roles and redirects as needed

    } catch (err) {
      console.error("Login failed:", err);
      setPage("autherror");
    }
  };

  const handleError = () => {
    console.error("Google OAuth failed");
    setPage("autherror");
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
}