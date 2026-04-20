// ─── Applicant auth ───────────────────────────────────────────────────────────
// Single-step Google login used by GoogleLoginButton + useAuth

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function loginWithGoogle(token, selectedRole) {
  if (!token) {
    throw new Error("Google OAuth token is missing from the response");
  }

  const response = await fetch(`${API_URL}/api/auth/applicant/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, selectedRole }),
  });

  if (!response.ok) {
    let message = "Login failed";
    try {
      const errorData = await response.json();
      message = errorData?.error || errorData?.message || message;
    } catch {
      // Ignore parse errors and keep the default message.
    }
    throw new Error(message);
  }

  return response.json(); // { user, token }
}


// ─── Provider auth ────────────────────────────────────────────────────────────
// Three-step flow used by ProviderGoogleLoginButton only.

export async function checkProviderUser(credential) {
  const res = await fetch(`${API_URL}/api/auth/provider/check-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: credential, selectedRole: "provider" }),
  });
  if (!res.ok) throw new Error("User check failed");
  return res.json(); // { exists: bool }
}

export async function signInProvider(credential) {
  const res = await fetch(`${API_URL}/api/auth/provider/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: credential, selectedRole: "provider" }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Sign in failed");
  
  const data = await res.json();
  
  // ✅ Log what the backend returns
  console.log("signInProvider response:", data);
  
  return data; // { success: bool, user, token, message? }
}

export async function signUpProvider(credential) {
  const res = await fetch(`${API_URL}/api/auth/provider/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: credential, selectedRole: "provider" }),
  });
  if (!res.ok) throw new Error("Sign up failed");
  return res.json(); // { success: bool, pending: bool, email: string, message? }
}