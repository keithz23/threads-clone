import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { JSX } from "react";
import Loading from "../pages/Loading";

export default function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (user) {
    const redirect =
      new URLSearchParams(location.search).get("redirect") || "/";
    return <Navigate to={redirect} replace />;
  }
  return children;
}
