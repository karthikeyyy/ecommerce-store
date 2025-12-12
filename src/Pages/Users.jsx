import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import { apiRequest } from "../api/api";
import { Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const me = JSON.parse(localStorage.getItem("user") || "{}");

  const myRoleName =
    typeof me.role === "string" ? me.role : me.role?.name || "";

  const rolePriority = {
    "super-admin": 3,
    admin: 2,
    editor: 1,
    customer: 0,
  };

  const canManage = (targetRole) => {
    const targetName =
      typeof targetRole === "string" ? targetRole : targetRole?.name || "";

    if (!myRoleName || !targetName) return false;

    const myPriority =
      rolePriority[myRoleName] !== undefined ? rolePriority[myRoleName] : -1;
    const targetPriority =
      rolePriority[targetName] !== undefined ? rolePriority[targetName] : -1;

    return myPriority > targetPriority;
  };

  const loadUsers = async () => {
    setLoading(true);
    const res = await apiRequest("/users");
    if (res.success) setUsers(res.users || []);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id, targetRole) => {
    if (!canManage(targetRole)) return alert("Not allowed");

    const res = await apiRequest(`/users/${id}`, {
      method: "DELETE",
    });

    if (res.success) loadUsers();
  };

  const canAddUser =
    myRoleName === "super-admin" ||
    myRoleName === "admin" ||
    myRoleName === "editor";

  const roleChipColor = (roleName) => {
    switch (roleName) {
      case "super-admin":
        return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";
      case "admin":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300";
      case "editor":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
      case "customer":
        return "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Header />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
                  <UsersIcon className="w-7 h-7 text-emerald-500" />
                  Users
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Manage roles, permissions, and access levels across your team.
                </p>
              </div>

              <button
                onClick={() => canAddUser && navigate("/users/add")}
                disabled={!canAddUser}
                className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition ${
                  canAddUser
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400"
                }`}
              >
                Add user
              </button>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between px-4 py-3 md:px-6 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-slate-400">
                    Team members
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    {users.length} user{users.length === 1 ? "" : "s"} in this workspace
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="px-4 py-6 md:px-6">
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-10 rounded-xl bg-gray-100 animate-pulse dark:bg-slate-800"
                      />
                    ))}
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="px-4 py-10 md:px-6 text-center text-sm text-gray-500 dark:text-slate-400">
                  No users found yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide dark:bg-slate-900/80 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 md:px-6 text-left">Name</th>
                        <th className="px-4 py-3 md:px-6 text-left">Email</th>
                        <th className="px-4 py-3 md:px-6 text-left">Role</th>
                        <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {users.map((u) => {
                        const roleName =
                          typeof u.role === "string"
                            ? u.role
                            : u.role?.name || "";

                        const manageable = canManage(roleName);

                        return (
                          <tr
                            key={u.id}
                            className="hover:bg-gray-50 dark:hover:bg-slate-900/60 transition-colors"
                          >
                            <td className="px-4 py-3 md:px-6">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                  {u.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                    {u.name}
                                  </span>
                                  <span className="text-xs text-gray-400 dark:text-slate-500">
                                    {roleName || "Unknown role"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 md:px-6 text-sm text-gray-700 dark:text-slate-200">
                              {u.email}
                            </td>
                            <td className="px-4 py-3 md:px-6">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-medium capitalize ${roleChipColor(
                                  roleName
                                )}`}
                              >
                                {roleName || "unknown"}
                              </span>
                            </td>
                            <td className="px-4 py-3 md:px-6 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  disabled={!manageable}
                                  onClick={() =>
                                    manageable &&
                                    navigate(`/users/${u.id}/edit`)
                                  }
                                  className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs ${
                                    manageable
                                      ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500"
                                  }`}
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  disabled={!manageable}
                                  onClick={() =>
                                    manageable &&
                                    handleDelete(u.id, roleName)
                                  }
                                  className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs ${
                                    manageable
                                      ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500"
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Users;
