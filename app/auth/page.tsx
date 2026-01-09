"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          "https://room-finder-theta.vercel.app/auth/callback",
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the login link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="border p-6 rounded w-96">
        <h1 className="text-xl font-bold mb-4 text-center">
          Owner Login
        </h1>

        <input
          type="email"
          placeholder="Enter your email"
          className="input w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Sending..." : "Send Login Link"}
        </button>
      </div>
    </div>
  );
}
