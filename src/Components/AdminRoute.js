import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" />; // redirect to main site
  }

  return children;
};

export default AdminRoute;
