"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://room-finder-theta.vercel.app/owner/dashboard",
      },
    });

    alert("Check your email for the login link");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="border p-6 rounded w-96">
        <h1 className="text-xl font-bold mb-4">Owner Login</h1>

        <input
          type="email"
          placeholder="Enter email"
          className="input w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          Send Login Link
        </button>
      </div>
    </div>
  );
}
