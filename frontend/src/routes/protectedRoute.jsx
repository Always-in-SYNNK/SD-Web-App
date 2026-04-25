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

  let providerRole = null;
  let providerIsAdmin = false;

  try {
    const providerUser = localStorage.getItem("provider_user");
    if (providerUser) {
      const parsedProviderUser = JSON.parse(providerUser);
      providerRole = parsedProviderUser?.role || null;
      providerIsAdmin = Boolean(parsedProviderUser?.isAdmin);
    }
  } catch {
    localStorage.removeItem("provider_user");
  }

  const hasApplicantSession = Boolean(token && role);
  const hasProviderSession = providerRole === "provider";
  const isAdmin = Boolean(user?.isAdmin) || providerIsAdmin;

  if (requiredRole === "admin") {
    if (isAdmin && (hasApplicantSession || hasProviderSession)) {
      return children;
    }

    if (hasApplicantSession || hasProviderSession) {
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

  if (requiredRole === "provider") {
    if (hasProviderSession) {
      return children;
    }

    if (hasApplicantSession) {
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
          loginPage: "prov-login",
          message: "You must be logged in to access this page.",
          from: location.pathname,
        }}
      />
    );
  }

  if (requiredRole === "applicant") {
    if (hasApplicantSession && role === "applicant") {
      return children;
    }

    if (hasProviderSession || (hasApplicantSession && role !== "applicant")) {
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
  if (!hasApplicantSession && !hasProviderSession) {
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