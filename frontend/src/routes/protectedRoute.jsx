//PREVENTS UNAUTHORIZED ACCESS TO PROTECTED ROUTES - CHECKS AUTH STATE AND REDIRECTS TO LOGIN IF NOT AUTHENTICATED

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children, requiredRole }) {
  const { token, role, user } = useAuth();
  const location = useLocation();
  const isLogout = localStorage.getItem("__logout_redirect") === "true";

  if (isLogout) {
    localStorage.removeItem("__logout_redirect");
    return <Navigate to="/" replace />;
  }

  // Rely on AuthContext (token/role/user) as the single source of truth.
  // Avoid trusting raw `localStorage.provider_user` which can be stale.
  const hasSession = Boolean(token && role);
  const isProviderSession = hasSession && role === "provider";
  const isApplicantSession = hasSession && role === "applicant";
  const sessionIsAdmin = hasSession && Boolean(user?.isAdmin);

  if (requiredRole === "admin") {
    if (isApplicantSession && sessionIsAdmin) {
      return children;
    }
    if (!isApplicantSession && isProviderSession && sessionIsAdmin) {
      return children;
    }

    if (isApplicantSession || isProviderSession) {
      return (
        <Navigate
          to="/unauthorized"
          replace
          state={{
            message: "You are not authorized to access this page.",
            from: location.pathname,
          }}
        />
      );
    }

    return (
      <Navigate
        to={isLogout ? "/" : "/auth-error"}  //this redirection doesn't work at all
        replace
        state={{
          loginPage: "", // No specific login page for admin - redirect to home
          message: "You must be logged in to access this page.",
          from: location.pathname,
        }}
      />
    );
  }

  if (requiredRole === "provider") {
    if (isProviderSession) {
      return children;
    }
    if (isApplicantSession) {
      return (
        <Navigate
          to="/unauthorized"
          replace
          state={{
            message: "You are not authorized to access this page.",
            from: location.pathname,
          }}
        />
      );
    }

    return (
      <Navigate
        to={isLogout ? "/" : "/auth-error"} //this redirection doesn't work at all
        replace
        state={{
          loginPage: "prov-login",
          message: "You must be logged in to access this page.",
          from: location.pathname,
        }}
      />
    );
  }

  if (requiredRole === "applicant") {
    if (isApplicantSession && role === "applicant") {
      return children;
    }
    if (isProviderSession || (isApplicantSession && role !== "applicant")) {
      return (
        <Navigate
          to="/unauthorized"
          replace
          state={{
            message: "You are not authorized to access this page.",
            from: location.pathname,
          }}
        />
      );
    }

    return (
      <Navigate
        to={isLogout ? "/" : "/auth-error"}
        replace
        state={{
          loginPage: "app-login",
          message: "You must be logged in to access this page.",
          from: location.pathname,
        }}
      />
    );
  }

  //Not logged in
  if (!isApplicantSession && !isProviderSession) {
    return (
      <Navigate
        to={isLogout ? "/" : "/auth-error"}
        replace
        state={{
          loginPage: requiredRole === "provider" ? "prov-login" : "app-login",
          message: "You must be logged in to access this page.",
          from: location.pathname,
        }}
      />
    );
  }

  //Wrong role
  if (requiredRole && role !== requiredRole) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          message: "You are not authorized to access this page.",
          from: location.pathname,
        }}
      />
    );
  }

  //Allowed
  return children;
}