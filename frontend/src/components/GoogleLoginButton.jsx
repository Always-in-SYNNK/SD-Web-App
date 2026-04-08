//GOOGLE LOGIN BUTTON COMPONENT - TRIGGERS GOOGLE OAUTH FLOW AND HANDLES RESPONSE

import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { loginWithGoogle } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function GoogleLoginButton() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (res) => {
    try {
      const googleToken = res.credential;
      const role = localStorage.getItem("selectedRole");

      const data = await loginWithGoogle(googleToken, role);

      // Save to context
      login(data.user, data.token);

      // Redirect based on role
      if (data.user.role === "applicant") {
        navigate("/student-dashboard");
      } else {
        navigate("/employer-dashboard"); //doubloe check if this navigation is handled here
      }

    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={() => console.log("Login Failed")} />;
}

/*import { GoogleLogin } from "@react-oauth/google";

export default function GoogleLoginButton() {
  const handleSuccess = async (res) => {
    const token = res.credential; //Google token received from Google after successful login
    const role = localStorage.getItem("selectedRole");

    //sending token and role to backend for verification and own JWT token generation
    const response = await fetch("http://localhost:5000/api/auth/google", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, role }),
    });

    const data = await response.json();

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "/dashboard"; //redirect to dashboard after login - check name
  };

  return <GoogleLogin onSuccess={handleSuccess} />;
}*/