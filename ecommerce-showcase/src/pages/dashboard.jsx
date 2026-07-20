import React, { useEffect, useState } from "react";
import { supabase } from "../assets/subabaseclient";
import { useNavigate } from "react-router-dom";
import UserDashboard from "./pages/UserDashboard";
export default function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/");
      return;
    }

    setUser(user);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-5">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-slate-800 rounded-2xl p-8 shadow-lg flex flex-col md:flex-row items-center gap-6">

          <img
            src={
              user.user_metadata?.avatar_url ||
              "https://ui-avatars.com/api/?name=User"
            }
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-cyan-500"
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              Welcome,{" "}
              {user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                "User"}
            </h1>

            <p className="text-gray-300 mt-2">
              {user.email}
            </p>

            <p className="mt-4 text-gray-400">
              You are successfully logged in with Google.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">
              👤 Profile
            </h2>

            <p>Name</p>
            <p className="text-gray-400">
              {user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                "Not Available"}
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">
              📧 Email
            </h2>

            <p className="text-gray-400">
              {user.email}
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">
              🆔 User ID
            </h2>

            <p className="text-gray-400 break-all">
              {user.id}
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">
              ⚙️ Settings
            </h2>

            <p className="text-gray-400">
              Settings page coming soon.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">
              ❤️ Wishlist
            </h2>

            <p className="text-gray-400">
              No items added yet.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">
              🔐 Account
            </h2>

            <p className="text-gray-400">
              Logged in using Google Authentication.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}