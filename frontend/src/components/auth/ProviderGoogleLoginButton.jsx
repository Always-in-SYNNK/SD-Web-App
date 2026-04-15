/**
 * ProviderGoogleLoginButton
 * Uses Google Identity Services with credential response
 */

import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkProviderUser,
  signInProvider,
  signUpProvider,
} from "../../services/authService";

export default function ProviderGoogleLoginButton({
  onVerificationRequired,
  onError,
  onLoadingChange,
}) {
  const navigate = useNavigate();

  const handleCredentialResponse = useCallback(async (response) => {
    onLoadingChange(true);
    onError(null);

    try {
      const idToken = response.credential;
      
      if (!idToken) {
        throw new Error("No credential received");
      }

      const { exists } = await checkProviderUser(idToken);

      if (exists) {
        const signinData = await signInProvider(idToken);

        if (signinData.success) {
          localStorage.setItem("provider_user", JSON.stringify(signinData.user));
          navigate("/pipeline");
        } else {
          onError(signinData.message || "Sign in failed");
        }
      } else {
        const signupData = await signUpProvider(idToken);

        if (signupData.success || signupData.pending) {
          onVerificationRequired(signupData.email || "your email");
        } else {
          onError(signupData.message || "Sign up failed");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      onError("Network error. Please try again.");
    } finally {
      onLoadingChange(false);
    }
  }, [onLoadingChange, onError, navigate, onVerificationRequired]);

  useEffect(() => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById("google-button-container"),
        {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: "100%",
        }
      );
    } else {
      console.error("Google Identity Services not loaded");
    }
  }, [handleCredentialResponse]);

  return (
    <section
      id="google-button-container"
      className="w-full flex items-center justify-center"
    />
  );
}