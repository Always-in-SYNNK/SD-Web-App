import { GoogleLogin } from "@react-oauth/google";
import { useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import { loginWithGoogle } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function GoogleLoginButton({ selectedRole, from, onLoadingChange, onSuccess }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = useCallback(async (res) => {
    onLoadingChange?.(true);
    try {
      const googleToken = res.credential;
      const data = await loginWithGoogle(googleToken, selectedRole);

      if (data.user.role !== selectedRole) {
        navigate("/auth-error", {
          state: {
            loginPage: "prov-login",
            message: "This account is registered as a provider. Please log in through the provider portal.",
          },
        });
        return;
      }

      // ✅ pass isNewUser as third argument
      login(data.user, data.token, data.isNewUser);

      // ✅ let the parent page handle routing
      onSuccess?.(data);

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
  }, [onLoadingChange, selectedRole, navigate, login, onSuccess]);

  const handleError = useCallback(() => {
    console.error("Google OAuth failed");
    navigate("/auth-error", {
      state: {
        loginPage: "app-login",
        message: "Google sign-in was cancelled or failed. Please try again.",
      },
    });
  }, [navigate]);

  return (
    <div className="w-full flex items-center justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        auto_select={false}
        prompt="select_account"
      />
    </div>
  );
}