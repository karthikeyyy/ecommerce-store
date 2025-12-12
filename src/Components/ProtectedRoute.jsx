import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" />;

  const userPermissions = user.permissions || [];

  if (
    requiredPermissions.length > 0 &&
    !(
      userPermissions.includes("*") ||
      requiredPermissions.some((p) => userPermissions.includes(p))
    )
  ) {
    return <Navigate to="/not-authorized" />;
  }

  return children;
};

export default ProtectedRoute;
