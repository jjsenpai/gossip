import { ReactNode, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

export function ProtectedRoute({
  redirectTo = "/signin",
  children,
}: {
  redirectTo?: string;
  children?: ReactNode;
}) {
  const auth = useAuth();

  useEffect(() => {
    console.log(auth.currentUser);
  });

  if (!auth.currentUser) {
    return <Navigate to={redirectTo} />;
  }
  return children ? children : <Outlet />;
}
