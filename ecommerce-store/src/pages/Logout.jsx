import React from "react";

const Logout = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");     // remove token
    window.location.href = "/login";      // redirect to login
  };

  return (
    <button onClick={handleLogout} className=" text-gray-700 px-4 py-2 rounded transition">
       Logout
       </button>
  );
};

export default Logout;
