import React, { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import { apiRequest } from "../api/api";
import { useNavigate } from "react-router-dom";

const AddUser = () => {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const me = JSON.parse(localStorage.getItem("user"));
  const myRole = me.role?.name;

  const allowedRoles = useMemo(() => ({
    "super-admin": ["admin", "editor", "customer"],
    admin: ["editor", "customer"],
    editor: ["customer"],
  }), []);

  const loadRoles = useCallback(async () => {
    const res = await apiRequest("/roles");

    if (res.success) {
      const allRoles = res.roles;

      const roleName =
        typeof myRole === "string" ? myRole : myRole?.name ? myRole.name : "";

      if (!roleName || !allowedRoles[roleName]) {
        setRoles(allRoles);
        return;
      }

      const filtered = allRoles.filter((r) =>
        allowedRoles[roleName].includes(r.name)
      );

      setRoles(filtered);
    }
  }, [myRole, allowedRoles]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleSubmit = async () => {
    if (!name || !email || !password || !selectedRole) {
      return alert("All fields required");
    }

    const roleObj = roles.find((r) => r.name === selectedRole);
    if (!roleObj) return alert("Selected role not found");

    const res = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        role: roleObj._id,
      }),
    });

    if (res.success) {
      navigate("/users");
    } else {
      alert(res.message || "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div className="w-full flex flex-col">
        <Header />

        <div className="p-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full">

            {/* HEADER */}
            <div className="mb-6 pb-4 border-b border-gray-300 dark:border-gray-700">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Add New User
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Fill in the user details below.
              </p>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 gap-6">

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  className="w-full p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Select Role
                </label>
                <select
                  className="w-full p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">Choose a role</option>
                  {roles.map((r) => (
                    <option key={r._id} value={r.name}>
                      {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 mt-10">
              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-md transition"
              >
                Create User
              </button>

              <button
                onClick={() => navigate("/users")}
                className="px-6 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white text-lg font-semibold shadow-md transition"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default AddUser;
