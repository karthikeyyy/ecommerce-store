import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Layout/Header.jsx";
import Footer from "../Components/Layout/Footer.jsx";
import { apiRequest } from "../api/api.js";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [password, setPassword] = useState("");
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [userRes, roleRes] = await Promise.all([
        apiRequest(`/users/${id}`),
        apiRequest("/roles")
      ]);

      if (userRes.success) {
        const roleObj = userRes.user.role;

        setUser({
          id: userRes.user.id,
          name: userRes.user.name,
          email: userRes.user.email,
          role: roleObj._id
        });

        setIsSuperAdminUser(roleObj.name === "super-admin");
      }

      if (roleRes.success) {
        const filteredRoles = roleRes.roles.filter(
          (r) => r.name.toLowerCase() !== "super-admin"
        );
        setRoles(filteredRoles);
      }

      setLoading(false);
    } catch (err) {
      console.log("Error:", err);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (isSuperAdminUser) return alert("Super admin cannot be edited.");

    const payload = {
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (password.trim() !== "") {
      payload.password = password;
    }

    const res = await apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });

    if (res.success) {
      navigate("/users");
    } else {
      alert(res.message);
    }
  };

  if (loading || !user)
    return <p className="text-center text-lg p-10">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="w-full flex flex-col">
        <Header />

        <div className="p-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full p-8">

            {/* HEADER */}
            <div className="mb-6 pb-4 border-b border-gray-300 dark:border-gray-700">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Edit User
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Update user information below.
              </p>
            </div>

            {isSuperAdminUser && (
              <div className="p-4 mb-5 rounded-xl bg-red-100 text-red-900 font-semibold">
                Super admin cannot be edited.
              </div>
            )}

            {/* FORM */}
            <div className="grid grid-cols-1 gap-6">

              {/* NAME */}
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  disabled={isSuperAdminUser}
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-900 disabled:bg-gray-300"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  disabled={isSuperAdminUser}
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="w-full p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-900 disabled:bg-gray-300"
                />
              </div>

              {/* PASSWORD (OPTIONAL) */}
              {!isSuperAdminUser && (
                <div>
                  <label className="block font-semibold mb-1">New Password (Optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
                    placeholder="Leave empty if you don't want to change password"
                  />
                </div>
              )}

              {/* ROLE */}
              <div>
                <label className="block font-semibold mb-1">Select Role</label>
                <select
                  value={user.role}
                  disabled={isSuperAdminUser}
                  onChange={(e) => setUser({ ...user, role: e.target.value })}
                  className="w-full p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-900 disabled:bg-gray-300"
                >
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 mt-10 border-t pt-6 dark:border-gray-700">
              <button
                onClick={() => navigate("/users")}
                className="px-6 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white shadow"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={isSuperAdminUser}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow disabled:bg-gray-400"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default EditUser;
